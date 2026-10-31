'use client';

import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, PencilLine, RotateCcw } from 'lucide-react';
import { card, ghostButton, InlineAlert, primaryButton } from '@/components/orders/ui';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useI18n } from '@/i18n/I18nProvider';
import { apiErrorCode, apiErrorMessage } from '@/lib/api';
import { answerSummary, isAnswered, localized, needsOtherText, sanitizeAnswers, visibleQuestions } from '@/lib/survey';
import type { SurveyAnswer, SurveyAnswers, SurveyDefinition } from '@/types/survey';
import { QuestionField } from './QuestionField';

type Mode = { kind: 'step'; index: number; fromReview?: boolean } | { kind: 'review' } | { kind: 'done' };

/** Where someone lands: their first unanswered question, the review screen, or the thank-you. */
function startMode(survey: SurveyDefinition, answers: SurveyAnswers, completed: boolean): Mode {
  if (completed) return { kind: 'done' };
  const visible = visibleQuestions(survey, answers);
  const next = visible.findIndex((q) => !isAnswered(q, answers[q.id]));
  if (next >= 0) return { kind: 'step', index: next };
  return { kind: 'review' };
}

/** Answers that differ from what was last saved; `null` clears one on the server. */
function changes(current: SurveyAnswers, saved: SurveyAnswers): Record<string, SurveyAnswer | null> {
  const patch: Record<string, SurveyAnswer | null> = {};
  for (const id of new Set([...Object.keys(current), ...Object.keys(saved)])) {
    if (JSON.stringify(current[id]) !== JSON.stringify(saved[id])) patch[id] = current[id] ?? null;
  }
  return patch;
}

/**
 * The survey itself, one question per screen. Questions appear and disappear as earlier
 * answers change. With `onSave`, each move saves the current answer so people can leave
 * and resume; without it (admin preview) nothing leaves the browser.
 */
export function SurveyForm({
  survey,
  initialAnswers,
  completed = false,
  onSave,
  onSubmit,
  preview = false,
}: {
  survey: SurveyDefinition;
  initialAnswers: SurveyAnswers;
  completed?: boolean;
  onSave?: (patch: Record<string, SurveyAnswer | null>) => Promise<SurveyAnswers>;
  onSubmit?: () => Promise<void>;
  preview?: boolean;
}) {
  const { t, locale } = useI18n();
  const [answers, setAnswers] = useState<SurveyAnswers>(initialAnswers);
  const [saved, setSaved] = useState<SurveyAnswers>(initialAnswers);
  const [mode, setMode] = useState<Mode>(() => startMode(survey, initialAnswers, completed));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'save' | 'submit' | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const visible = visibleQuestions(survey, answers);
  const firstMissing = (list: SurveyAnswers) =>
    visibleQuestions(survey, list).findIndex((q) => q.required && !isAnswered(q, list[q.id]));

  // Move focus to the new screen so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    panelRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [mode]);

  async function persist(): Promise<SurveyAnswers | null> {
    const clean = sanitizeAnswers(survey, answers);
    const patch = changes(clean, saved);
    if (!Object.keys(patch).length) return clean;
    if (!onSave) {
      setSaved(clean);
      return clean;
    }
    setBusy('save');
    try {
      const stored = await onSave(patch);
      setSaved(stored);
      setAnswers(stored);
      return stored;
    } catch (err) {
      setError(apiErrorMessage(err, t.survey.saveError));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function goNext(event?: FormEvent) {
    event?.preventDefault();
    if (mode.kind !== 'step') return;
    const question = visible[mode.index];
    const answer = answers[question.id];
    if (question.required && !isAnswered(question, answer)) {
      return setError(needsOtherText(question, answer) ? t.survey.otherRequired : t.survey.required);
    }
    setError('');
    const stored = await persist();
    if (!stored) return;
    const list = visibleQuestions(survey, stored);
    if (mode.fromReview) {
      // Back to the review unless the edit revealed a question that still needs an answer.
      const missing = firstMissing(stored);
      return setMode(missing >= 0 ? { kind: 'step', index: missing, fromReview: true } : { kind: 'review' });
    }
    setMode(mode.index + 1 < list.length ? { kind: 'step', index: mode.index + 1 } : { kind: 'review' });
  }

  async function goBack() {
    if (mode.kind !== 'step' || mode.index === 0) return;
    setError('');
    if (await persist()) setMode({ kind: 'step', index: mode.index - 1 });
  }

  async function submit() {
    setError('');
    const stored = await persist();
    if (!stored) return;
    const missing = firstMissing(stored);
    if (missing >= 0) {
      setError(t.survey.required);
      return setMode({ kind: 'step', index: missing, fromReview: true });
    }
    if (onSubmit) {
      setBusy('submit');
      try {
        await onSubmit();
      } catch (err) {
        setError(apiErrorMessage(err, t.survey.saveError));
        if (apiErrorCode(err) === 'SURVEY_INCOMPLETE') setMode({ kind: 'review' });
        return;
      } finally {
        setBusy(null);
      }
    }
    setMode({ kind: 'done' });
  }

  const summary = (
    <dl className="flex flex-col divide-y divide-[#171717]/8">
      {visible.map((question, index) => {
        const lines = answerSummary(question, answers[question.id], locale);
        return (
          <div key={question.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <dt className="text-sm font-semibold text-[#171717]">
                {index + 1}. {localized(question.prompt, locale)}
              </dt>
              <dd className="mt-1 text-sm text-[#5F5A52]">
                {lines.length ? (
                  <ul className="flex flex-col gap-0.5">
                    {lines.map((line, i) => (
                      <li key={i} className="whitespace-pre-line break-words">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="italic text-[#6B655C]">{t.survey.notAnswered}</span>
                )}
              </dd>
            </div>
            {mode.kind === 'review' && (
              <button
                type="button"
                className={`${ghostButton} shrink-0 self-start px-3 py-1.5 text-xs`}
                onClick={() => setMode({ kind: 'step', index, fromReview: true })}
                aria-label={`${t.survey.edit}: ${localized(question.prompt, locale)}`}
              >
                <PencilLine size={14} aria-hidden="true" /> {t.survey.edit}
              </button>
            )}
          </div>
        );
      })}
    </dl>
  );

  if (mode.kind === 'done') {
    return (
      <div ref={panelRef as RefObject<HTMLDivElement>} tabIndex={-1} className={`${card} flex scroll-mt-28 flex-col gap-5 outline-none`}>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2F6B4F]/12 text-[#2F6B4F]">
            <Check size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#171717]">
              {preview ? 'End of preview' : t.survey.doneTitle}
            </h2>
            <p className="mt-1 text-sm text-[#5F5A52]">
              {preview ? 'That is everything this role would be asked. Nothing was saved.' : t.survey.doneBody}
            </p>
          </div>
        </div>
        {summary}
        <div className="flex flex-wrap gap-3">
          {preview ? (
            <button
              type="button"
              className={ghostButton}
              onClick={() => {
                setAnswers({});
                setSaved({});
                setMode({ kind: 'step', index: 0 });
              }}
            >
              <RotateCcw size={16} aria-hidden="true" /> Start again
            </button>
          ) : (
            <>
              <button type="button" className={ghostButton} onClick={() => setMode({ kind: 'review' })}>
                <PencilLine size={16} aria-hidden="true" /> {t.survey.editAnswers}
              </button>
              <Link href="/marketplace" className={primaryButton}>
                {t.survey.backToDiscover} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (mode.kind === 'review') {
    return (
      <div ref={panelRef as RefObject<HTMLDivElement>} tabIndex={-1} className={`${card} flex scroll-mt-28 flex-col gap-4 outline-none`}>
        <div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#171717]">{t.survey.reviewTitle}</h2>
          <p className="mt-1 text-sm text-[#5F5A52]">{t.survey.reviewBody}</p>
        </div>
        {summary}
        {error && <InlineAlert>{error}</InlineAlert>}
        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" className={ghostButton} onClick={() => setMode({ kind: 'step', index: visible.length - 1 })}>
            <ArrowLeft size={16} aria-hidden="true" /> {t.survey.back}
          </button>
          <button type="button" className={primaryButton} onClick={submit} disabled={busy !== null}>
            {busy ? (
              <>
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> {t.survey.submitting}
              </>
            ) : (
              <>
                {t.survey.submit} <Check size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const question = visible[mode.index];
  const answered = isAnswered(question, answers[question.id]);
  return (
    <form
      ref={panelRef as RefObject<HTMLFormElement>}
      tabIndex={-1}
      onSubmit={goNext}
      className={`${card} flex scroll-mt-28 flex-col gap-6 outline-none`}
      noValidate
    >
      <ProgressBar
        value={mode.index}
        max={visible.length}
        label={t.survey.progress(mode.index + 1, visible.length)}
        aria-hidden="true"
      />
      <p className="sr-only" aria-live="polite">
        {t.survey.progress(mode.index + 1, visible.length)}
      </p>
      <QuestionField
        key={question.id}
        question={question}
        answer={answers[question.id]}
        error={error || undefined}
        onChange={(answer) => {
          setError('');
          setAnswers((current) => {
            const next = { ...current };
            if (answer) next[question.id] = answer;
            else delete next[question.id];
            return next;
          });
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#171717]/8 pt-5">
        <button type="button" className={ghostButton} onClick={goBack} disabled={mode.index === 0 || busy !== null}>
          <ArrowLeft size={16} aria-hidden="true" /> {t.survey.back}
        </button>
        <button type="submit" className={primaryButton} disabled={busy !== null}>
          {busy === 'save' ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> {t.survey.saving}
            </>
          ) : (
            <>
              {!question.required && !answered ? t.survey.skip : t.survey.next} <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
