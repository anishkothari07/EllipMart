'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  Image as ImageIcon,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  Move,
  History,
  RotateCcw,
  Copy,
  ExternalLink,
  Check,
  X,
  FileText,
  Video,
  Grid,
  List,
  Layers,
  Sparkles,
  Info,
  ShieldAlert,
  Download
} from 'lucide-react';
import { Container } from '@/components/shared/container';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  aspectRatio?: number | null;
  fileHash?: string | null;
  storageProvider: string;
  publicUrl: string | null;
  path: string;
  alt?: string | null;
  caption?: string | null;
  dominantColor?: string | null;
  blurHash?: string | null;
  focusX?: number;
  focusY?: number;
  usageCount?: number;
  folderId?: string | null;
  createdAt: string;
  variants?: any[];
  versions?: any[];
  usages?: any[];
  folder?: any;
}

export function MediaLibraryView({
  isPicker = false,
  onSelectMedia,
}: {
  isPicker?: boolean;
  onSelectMedia?: (media: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected Item for Inspector Drawer
  const [inspectorItem, setInspectorItem] = useState<MediaItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Upload Modal State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Folder State
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);

  // Delete Error State
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [selectedFolderId, selectedCollectionId, searchQuery, mimeFilter]);

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/v1/media/folder');
      const data = await res.json();
      if (data.success) setFolders(data.data || []);
    } catch (err) {}
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/v1/media/collection');
      const data = await res.json();
      if (data.success) setCollections(data.data || []);
    } catch (err) {}
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedFolderId) params.set('folderId', selectedFolderId);
      if (selectedCollectionId) params.set('collectionId', selectedCollectionId);
      if (searchQuery) params.set('query', searchQuery);
      if (mimeFilter !== 'all') params.set('mimeType', mimeFilter);

      const res = await fetch(`/api/v1/media?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
      if (selectedFolderId) formData.append('folderId', selectedFolderId);

      setUploadProgress(60);
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      setUploadProgress(100);
      if (data.success) {
        setUploadOpen(false);
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/v1/media/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName('');
        setShowFolderModal(false);
        fetchFolders();
      }
    } catch (err) {}
  };

  const handleDeleteMedia = async (mediaId: string, force: boolean = false) => {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/v1/media/${mediaId}?force=${force}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setInspectorItem(null);
        fetchMedia();
      } else {
        setDeleteError(data.error || 'Failed to delete media');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Deletion failed');
    }
  };

  const handleRollback = async (mediaId: string, versionNumber: number) => {
    try {
      const res = await fetch(`/api/v1/media/${mediaId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionNumber }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
        if (inspectorItem) {
          const detailRes = await fetch(`/api/v1/media/${mediaId}`);
          const detailData = await detailRes.json();
          if (detailData.success) setInspectorItem(detailData.data);
        }
      }
    } catch (err) {}
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('flex flex-col h-full bg-background min-h-[650px]', isPicker && 'p-2')}>
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Digital Asset Manager</h1>
            <p className="text-xs text-muted-foreground">Centralized Media Engine & Storage Abstraction</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium transition-colors hover:bg-accent cursor-pointer"
          >
            <FolderPlus className="size-4" /> New Folder
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90 cursor-pointer"
          >
            <UploadCloud className="size-4" /> Upload Files
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[220px_1fr] overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="flex flex-col gap-4 border-r border-border p-4 bg-muted/10 overflow-y-auto">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Folders
            </span>
            <div className="mt-2 flex flex-col gap-1">
              <button
                onClick={() => { setSelectedFolderId(null); setSelectedCollectionId(null); }}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                  selectedFolderId === null && selectedCollectionId === null
                    ? 'bg-accent font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <span className="flex items-center gap-2">
                  <Folder className="size-4 text-amber-500" /> All Assets
                </span>
                <span className="text-[10px] text-muted-foreground">{items.length}</span>
              </button>

              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFolderId(f.id); setSelectedCollectionId(null); }}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                    selectedFolderId === f.id
                      ? 'bg-accent font-semibold text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Folder className="size-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">{f._count?.media || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Collections / Albums
            </span>
            <div className="mt-2 flex flex-col gap-1">
              {collections.length === 0 ? (
                <span className="text-xs text-muted-foreground italic px-3 py-1">No collections</span>
              ) : (
                collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCollectionId(c.id); setSelectedFolderId(null); }}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                      selectedCollectionId === c.id
                        ? 'bg-accent font-semibold text-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Layers className="size-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">{c._count?.items || 0}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Central Asset Browser */}
        <div className="flex flex-col flex-1 overflow-hidden bg-background">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assets by filename, SHA-256 hash, alt text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-foreground/30"
                />
              </div>

              <select
                value={mimeFilter}
                onChange={(e) => setMimeFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30"
              >
                <option value="all">All File Types</option>
                <option value="image">Images (PNG, JPG, WebP)</option>
                <option value="video">Videos (MP4, MOV)</option>
                <option value="document">Documents (PDF, ZIP)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-medium cursor-pointer',
                  viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <Grid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-medium cursor-pointer',
                  viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Grid / List Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-accent/30 animate-pulse border border-border" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ImageIcon className="size-12 text-muted-foreground/40 mb-3" />
                <h3 className="text-base font-semibold">No digital assets found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Upload images, videos, or documents to manage them in your enterprise DAM.
                </p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-foreground px-4 text-xs font-medium text-background cursor-pointer"
                >
                  <UploadCloud className="size-4" /> Upload Asset Now
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => {
                  const isSelected = inspectorItem?.id === item.id;
                  const isImage = item.mimeType.startsWith('image/');
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setInspectorItem(item);
                        if (isPicker && onSelectMedia) onSelectMedia(item);
                      }}
                      className={cn(
                        'group relative flex flex-col rounded-2xl border bg-background overflow-hidden cursor-pointer transition-all hover:shadow-md',
                        isSelected ? 'border-foreground ring-2 ring-foreground/20' : 'border-border'
                      )}
                    >
                      <div className="relative aspect-square w-full bg-accent/20 flex items-center justify-center overflow-hidden">
                        {isImage ? (
                          <img
                            src={item.publicUrl || item.path || '/placeholder.svg'}
                            alt={item.alt || item.originalName}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : item.mimeType.startsWith('video/') ? (
                          <Video className="size-10 text-muted-foreground/60" />
                        ) : (
                          <FileText className="size-10 text-muted-foreground/60" />
                        )}

                        {item.usageCount && item.usageCount > 0 ? (
                          <span className="absolute top-2 right-2 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[10px] font-semibold shadow-xs">
                            {item.usageCount} Usages
                          </span>
                        ) : null}
                      </div>

                      <div className="p-2.5 flex flex-col gap-0.5">
                        <span className="text-xs font-medium truncate text-foreground" title={item.originalName}>
                          {item.originalName}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{formatBytes(item.size)}</span>
                          <span className="uppercase">{item.extension || 'file'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInspectorItem(item);
                      if (isPicker && onSelectMedia) onSelectMedia(item);
                    }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border bg-background cursor-pointer transition-all hover:bg-accent/40',
                      inspectorItem?.id === item.id ? 'border-foreground bg-accent/30' : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-accent/30 flex items-center justify-center overflow-hidden shrink-0">
                        {item.mimeType.startsWith('image/') ? (
                          <img src={item.publicUrl || '/placeholder.svg'} alt="" className="size-full object-cover" />
                        ) : (
                          <FileText className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{item.originalName}</span>
                        <span className="text-[10px] text-muted-foreground">{item.filename}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span>{formatBytes(item.size)}</span>
                      <span>{item.mimeType}</span>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {item.usageCount || 0} Usages
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspector Drawer Modal/Panel */}
      {inspectorItem && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] border-l border-border bg-background p-6 shadow-2xl overflow-y-auto flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Info className="size-4 text-indigo-500" /> Asset Inspector
            </h3>
            <button
              onClick={() => setInspectorItem(null)}
              className="p-1 rounded-lg hover:bg-accent text-muted-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative aspect-video w-full rounded-2xl bg-accent/20 overflow-hidden flex items-center justify-center border border-border">
            {inspectorItem.mimeType.startsWith('image/') ? (
              <img src={inspectorItem.publicUrl || '/placeholder.svg'} alt="" className="size-full object-contain" />
            ) : (
              <FileText className="size-16 text-muted-foreground/40" />
            )}
          </div>

          {deleteError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          {/* Copy Public Link */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inspectorItem.publicUrl || ''}
              className="h-9 flex-1 rounded-xl border border-border bg-muted/20 px-3 text-xs outline-none font-mono text-muted-foreground"
            />
            <button
              onClick={() => copyUrlToClipboard(inspectorItem.publicUrl || '')}
              className="inline-flex h-9 items-center gap-1 px-3 rounded-xl border border-border text-xs font-medium hover:bg-accent cursor-pointer"
            >
              {copySuccess ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copySuccess ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* File Metadata List */}
          <div className="rounded-2xl border border-border p-4 flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Name:</span>
              <span className="font-semibold">{inspectorItem.originalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Size:</span>
              <span>{formatBytes(inspectorItem.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MIME Type:</span>
              <span>{inspectorItem.mimeType}</span>
            </div>
            {inspectorItem.width && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span>{inspectorItem.width} × {inspectorItem.height} px</span>
              </div>
            )}
            {inspectorItem.fileHash && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SHA-256 Hash:</span>
                <span className="font-mono text-[10px] truncate max-w-[180px]">{inspectorItem.fileHash}</span>
              </div>
            )}
            {inspectorItem.dominantColor && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dominant Color:</span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="size-3 rounded-full border border-border" style={{ backgroundColor: inspectorItem.dominantColor }} />
                  {inspectorItem.dominantColor}
                </span>
              </div>
            )}
          </div>

          {/* Version History */}
          {inspectorItem.versions && inspectorItem.versions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <History className="size-3.5 text-indigo-500" /> Version History
              </span>
              <div className="flex flex-col gap-1.5">
                {inspectorItem.versions.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/10 text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold">Version {v.versionNumber}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleRollback(inspectorItem.id, v.versionNumber)}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                    >
                      <RotateCcw className="size-3" /> Rollback
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Usages */}
          {inspectorItem.usages && inspectorItem.usages.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="size-3.5" /> Active Usages ({inspectorItem.usages.length})
              </span>
              <div className="flex flex-col gap-1">
                {inspectorItem.usages.map((u: any) => (
                  <div key={u.id} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200">
                    <span className="font-semibold">{u.entityType}</span> (ID: {u.entityId.slice(0, 8)}...)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-4 flex items-center gap-2 border-t border-border">
            <button
              onClick={() => handleDeleteMedia(inspectorItem.id, false)}
              className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="size-3.5" /> Archive Asset
            </button>
            <button
              onClick={() => handleDeleteMedia(inspectorItem.id, true)}
              className="inline-flex h-9 px-3 items-center justify-center gap-1.5 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              title="Force Delete"
            >
              Force Delete
            </button>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder Name (e.g. Products, Hero Banners)"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-foreground/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFolderModal(false)}
                className="h-9 px-4 rounded-xl border border-border text-xs font-medium hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-medium cursor-pointer"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dropzone Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UploadCloud className="size-5 text-indigo-500" /> Upload Digital Assets
              </h3>
              <button onClick={() => setUploadOpen(false)} className="p-1 rounded-lg hover:bg-accent cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-foreground/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-accent/10"
            >
              <UploadCloud className="size-10 text-muted-foreground mb-2" />
              <span className="text-sm font-semibold">Click or Drag & Drop files here</span>
              <span className="text-xs text-muted-foreground mt-1">Supports PNG, JPEG, WebP, SVG, MP4, PDF (Up to 50MB)</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {uploading && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Uploading & Processing Variants...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
                  <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
