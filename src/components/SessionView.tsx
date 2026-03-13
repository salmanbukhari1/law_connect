'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSessionDetail } from '@/lib/api-client';
import { PromptComposer } from './PromptComposer';
import { OutputViewer } from './OutputViewer';
import { useEffect } from 'react';

interface Props {
  sessionId: number;
}

export function SessionView({ sessionId }: Props) {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSessionDetail(sessionId),
    refetchInterval: (query) => {
      // Poll while the session is pending
      return query.state.data?.session.status === 'pending' ? 1500 : false;
    },
  });

  // When status changes from pending to completed/failed, refresh session list
  useEffect(() => {
    if (data?.session.status === 'completed' || data?.session.status === 'failed') {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    }
  }, [data?.session.status, qc]);

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: 14,
        }}
      >
        Loading session…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          fontSize: 14,
        }}
      >
        Failed to load session. Please try again.
      </div>
    );
  }

  const { session, activeItems, archivedItems, revisions } = data;
  const latestRevision = revisions[0];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Session header */}
      <div
        style={{
          padding: '16px 24px 0',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
              flex: 1,
            }}
          >
            {session.name}
          </h1>
          {/* Status badge */}
          <StatusBadge status={session.status} />
          {revisions.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              v{latestRevision?.version} · {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Prompt composer */}
      <PromptComposer session={session} latestRevision={latestRevision} />

      {/* Output area */}
      <OutputViewer
        sessionId={sessionId}
        activeItems={activeItems}
        archivedItems={archivedItems}
        status={session.status}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    idle: { label: 'Idle', color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
    pending: { label: '⟳ Running', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    completed: { label: '✓ Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    failed: { label: '✕ Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  };
  const cfg = config[status] ?? config.idle;

  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        letterSpacing: '0.03em',
      }}
    >
      {cfg.label}
    </span>
  );
}
