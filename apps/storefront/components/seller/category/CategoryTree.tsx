'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, FolderInput, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

interface CategoryTreeProps {
  nodes: CategoryNode[];
  allFlatCategories: { id: string; name: string }[];
  onMove: (id: string, parentId: string | null, sortOrder: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryTree({ nodes, allFlatCategories, onMove, onDelete }: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [movingId, setMovingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((item) => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const handleSortChange = async (node: CategoryNode, index: number, direction: 'UP' | 'DOWN', siblings: CategoryNode[]) => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === siblings.length - 1) return;

    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const targetNode = siblings[targetIdx];

    // Swap sort orders
    await onMove(node.id, node.parentId, targetNode.sortOrder);
    await onMove(targetNode.id, targetNode.parentId, node.sortOrder);
  };

  const handleParentChange = async (node: CategoryNode, newParentId: string) => {
    const parentId = newParentId === 'root' ? null : newParentId;
    await onMove(node.id, parentId, node.sortOrder);
    setMovingId(null);
  };

  // Check if a category ID is a descendant of node ID (to prevent circular references)
  const isDescendant = (parentId: string, childId: string): boolean => {
    const findNode = (list: CategoryNode[]): CategoryNode | null => {
      for (const n of list) {
        if (n.id === parentId) return n;
        const found = findNode(n.children);
        if (found) return found;
      }
      return null;
    };

    const parentNode = findNode(nodes);
    if (!parentNode) return false;

    const checkChildren = (list: CategoryNode[]): boolean => {
      return list.some((c) => c.id === childId || checkChildren(c.children));
    };

    return checkChildren(parentNode.children);
  };

  const renderTreeNode = (node: CategoryNode, index: number, siblings: CategoryNode[], depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.includes(node.id);

    // List potential parents (exclude the node itself and its descendants)
    const potentialParents = allFlatCategories.filter(
      (cat) => cat.id !== node.id && !isDescendant(node.id, cat.id)
    );

    return (
      <div key={node.id} className="space-y-1">
        <div
          className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card hover:border-foreground/15 transition-all"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* Expand / Collapse trigger */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="size-6 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0"
              >
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
            ) : (
              <div className="size-6 shrink-0" />
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{node.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                /{node.slug}
              </span>
            </div>
            {!node.isActive && (
              <span className="text-[8px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                Hidden
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Sort up button */}
            <button
              onClick={() => handleSortChange(node, index, 'UP', siblings)}
              disabled={index === 0}
              className="size-7 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 flex items-center justify-center"
              title="Move Up"
            >
              <ArrowUp className="size-3.5" />
            </button>

            {/* Sort down button */}
            <button
              onClick={() => handleSortChange(node, index, 'DOWN', siblings)}
              disabled={index === siblings.length - 1}
              className="size-7 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 flex items-center justify-center"
              title="Move Down"
            >
              <ArrowDown className="size-3.5" />
            </button>

            {/* Change Parent toggle */}
            <div className="relative">
              <button
                onClick={() => setMovingId(movingId === node.id ? null : node.id)}
                className={`size-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center ${
                  movingId === node.id ? 'bg-primary/10 text-primary border-primary/20' : ''
                }`}
                title="Change Parent / Nesting"
              >
                <FolderInput className="size-3.5" />
              </button>

              {movingId === node.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMovingId(null)} />
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-border/80 bg-popover p-2 shadow-float z-20 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 select-none">
                      Set Parent Category
                    </p>
                    <button
                      onClick={() => handleParentChange(node, 'root')}
                      className={`flex w-full items-center px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted/60 ${
                        node.parentId === null ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      Top Level (Root)
                    </button>
                    {potentialParents.map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => handleParentChange(node, parent.id)}
                        className={`flex w-full items-center text-left px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted/60 truncate ${
                          node.parentId === parent.id ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {parent.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Edit link */}
            <Link
              href="#"
              className="size-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground"
              title="Edit details"
            >
              <Edit2 className="size-3.5" />
            </Link>

            {/* Delete button */}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete category "${node.name}"?`)) {
                  onDelete(node.id);
                }
              }}
              className="size-7 rounded-lg border border-border bg-card hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center text-muted-foreground"
              title="Delete Category"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Render children nodes recursively */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child, childIdx) =>
              renderTreeNode(child, childIdx, node.children, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {nodes.length === 0 ? (
        <div className="p-12 border border-dashed border-border/80 rounded-3xl text-center text-xs text-muted-foreground">
          No categories found. Create a category to get started.
        </div>
      ) : (
        nodes.map((node, idx) => renderTreeNode(node, idx, nodes))
      )}
    </div>
  );
}
