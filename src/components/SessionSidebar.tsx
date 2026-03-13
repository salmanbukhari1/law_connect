'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSessions, createSession, deleteSession, type Session } from '@/lib/api-client';
import { useState } from 'react';
import styles from './SessionSidebar.module.css';

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/** Maps status string to the corresponding CSS custom property from globals.css */
const STATUS_DOT_COLOR: Record<string, string> = {
  idle:      'var(--text-muted)',
  pending:   'var(--accent)',
  completed: 'var(--success)',
  failed:    'var(--danger)',
};

export function SessionSidebar({ selectedId, onSelect }: Props) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  });

  const createMut = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      onSelect(session.id);
      setNewName('');
      setCreating(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const handleCreate = () => {
    const name = newName.trim() || `Session ${new Date().toLocaleTimeString()}`;
    createMut.mutate(name);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoRow}>
          <span className={styles.logoIcon}>🧪</span>
          <span className={styles.logoText}>PromptLab</span>
        </div>
        <p className={styles.tagline}>LLM Content Studio</p>
      </div>

      {/* New session area */}
      <div className={styles.newSessionArea}>
        {creating ? (
          <div className={styles.nameInputGroup}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setCreating(false);
              }}
              placeholder="Session name…"
              className={styles.nameInput}
            />
            <div className={styles.buttonRow}>
              <button
                onClick={handleCreate}
                disabled={createMut.isPending}
                className={styles.createButton}
              >
                {createMut.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => setCreating(false)}
                className={styles.cancelCreateButton}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className={styles.newSessionButton}>
            <span className={styles.newSessionButtonIcon}>＋</span>
            New Session
          </button>
        )}
      </div>

      {/* Session list */}
      <div className={styles.sessionList}>
        {isLoading && (
          <p className={styles.loadingText}>Loading…</p>
        )}
        {sessions.map((s, i) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`animate-fade-in-up ${styles.sessionRow}`}
            data-selected={selectedId === s.id}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* Status dot — colour is runtime-computed from CSS token map */}
            <div
              className={styles.statusDot}
              style={{ background: STATUS_DOT_COLOR[s.status] ?? 'var(--text-muted)' }}
            />
            <span
              className={styles.sessionName}
              data-selected={selectedId === s.id}
            >
              {s.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this session and all its content?')) {
                  deleteMut.mutate(s.id);
                }
              }}
              className={styles.deleteButton}
              title="Delete session"
            >
              ✕
            </button>
          </div>
        ))}
        {!isLoading && sessions.length === 0 && (
          <p className={styles.emptyText}>No sessions yet</p>
        )}
      </div>
    </aside>
  );
}
