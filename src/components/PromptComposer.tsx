'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executePrompt, regeneratePrompt } from '@/lib/api-client';
import type { PromptRevision, Session } from '@/lib/api-client';
import styles from './PromptComposer.module.css';

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
    <div className={styles.composerWrapper}>
      <div className={styles.textareaWrap}>
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
          data-pending={isPending}
          placeholder="Describe what you'd like the AI to generate…  (⌘+Enter to submit)"
          rows={3}
          className={styles.textarea}
        />

        {/* Character count + submit button overlaid inside textarea */}
        <div className={styles.overlay}>
          <span className={styles.charCount}>{prompt.length} chars</span>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isPending}
            data-pending={isPending}
            className={styles.submitButton}
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
        <div className={styles.errorBanner}>⚠ {errorMessage}</div>
      )}

      {/* Regenerate confirmation dialog */}
      {showRegenConfirm && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowRegenConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`animate-fade-in-up ${styles.modal}`}
          >
            <h2 className={styles.modalTitle}>↺ Regenerate Content</h2>
            <p className={styles.modalBody}>
              Regenerating will <strong>archive</strong>{' '}
              all current active items and create a fresh generation from your updated prompt.
              <br /><br />
              Archived items remain visible in the history section — nothing is permanently deleted.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowRegenConfirm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => regenMut.mutate()}
                disabled={regenMut.isPending}
                className={styles.confirmButton}
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
