'use client';

import { useState } from 'react';
import { ContentItemCard } from './ContentItemCard';
import type { ContentItem } from '@/lib/api-client';
import styles from './OutputViewer.module.css';

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
      <div className={styles.stateContainer}>
        <div className={`${styles.spinner} animate-spin`} />
        <p className={styles.statusMessage}>Generating content…</p>
        <p className={styles.statusSubtext}>This usually takes a few seconds</p>
      </div>
    );
  }

  if (isFailed && activeItems.length === 0) {
    return (
      <div className={styles.stateContainer}>
        <span className={styles.statusIcon}>⚠️</span>
        <p className={styles.statusTitle}>Generation failed</p>
        <p className={styles.statusSubtext}>Check your API key and prompt, then try again.</p>
      </div>
    );
  }

  if (activeItems.length === 0 && archivedItems.length === 0) {
    return (
      <div className={styles.stateContainer}>
        <span className={styles.emptyIcon}>✦</span>
        <p className={styles.emptyTitle}>No content yet</p>
        <p className={styles.emptySubtext}>Enter a prompt above and hit Run to generate your first items.</p>
      </div>
    );
  }

  return (
    <div className={styles.scrollArea}>
      {/* Active items */}
      {activeItems.length > 0 && (
        <div className={styles.sectionGroup}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionDot} />
            <h2 className={styles.sectionTitle}>Generated Content</h2>
            <span className={styles.countBadge}>{activeItems.length} items</span>
          </div>
          <div className={styles.itemList}>
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
            className={styles.archiveToggle}
            data-open={showArchived}
          >
            <span className={styles.archiveChevron} data-open={showArchived}>▶</span>
            Previous Versions ({archivedItems.length} archived items)
          </button>

          {showArchived && (
            <div className={styles.archiveList}>
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
