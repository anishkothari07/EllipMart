import { prisma as db } from '@corecart/database';
import { MediaVisibility, MediaStatus, AssetType } from "@prisma/client";
import path from "path";
import { storageRegistry } from "./storage/storage.registry";
import { ImageProcessor } from "./image.processor";
import { AppError } from '@corecart/shared';

export interface UploadMediaInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  altText?: string;
  caption?: string;
  folderId?: string;
  collectionIds?: string[];
  tags?: string[];
  uploadedById?: string;
  visibility?: MediaVisibility;
  allowDuplicate?: boolean;
  derivedFromId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SearchMediaParams {
  query?: string;
  fileHash?: string;
  folderId?: string | null;
  collectionId?: string;
  mimeType?: string;
  assetType?: AssetType;
  status?: MediaStatus;
  visibility?: MediaVisibility;
  tag?: string;
  dominantColor?: string;
  page?: number;
  limit?: number;
}

function detectAssetType(mimeType: string, ext: string): AssetType {
  const cleanExt = ext.toLowerCase().replace(".", "");
  if (mimeType.startsWith("image/")) {
    if (cleanExt === "svg" || mimeType.includes("svg")) return AssetType.SVG;
    return AssetType.IMAGE;
  }
  if (mimeType.startsWith("video/")) return AssetType.VIDEO;
  if (mimeType.startsWith("audio/")) return AssetType.AUDIO;
  if (mimeType === "application/pdf" || cleanExt === "pdf") return AssetType.PDF;
  if (["glb", "gltf", "obj", "usdz", "fbx"].includes(cleanExt)) return AssetType.MODEL_3D;
  if (["ttf", "otf", "woff", "woff2"].includes(cleanExt)) return AssetType.FONT;
  if (cleanExt === "json") return AssetType.LOTTIE;
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "txt"].includes(cleanExt)) return AssetType.DOCUMENT;
  return AssetType.OTHER;
}

export class MediaService {
  /**
   * Upload and process a new digital asset (Enterprise Asset Platform)
   */
  async uploadMedia(input: UploadMediaInput) {
    const {
      buffer,
      originalName,
      mimeType,
      altText,
      caption,
      folderId,
      collectionIds = [],
      tags = [],
      uploadedById,
      visibility = MediaVisibility.PUBLIC,
      allowDuplicate = false,
      derivedFromId,
      metadata: customMetadata,
    } = input;

    // 1. Calculate File Hash (SHA-256)
    const fileHash = ImageProcessor.calculateFileHash(buffer);

    // 2. Check for Duplicates if not allowed
    if (!allowDuplicate) {
      const existing = await db.media.findFirst({
        where: { fileHash, deletedAt: null },
        include: { folder: true, variants: true, assetMetadata: true }
      });
      if (existing) {
        return { media: existing, isDuplicate: true };
      }
    }

    // 3. Resolve Folder Path
    let folderPath = "";
    if (folderId) {
      const folder = await db.mediaFolder.findUnique({ where: { id: folderId } });
      if (folder) folderPath = folder.slug;
    }

    // 4. Detect Asset Type
    const ext = path.extname(originalName) || `.${mimeType.split("/")[1] || "bin"}`;
    const assetType = detectAssetType(mimeType, ext);

    // 5. Generate Unique Filename & Upload Original
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${baseName}_${Date.now()}${ext.toLowerCase()}`;

    const storage = storageRegistry.resolve();
    const uploadResult = await storage.upload({
      fileName: uniqueFileName,
      folderPath,
      mimeType,
      buffer,
    });

    // 6. Extract Image Metadata if image
    const imageMeta = await ImageProcessor.extractMetadata(buffer, mimeType);

    // 7. Create Media Record
    const media = await db.media.create({
      data: {
        assetType,
        assetKey: uploadResult.storagePath,
        derivedFromId: derivedFromId || null,
        filename: uniqueFileName,
        originalName,
        mimeType,
        extension: ext.toLowerCase().replace(".", ""),
        size: buffer.length,
        fileHash,
        width: imageMeta.width,
        height: imageMeta.height,
        aspectRatio: imageMeta.aspectRatio,
        dominantColor: imageMeta.dominantColor,
        blurHash: imageMeta.blurHash,
        storageProvider: uploadResult.storageProvider,
        path: uploadResult.storagePath,
        publicUrl: uploadResult.publicUrl,
        alt: altText || originalName,
        caption,
        folderId: folderId || null,
        uploadedById: uploadedById || null,
        visibility,
        status: MediaStatus.ACTIVE,
      },
    });

    // 8. Store Key-Value AssetMetadata
    if (customMetadata && Object.keys(customMetadata).length > 0) {
      for (const [key, value] of Object.entries(customMetadata)) {
        await this.setMetadata(media.id, key, String(value), typeof value === "number" ? "NUMBER" : typeof value === "boolean" ? "BOOLEAN" : "STRING");
      }
    }

    // 9. Associate Collections & Tags
    if (collectionIds.length > 0) {
      await db.mediaCollectionMapping.createMany({
        data: collectionIds.map((collectionId) => ({ mediaId: media.id, collectionId })),
        skipDuplicates: true,
      });
    }

    if (tags.length > 0) {
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const tag = await db.mediaTag.upsert({
          where: { slug },
          update: {},
          create: { name: tagName, slug },
        });
        await db.mediaTagMapping.create({
          data: { mediaId: media.id, tagId: tag.id },
        }).catch(() => {});
      }
    }

    // 10. Background Async Queue Job for Variant Generation
    this.processVariantsAsync(media.id, buffer, mimeType, folderPath);

    // 11. Audit Log
    this.logAudit("CREATE_ASSET", media.id, { originalName, assetType, size: buffer.length });

    return { media, isDuplicate: false };
  }

  /**
   * Set dynamic key-value AssetMetadata (Ready for camera, lens, DPI, AI prompts, seed, steps)
   */
  async setMetadata(mediaId: string, key: string, value: string, type: string = "STRING") {
    return await db.assetMetadata.upsert({
      where: { mediaId_key: { mediaId, key } },
      update: { value, type },
      create: { mediaId, key, value, type },
    });
  }

  /**
   * Get all metadata for an asset
   */
  async getMetadata(mediaId: string) {
    return await db.assetMetadata.findMany({ where: { mediaId } });
  }

  /**
   * Asynchronously generate and store image variants
   */
  private async processVariantsAsync(mediaId: string, buffer: Buffer, mimeType: string, folderPath: string) {
    try {
      const variants = await ImageProcessor.generateVariants(buffer, mimeType);
      if (variants.length === 0) return;

      const storage = storageRegistry.resolve();

      for (const v of variants) {
        const variantFileName = `${mediaId}_${v.variantName.toLowerCase()}.${v.extension}`;
        const uploadResult = await storage.upload({
          fileName: variantFileName,
          folderPath: folderPath ? `${folderPath}/variants` : "variants",
          mimeType: v.mimeType,
          buffer: v.buffer,
        });

        await db.mediaVariant.upsert({
          where: {
            mediaId_variantName: {
              mediaId,
              variantName: v.variantName,
            },
          },
          update: {
            width: v.width,
            height: v.height,
            size: v.buffer.length,
            mimeType: v.mimeType,
            storagePath: uploadResult.storagePath,
            publicUrl: uploadResult.publicUrl,
          },
          create: {
            mediaId,
            variantName: v.variantName,
            width: v.width,
            height: v.height,
            size: v.buffer.length,
            mimeType: v.mimeType,
            storagePath: uploadResult.storagePath,
            publicUrl: uploadResult.publicUrl,
          },
        });
      }
    } catch (err) {
      console.error(`Failed variant generation for media ${mediaId}:`, err);
    }
  }

  /**
   * Replace a media file while preserving the Media ID and storing Version History
   */
  async replaceMedia(mediaId: string, buffer: Buffer, originalName: string, mimeType: string, createdById?: string) {
    const existing = await db.media.findUnique({
      where: { id: mediaId },
      include: { versions: true },
    });

    if (!existing) throw new AppError("Media asset not found", 404);

    // 1. Create MediaVersion snapshot of existing asset
    const nextVersionNum = existing.versions.length + 1;
    await db.mediaVersion.create({
      data: {
        mediaId: existing.id,
        versionNumber: nextVersionNum,
        fileName: existing.filename,
        storagePath: existing.path,
        publicUrl: existing.publicUrl,
        fileHash: existing.fileHash,
        size: existing.size,
        mimeType: existing.mimeType,
        createdById: createdById || null,
      },
    });

    // 2. Upload replacement file
    const fileHash = ImageProcessor.calculateFileHash(buffer);
    const ext = path.extname(originalName) || `.${mimeType.split("/")[1] || "bin"}`;
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${baseName}_v${nextVersionNum + 1}_${Date.now()}${ext.toLowerCase()}`;

    const storage = storageRegistry.resolve(existing.storageProvider);
    const uploadResult = await storage.upload({
      fileName: uniqueFileName,
      folderPath: "",
      mimeType,
      buffer,
    });

    const metadata = await ImageProcessor.extractMetadata(buffer, mimeType);

    // 3. Update Media Record
    const updated = await db.media.update({
      where: { id: mediaId },
      data: {
        assetKey: uploadResult.storagePath,
        filename: uniqueFileName,
        originalName,
        mimeType,
        extension: ext.toLowerCase().replace(".", ""),
        size: buffer.length,
        fileHash,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio,
        dominantColor: metadata.dominantColor,
        blurHash: metadata.blurHash,
        path: uploadResult.storagePath,
        publicUrl: uploadResult.publicUrl,
      },
    });

    // 4. Re-generate variants
    this.processVariantsAsync(mediaId, buffer, mimeType, "");

    this.logAudit("REPLACE_ASSET", mediaId, { newVersion: nextVersionNum + 1 });

    return updated;
  }

  /**
   * Rollback a media asset to a previous version
   */
  async rollbackVersion(mediaId: string, versionNumber: number) {
    const version = await db.mediaVersion.findUnique({
      where: { mediaId_versionNumber: { mediaId, versionNumber } },
    });

    if (!version) throw new AppError("Target media version not found", 404);

    const updated = await db.media.update({
      where: { id: mediaId },
      data: {
        filename: version.fileName,
        path: version.storagePath,
        assetKey: version.storagePath,
        publicUrl: version.publicUrl,
        fileHash: version.fileHash,
        size: version.size,
        mimeType: version.mimeType,
      },
    });

    this.logAudit("ROLLBACK_ASSET", mediaId, { rolledBackToVersion: versionNumber });
    return updated;
  }

  /**
   * Search and List Media Assets
   */
  async searchMedia(params: SearchMediaParams) {
    const {
      query,
      fileHash,
      folderId,
      collectionId,
      mimeType,
      assetType,
      status = MediaStatus.ACTIVE,
      visibility,
      tag,
      dominantColor,
      page = 1,
      limit = 30,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: status === MediaStatus.ARCHIVED ? { not: null } : null,
      status: status === MediaStatus.ARCHIVED ? undefined : status,
    };

    if (assetType) where.assetType = assetType;
    if (fileHash) where.fileHash = fileHash;
    if (folderId !== undefined) where.folderId = folderId;
    if (visibility) where.visibility = visibility;
    if (dominantColor) where.dominantColor = { contains: dominantColor };
    if (mimeType) {
      if (mimeType === "image") where.mimeType = { startsWith: "image/" };
      else if (mimeType === "video") where.mimeType = { startsWith: "video/" };
      else if (mimeType === "document") where.mimeType = { in: ["application/pdf", "application/zip", "application/msword"] };
      else where.mimeType = mimeType;
    }

    if (collectionId) {
      where.collections = { some: { collectionId } };
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag.toLowerCase() } } };
    }

    if (query) {
      where.OR = [
        { filename: { contains: query } },
        { originalName: { contains: query } },
        { alt: { contains: query } },
        { caption: { contains: query } },
        { aiCaption: { contains: query } },
        { ocrText: { contains: query } },
        { scene: { contains: query } },
        { brand: { contains: query } },
      ];
    }

    const [items, total] = await Promise.all([
      db.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variants: true,
          folder: true,
          tags: { include: { tag: true } },
          collections: { include: { collection: true } },
          usages: true,
          assetMetadata: true,
          derivedFrom: true,
          derivedAssets: true,
        },
      }),
      db.media.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Attach relational usage of media to an entity (Product, Category, etc.)
   */
  async attachUsage(mediaId: string, entityType: string, entityId: string, field?: string) {
    await db.mediaUsage.create({
      data: { mediaId, entityType, entityId, field },
    }).catch(() => {});

    // Increment cached usageCount
    await db.media.update({
      where: { id: mediaId },
      data: { usageCount: { increment: 1 } },
    });
  }

  /**
   * Detach relational usage
   */
  async detachUsage(mediaId: string, entityType: string, entityId: string, field?: string) {
    await db.mediaUsage.deleteMany({
      where: { mediaId, entityType, entityId, field: field || undefined },
    });

    await db.media.update({
      where: { id: mediaId },
      data: { usageCount: { decrement: 1 } },
    });
  }

  /**
   * Delete a media asset with active usage safety check
   */
  async deleteMedia(mediaId: string, force: boolean = false) {
    const media = await db.media.findUnique({
      where: { id: mediaId },
      include: { usages: true },
    });

    if (!media) throw new AppError("Media asset not found", 404);

    if (media.usages.length > 0 && !force) {
      const usageSummary = media.usages.map((u) => `${u.entityType} (${u.entityId})`).join(", ");
      throw new AppError(
        `Cannot delete media asset because it is currently in active use by: ${usageSummary}`,
        400
      );
    }

    if (force) {
      // Hard delete from storage & database
      const storage = storageRegistry.resolve(media.storageProvider);
      await storage.delete(media.path);
      await db.media.delete({ where: { id: mediaId } });
      this.logAudit("PERMANENT_DELETE_ASSET", mediaId, {});
      return { success: true, hardDeleted: true };
    } else {
      // Soft delete
      await db.media.update({
        where: { id: mediaId },
        data: { status: MediaStatus.ARCHIVED, deletedAt: new Date() },
      });
      this.logAudit("SOFT_DELETE_ASSET", mediaId, {});
      return { success: true, softDeleted: true };
    }
  }

  /**
   * Restore soft-deleted media asset
   */
  async restoreMedia(mediaId: string) {
    const updated = await db.media.update({
      where: { id: mediaId },
      data: { status: MediaStatus.ACTIVE, deletedAt: null },
    });
    this.logAudit("RESTORE_ASSET", mediaId, {});
    return updated;
  }

  /**
   * Bulk operations (Move, Tag, Delete)
   */
  async bulkMove(mediaIds: string[], folderId: string | null) {
    await db.media.updateMany({
      where: { id: { in: mediaIds } },
      data: { folderId },
    });
    return { success: true, count: mediaIds.length };
  }

  async bulkTag(mediaIds: string[], tags: string[]) {
    for (const mediaId of mediaIds) {
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const tag = await db.mediaTag.upsert({
          where: { slug },
          update: {},
          create: { name: tagName, slug },
        });
        await db.mediaTagMapping.create({
          data: { mediaId, tagId: tag.id },
        }).catch(() => {});
      }
    }
    return { success: true, count: mediaIds.length };
  }

  async bulkDelete(mediaIds: string[], force: boolean = false) {
    const results = [];
    for (const id of mediaIds) {
      try {
        const res = await this.deleteMedia(id, force);
        results.push({ id, success: true, res });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  /**
   * Folder & Collection Management
   */
  async createFolder(name: string, parentId?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return await db.mediaFolder.upsert({
      where: { slug },
      update: { name },
      create: { name, slug, parentId: parentId || null },
    });
  }

  async getFolders() {
    return await db.mediaFolder.findMany({
      include: { children: true, _count: { select: { media: true } } },
      orderBy: { name: "asc" },
    });
  }

  async createCollection(name: string, description?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return await db.mediaCollection.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description },
    });
  }

  async getCollections() {
    return await db.mediaCollection.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" },
    });
  }

  private async logAudit(action: string, entityId: string, metadata: any) {
    try {
      await db.auditLog.create({
        data: {
          entityType: "Media",
          entityId,
          action,
          changes: JSON.stringify(metadata),
        },
      });
    } catch {}
  }
}

export const mediaService = new MediaService();
