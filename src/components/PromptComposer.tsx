'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executePrompt, regeneratePrompt } from '@/lib/api-client';
import type { PromptRevision, Session } from '@/lib/api-client';

interface Props {
  session: Session;
  latestRevision?: PromptRevision;
}

export function PromptComposer({ session, latestRevision }: Props) {
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState(latestRevision?.promptText ?? '');
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const isFirstRun = !latestRevision;
  const isPending = session.status === 'pending';
  const hasChanged = prompt.trim() !== (latestRevision?.promptText ?? '').trim();

  const executeMut = useMutation({
    mutationFn: () => executePrompt(session.id, prompt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const regenMut = useMutation({
    mutationFn: () => regeneratePrompt(session.id, prompt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setShowRegenConfirm(false);
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setShowRegenConfirm(false);
    },
  });

  const errorMessage = executeMut.error?.message ?? regenMut.error?.message;

  const handleSubmit = () => {
    if (!prompt.trim() || isPending) return;
    if (isFirstRun) {
      executeMut.mutate();
    } else {
      setShowRegenConfirm(true);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '20px 24px',
      }}
    >
      <div style={{ position: 'relative' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isPending}
          placeholder="Describe what you'd like the AI to generate…  (⌘+Enter to submit)"
          rows={3}
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 14px',
            paddingBottom: 36,
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.15s',
            opacity: isPending ? 0.7 : 1,
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--accent)';
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border)';
          }}
        />

        {/* Character count + submit button overlaid inside textarea */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {prompt.length} chars
          </span>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isPending}
            style={{
              padding: '5px 14px',
              background: isPending ? 'var(--bg-hover)' : 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              color: isPending ? 'var(--text-muted)' : '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: !prompt.trim() || isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {isPending
              ? 'Running…'
              : isFirstRun
              ? '▶ Run'
              : hasChanged
              ? '↺ Regenerate'
              : '↺ Re-run'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 13,
          }}
        >
          ⚠ {errorMessage}
        </div>
      )}

      {/* Regenerate confirmation dialog */}
      {showRegenConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowRegenConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in-up"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '28px 32px',
              maxWidth: 440,
              width: '90%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              ↺ Regenerate Content
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Regenerating will <strong style={{ color: 'var(--text-primary)' }}>archive</strong>{' '}
              all current active items and create a fresh generation from your updated prompt.
              <br /><br />
              Archived items remain visible in the history section — nothing is permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRegenConfirm(false)}
                style={{
                  padding: '8px 18px',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => regenMut.mutate()}
                disabled={regenMut.isPending}
                style={{
                  padding: '8px 18px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: regenMut.isPending ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {regenMut.isPending ? 'Regenerating…' : 'Confirm Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
