'use client';

import { useState } from 'react';
import { SessionSidebar } from '@/components/SessionSidebar';
import { SessionView } from '@/components/SessionView';

export default function Home() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-base)',
      }}
    >
      <SessionSidebar selectedId={selectedSessionId} onSelect={setSelectedSessionId} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 40px var(--accent-glow)',
        }}
      >
        🧪
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Welcome to PromptLab
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
        Create a new session in the sidebar to start generating and managing LLM-powered content.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[
          { icon: '✦', label: 'Submit prompts', desc: 'Free-form text prompts to the LLM' },
          { icon: '✏', label: 'Edit inline', desc: 'Click any item to edit title or body' },
          { icon: '↺', label: 'Regenerate', desc: 'Refine your prompt and re-generate' },
          { icon: '📜', label: 'Full history', desc: 'Previous versions are archived, not deleted' },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 18px',
              width: 160,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {f.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
