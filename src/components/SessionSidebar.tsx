'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSessions, createSession, deleteSession, type Session } from '@/lib/api-client';
import { useState } from 'react';

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

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

  const statusDot = (s: Session) => {
    const colors: Record<string, string> = {
      idle: '#4f5b7a',
      pending: '#6c63ff',
      completed: '#22c55e',
      failed: '#ef4444',
    };
    return colors[s.status] ?? '#4f5b7a';
  };

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>🧪</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            PromptLab
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          LLM Content Studio
        </p>
      </div>

      {/* New session area */}
      <div style={{ padding: '12px 12px 8px' }}>
        {creating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setCreating(false);
              }}
              placeholder="Session name…"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--accent)',
                borderRadius: 6,
                padding: '6px 10px',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                width: '100%',
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleCreate}
                disabled={createMut.isPending}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 0',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {createMut.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => setCreating(false)}
                style={{
                  padding: '6px 10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              background: 'var(--bg-elevated)',
              border: '1px dashed var(--border)',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
            New Session
          </button>
        )}
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {isLoading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 4px' }}>
            Loading…
          </p>
        )}
        {sessions.map((s, i) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${i * 40}ms`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              marginBottom: 2,
              borderRadius: 8,
              cursor: 'pointer',
              background: selectedId === s.id ? 'var(--bg-hover)' : 'transparent',
              border: `1px solid ${selectedId === s.id ? 'var(--accent)' : 'transparent'}`,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedId !== s.id) {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== s.id) {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }
            }}
          >
            {/* Status dot */}
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: statusDot(s),
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                fontSize: 13,
                color: selectedId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
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
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: 4,
                lineHeight: 1,
                opacity: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = '0')
              }
              title="Delete session"
            >
              ✕
            </button>
          </div>
        ))}
        {!isLoading && sessions.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 4px', textAlign: 'center' }}>
            No sessions yet
          </p>
        )}
      </div>
    </aside>
  );
}
