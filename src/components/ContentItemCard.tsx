'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItem, deleteItem, type ContentItem } from '@/lib/api-client';

const CATEGORY_COLORS: Record<string, string> = {
  tip: '#22c55e',
  warning: '#f59e0b',
  idea: '#6c63ff',
  example: '#06b6d4',
  step: '#3b82f6',
  info: '#8b97b8',
};

function CategoryBadge({ category }: { category?: string | null }) {
  if (!category) return null;
  const color = CATEGORY_COLORS[category.toLowerCase()] ?? '#4f5b7a';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 100,
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color,
        background: `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {category}
    </span>
  );
}

interface EditableFieldProps {
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
}

function EditableField({ value, onSave, multiline, style }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Click to edit"
        style={{
          cursor: 'text',
          borderBottom: '1px dashed transparent',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLSpanElement).style.borderBottomColor = 'var(--border)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLSpanElement).style.borderBottomColor = 'transparent')
        }
      >
        {value}
      </span>
    );
  }

  const sharedStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    border: '1px solid var(--accent)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    outline: 'none',
    padding: '4px 8px',
    width: '100%',
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={draft}
        rows={4}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        style={{ ...sharedStyle, resize: 'vertical', lineHeight: 1.5 }}
      />
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        }
      }}
      style={sharedStyle}
    />
  );
}

interface Props {
  item: ContentItem;
  sessionId: number;
  index: number;
  archived?: boolean;
}

export function ContentItemCard({ item, sessionId, index, archived = false }: Props) {
  const qc = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const patchMut = useMutation({
    mutationFn: (data: { title?: string; body?: string; category?: string }) =>
      updateItem(item.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session', sessionId] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteItem(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session', sessionId] }),
  });

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 60}ms`,
        background: archived ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        border: `1px solid ${archived ? 'var(--border-subtle)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '16px 18px',
        position: 'relative',
        opacity: archived ? 0.6 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          {archived ? (
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {item.title}
            </span>
          ) : (
            <EditableField
              value={item.title}
              onSave={(title) => patchMut.mutate({ title })}
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}
            />
          )}
        </div>
        <CategoryBadge category={item.category} />
        {!archived && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {deleteConfirm ? (
              <>
                <button
                  onClick={() => deleteMut.mutate()}
                  style={{
                    padding: '3px 8px',
                    background: 'var(--danger)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  style={{
                    padding: '3px 8px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                title="Delete item"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 4,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)')
                }
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {archived ? (
          <span>{item.body}</span>
        ) : (
          <EditableField
            value={item.body}
            onSave={(body) => patchMut.mutate({ body })}
            multiline
            style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}
          />
        )}
      </div>

      {patchMut.isPending && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent)',
          }}
          title="Saving…"
        />
      )}
    </div>
  );
}
