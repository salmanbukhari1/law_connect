'use client';

import { useState } from 'react';
import { SessionSidebar } from '@/components/SessionSidebar';
import { SessionView } from '@/components/SessionView';
import styles from './page.module.css';

export default function Home() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  return (
    <div className={styles.pageWrapper}>
      <SessionSidebar selectedId={selectedSessionId} onSelect={setSelectedSessionId} />

      <main className={styles.mainContent}>
        {selectedSessionId ? (
          <SessionView key={selectedSessionId} sessionId={selectedSessionId} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyStateWrapper}>
      <div className={styles.iconCircle}>
        🧪
      </div>
      <h1 className={styles.gradientTitle}>
        Welcome to PromptLab
      </h1>
      <p className={styles.subtitle}>
        Create a new session in the sidebar to start generating and managing LLM-powered content.
      </p>
      <div className={styles.featuresGrid}>
        {[
          { icon: '✦', label: 'Submit prompts', desc: 'Free-form text prompts to the LLM' },
          { icon: '✏', label: 'Edit inline', desc: 'Click any item to edit title or body' },
          { icon: '↺', label: 'Regenerate', desc: 'Refine your prompt and re-generate' },
          { icon: '📜', label: 'Full history', desc: 'Previous versions are archived, not deleted' },
        ].map((f) => (
          <div key={f.label} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div className={styles.featureLabel}>
              {f.label}
            </div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
