'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MerchantMediaClient } from '@/lib/services/merchant-media-client';
import { Search, FolderPlus, Upload, Trash2, X, PlusCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { cn } from '@corecart/shared';

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  onClose?: () => void;
  isPicker?: boolean;
}

export function MediaLibrary({ onSelect, onClose, isPicker = false }: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Folder creation form
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const [mediaRes, foldersRes] = await Promise.all([
        MerchantMediaClient.searchMedia({
          query: search || undefined,
          folderId: selectedFolderId,
        }),
        MerchantMediaClient.getFolders(),
      ]);

      setMediaItems(mediaRes.items || []);
      setFolders(foldersRes || []);
    } catch (err: any) {
      console.error('Failed to load media assets:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to retrieve media library assets.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [search, selectedFolderId]);

  const handleCreateFolder = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await MerchantMediaClient.createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderForm(false);
      loadMedia();
      setStatusMsg({ type: 'success', text: 'Folder created successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create folder.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatusMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      if (selectedFolderId) {
        formData.append('folderId', selectedFolderId);
      }

      await MerchantMediaClient.uploadMedia(formData);
      loadMedia();
      setStatusMsg({ type: 'success', text: 'Asset uploaded successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to upload media file.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this asset? This cannot be undone.')) return;

    try {
      await MerchantMediaClient.deleteMedia(id);
      loadMedia();
      setStatusMsg({ type: 'success', text: 'Media asset deleted successfully.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete asset.' });
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-card rounded-3xl border border-border/80 overflow-hidden shadow-sm h-[600px]",
      isPicker && "h-[500px]"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="size-4.5 text-muted-foreground" />
          <h3 className="font-serif text-lg font-bold text-foreground">Media Library</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Invisible file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="size-3.5 border-2 border-current border-t-transparent animate-spin rounded-full" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload File
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className={cn(
          "px-4 py-2 border-b text-[11px] flex justify-between items-center gap-2",
          statusMsg.type === 'success' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : 'bg-destructive/5 text-destructive border-destructive/10'
        )}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="hover:underline font-bold text-[9px] uppercase">Dismiss</button>
        </div>
      )}

      {/* Main split */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar for folders */}
        <div className="w-48 border-r border-border/60 bg-muted/10 p-3 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Folders</span>
            {!showFolderForm && (
              <button
                onClick={() => setShowFolderForm(true)}
                className="text-muted-foreground hover:text-foreground p-0.5"
                title="Create Folder"
              >
                <FolderPlus className="size-3.5" />
              </button>
            )}
          </div>

          {showFolderForm && (
            <div className="space-y-2 p-2 bg-background border border-border/80 rounded-xl">
              <input
                type="text"
                required
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateFolder(e);
                  }
                }}
                className="w-full px-2 py-1 text-[10px] border border-border/80 rounded-md outline-none"
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setShowFolderForm(false)}
                  className="px-1.5 py-0.5 text-[8px] font-bold border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="px-1.5 py-0.5 text-[8px] font-bold bg-foreground text-background rounded-md"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                selectedFolderId === null ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Assets
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors truncate",
                  selectedFolderId === f.id ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Assets view panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          {/* Search bar */}
          <div className="p-3 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search assets by file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs border border-border/80 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Grid display */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="size-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <Upload className="size-8 stroke-[1.5] mb-2" />
                <p className="text-xs font-semibold">No media assets found</p>
                <p className="text-[10px] mt-0.5">Upload a new image or file to begin.</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect?.(item.publicUrl || item.path)}
                    className={cn(
                      "group border border-border/80 bg-card rounded-2xl overflow-hidden hover:border-foreground/20 hover:shadow-soft transition-all duration-200 cursor-pointer relative",
                      onSelect && "active:scale-[0.98]"
                    )}
                  >
                    {/* Thumbnail preview */}
                    <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                      <img
                        src={item.publicUrl || item.path}
                        alt={item.alt || item.filename}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {onSelect && (
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
                          <CheckCircle className="size-6 text-foreground bg-background rounded-full p-0.5 shadow-md" />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-border/40 flex items-center justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-foreground truncate">{item.filename}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">{(item.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <a
                          href={item.publicUrl || item.path}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded"
                          title="Open URL in new tab"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-muted/50 rounded"
                          title="Delete media asset"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
