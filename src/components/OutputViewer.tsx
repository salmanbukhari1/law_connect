'use client';

import { useState } from 'react';
import { ContentItemCard } from './ContentItemCard';
import type { ContentItem } from '@/lib/api-client';

interface Props {
  sessionId: number;
  activeItems: ContentItem[];
  archivedItems: ContentItem[];
  status: string;
}

export function OutputViewer({ sessionId, activeItems, archivedItems, status }: Props) {
  const [showArchived, setShowArchived] = useState(false);

  const isPending = status === 'pending';
  const isFailed = status === 'failed';

  if (isPending) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 60,
          flex: 1,
        }}
      >
        <div
          className="animate-spin"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid var(--accent)',
            borderTopColor: 'transparent',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, margin: 0 }}>
          Generating content…
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
          This usually takes a few seconds
        </p>
      </div>
    );
  }

  if (isFailed && activeItems.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 60,
          flex: 1,
        }}
      >
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ color: '#ef4444', fontSize: 15, fontWeight: 600, margin: 0 }}>
          Generation failed
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          Check your API key and prompt, then try again.
        </p>
      </div>
    );
  }

  if (activeItems.length === 0 && archivedItems.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 60,
          flex: 1,
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ fontSize: 48, opacity: 0.6 }}>✦</span>
        <p style={{ fontSize: 15, margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>
          No content yet
        </p>
        <p style={{ fontSize: 13, margin: 0 }}>
          Enter a prompt above and hit Run to generate your first items.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      {/* Active items */}
      {activeItems.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'inline-block',
              }}
            />
            <h2
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}
            >
              Generated Content
            </h2>
            <span
              style={{
                fontSize: 11,
                padding: '1px 7px',
                borderRadius: 100,
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              {activeItems.length} items
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeItems.map((item, i) => (
              <ContentItemCard
                key={item.id}
                item={item}
                sessionId={sessionId}
                index={i}
                archived={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived items accordion */}
      {archivedItems.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 12,
              fontFamily: 'inherit',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              width: '100%',
              textAlign: 'left',
              marginBottom: showArchived ? 12 : 0,
            }}
          >
            <span style={{ transform: showArchived ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              ▶
            </span>
            Previous Versions ({archivedItems.length} archived items)
          </button>

          {showArchived && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {archivedItems.map((item, i) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  sessionId={sessionId}
                  index={i}
                  archived
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
