'use client';

import { useId } from 'react';
import { fieldClass } from '@/components/orders/ui';
import { useI18n } from '@/i18n/I18nProvider';
import { localized, needsOtherText } from '@/lib/survey';
import { cn } from '@/lib/utils';
import type { SurveyAnswer, SurveyQuestion } from '@/types/survey';

const MAX_TEXT = 2000;
const MAX_SHORT_TEXT = 500;

const optionCard = (active: boolean) =>
  cn(
    'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors',
    active ? 'border-[#B8734E] bg-[#B8734E]/10' : 'border-[#171717]/12 bg-[#FFFFFF]/60 hover:border-[#B8734E]/40',
  );

/** One survey question's input: radio or checkbox cards, a text box, or a short list. */
export function QuestionField({
  question,
  answer,
  onChange,
  error,
}: {
  question: SurveyQuestion;
  answer: SurveyAnswer | undefined;
  onChange: (answer: SurveyAnswer | null) => void;
  error?: string;
}) {
  const { t, locale } = useI18n();
  const name = useId();
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;
  const promptId = `${name}-prompt`;
  const describedBy = [question.help && helpId, error && errorId].filter(Boolean).join(' ') || undefined;

  const selected = !answer ? [] : Array.isArray(answer.value) ? answer.value : [answer.value];
  const showOther = needsOtherText(question, answer);

  function choose(optionId: string) {
    if (question.kind === 'single') {
      const option = question.options!.find((o) => o.id === optionId)!;
      return onChange({ value: optionId, ...(option.other && answer?.other ? { other: answer.other } : {}) });
    }
    const option = question.options!.find((o) => o.id === optionId)!;
    let next: string[];
    if (selected.includes(optionId)) next = selected.filter((id) => id !== optionId);
    // An exclusive option ("Nothing in particular") clears the rest, and the rest clear it.
    else if (option.exclusive) next = [optionId];
    else next = [...selected.filter((id) => !question.options!.find((o) => o.id === id)?.exclusive), optionId];
    const keepOther = next.some((id) => question.options!.find((o) => o.id === id)?.other);
    onChange(next.length ? { value: next, ...(keepOther && answer?.other ? { other: answer.other } : {}) } : null);
  }

  const body = () => {
    if (question.kind === 'text') {
      const value = typeof answer?.value === 'string' ? answer.value : '';
      return (
        <div className="flex flex-col gap-1.5">
          <textarea
            rows={6}
            aria-labelledby={promptId}
            maxLength={MAX_TEXT}
            value={value}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            onChange={(event) => onChange(event.target.value ? { value: event.target.value } : null)}
            className={cn(fieldClass, 'resize-y leading-relaxed')}
          />
          <span className="self-end text-xs text-[#6B655C]">{t.survey.charactersLeft(MAX_TEXT - value.length)}</span>
        </div>
      );
    }
    if (question.kind === 'list') {
      const count = question.items ?? 3;
      const items = Array.from({ length: count }, (_, i) => (Array.isArray(answer?.value) ? answer.value[i] ?? '' : ''));
      return (
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span aria-hidden="true" className="w-5 text-right text-sm font-semibold text-[#B8734E]">
                {i + 1}.
              </span>
              <input
                aria-label={`${localized(question.prompt, locale)} — ${t.survey.itemLabel(i + 1)}`}
                aria-describedby={describedBy}
                maxLength={MAX_SHORT_TEXT}
                value={item}
                onChange={(event) => {
                  const next = items.map((current, j) => (j === i ? event.target.value : current));
                  onChange(next.some((entry) => entry.trim()) ? { value: next } : null);
                }}
                className={fieldClass}
              />
            </li>
          ))}
        </ol>
      );
    }
    const multi = question.kind === 'multi';
    return (
      <div className="grid gap-2.5">
        {question.options!.map((option) => {
          const active = selected.includes(option.id);
          return (
            <label key={option.id} className={optionCard(active)}>
              <input
                type={multi ? 'checkbox' : 'radio'}
                name={name}
                value={option.id}
                checked={active}
                onChange={() => choose(option.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#B8734E]"
              />
              <span className="font-medium text-[#171717]">{localized(option.label, locale)}</span>
            </label>
          );
        })}
        {showOther && (
          <label className="mt-1 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">{t.survey.otherLabel}</span>
            <input
              autoFocus
              maxLength={MAX_SHORT_TEXT}
              value={answer?.other ?? ''}
              onChange={(event) => onChange({ ...answer!, other: event.target.value })}
              className={fieldClass}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-4" aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className="contents">
        <span
          id={promptId}
          className="block font-[family-name:var(--font-cormorant)] text-[26px] font-semibold leading-tight text-[#171717] sm:text-[30px]"
        >
          {localized(question.prompt, locale)}
          {!question.required && (
            <span className="ml-2 align-middle font-[family-name:var(--font-inter)] text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
              {t.survey.optional}
            </span>
          )}
        </span>
      </legend>
      {question.help && (
        <p id={helpId} className="-mt-2 text-sm text-[#6B655C]">
          {localized(question.help, locale)}
        </p>
      )}
      {body()}
      {error && (
        <p id={errorId} className="text-sm text-[#9B2C24]" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
