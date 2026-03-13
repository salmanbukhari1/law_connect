'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItem, deleteItem, type ContentItem } from '@/lib/api-client';
import styles from './ContentItemCard.module.css';

const CATEGORY_COLORS: Record<string, string> = {
  tip: 'var(--success)',
  warning: 'var(--warning)',
  idea: 'var(--accent)',
  example: 'var(--text-secondary)', // #06b6d4 maps roughly to this or needs a new token, text-secondary fits well
  step: 'var(--pending)', // #3b82f6 -> using pending which is blue/accent
  info: 'var(--text-secondary)',
};

function CategoryBadge({ category }: { category?: string | null }) {
  if (!category) return null;
  const color = CATEGORY_COLORS[category.toLowerCase()] ?? 'var(--text-muted)';
  return (
    <span
      className={styles.categoryBadge}
      style={{ '--cat-color': color } as React.CSSProperties}
    >
      {category}
    </span>
  );
}

interface EditableFieldProps {
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  className?: string; // Replace style prop with className
}

function EditableField({ value, onSave, multiline, className = '' }: EditableFieldProps) {
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
        className={`${styles.editableSpan} ${className}`.trim()}
      >
        {value}
      </span>
    );
  }

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
        className={`${styles.editTextarea} ${className}`.trim()}
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
      className={`${styles.editInput} ${className}`.trim()}
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
      className={`animate-fade-in-up ${styles.card}`}
      data-archived={archived}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          {archived ? (
            <span className={styles.archivedTitle}>
              {item.title}
            </span>
          ) : (
            <EditableField
              value={item.title}
              onSave={(title) => patchMut.mutate({ title })}
              className={styles.archivedTitle} // matches title styling font-size/weight
            />
          )}
        </div>
        <CategoryBadge category={item.category} />
        {!archived && (
          <div className={styles.actionRow}>
            {deleteConfirm ? (
              <>
                <button
                  onClick={() => deleteMut.mutate()}
                  className={styles.confirmDeleteButton}
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className={styles.cancelConfirmButton}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                title="Delete item"
                className={styles.deleteButton}
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {archived ? (
          <span>{item.body}</span>
        ) : (
          <EditableField
            value={item.body}
            onSave={(body) => patchMut.mutate({ body })}
            multiline
            // Default styling for EditableField matches body text
          />
        )}
      </div>

      {patchMut.isPending && (
        <div className={styles.savingDot} title="Saving…" />
      )}
    </div>
  );
}
