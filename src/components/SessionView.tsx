'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSessionDetail } from '@/lib/api-client';
import { PromptComposer } from './PromptComposer';
import { OutputViewer } from './OutputViewer';
import { useEffect } from 'react';
import styles from './SessionView.module.css';

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
    return <div className={styles.stateMessage}>Loading session…</div>;
  }

  if (isError || !data) {
    return (
      <div className={`${styles.stateMessage} ${styles['stateMessage--error']}`}>
        Failed to load session. Please try again.
      </div>
    );
  }

  const { session, activeItems, archivedItems, revisions } = data;
  const latestRevision = revisions[0];

  return (
    <div className={styles.sessionRoot}>
      {/* Session header */}
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>{session.name}</h1>
          {/* Status badge */}
          <StatusBadge status={session.status} />
          {revisions.length > 0 && (
            <span className={styles.revisionMeta}>
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  idle:      { label: 'Idle',        color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  pending:   { label: '⟳ Running',   color: 'var(--accent)',     bg: 'var(--accent-glow)' },
  completed: { label: '✓ Completed', color: 'var(--success)',    bg: 'rgba(34,197,94,0.12)' },
  failed:    { label: '✕ Failed',    color: 'var(--danger)',     bg: 'rgba(239,68,68,0.12)' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  return (
    <span
      className={styles.badge}
      style={{ '--badge-color': cfg.color, '--badge-bg': cfg.bg } as React.CSSProperties}
    >
      {cfg.label}
    </span>
  );
}
