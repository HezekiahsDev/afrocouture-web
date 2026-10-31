import api from './api';
import type { Locale } from '@/i18n/config';
import type {
  Localized,
  MySurvey,
  MySurveyResponse,
  SurveyAnswer,
  SurveyAnswers,
  SurveyDefinition,
  SurveyQuestion,
  SurveyStatus,
} from '@/types/survey';

// ── API ──

export async function getMySurvey(): Promise<MySurvey> {
  return (await api.get<MySurvey>('/surveys/me')).data;
}

export async function getMySurveyStatus(): Promise<SurveyStatus> {
  return (await api.get<SurveyStatus>('/surveys/me/status')).data;
}

/** Partial update: `null` clears an answer. Returns the saved answers (the API drops ones that no longer apply). */
export async function saveSurveyAnswers(answers: Record<string, SurveyAnswer | null>): Promise<MySurveyResponse> {
  return (await api.put<MySurveyResponse>('/surveys/me/answers', { answers })).data;
}

export async function completeSurvey(): Promise<MySurveyResponse> {
  return (await api.post<MySurveyResponse>('/surveys/me/complete')).data;
}

export async function dismissSurveyPrompt(): Promise<SurveyStatus> {
  return (await api.post<SurveyStatus>('/surveys/me/dismiss')).data;
}

// ── Branching ──
// Mirrors IPILE-api src/surveys/survey.logic.ts so questions appear and disappear as people
// answer. The API applies the same rules and stays the authority.

export const localized = (text: Localized | undefined, locale: Locale) => (text ? text[locale] || text.en : '');

function picked(answer: SurveyAnswer | undefined): string[] {
  if (!answer) return [];
  return Array.isArray(answer.value) ? answer.value : [answer.value];
}

function isShown(question: SurveyQuestion, answers: SurveyAnswers): boolean {
  const rule = question.showIf;
  if (!rule) return true;
  const chosen = picked(answers[rule.question]);
  if (!chosen.length) return false;
  if (rule.anyOf && !chosen.some((id) => rule.anyOf!.includes(id))) return false;
  if (rule.noneOf && chosen.some((id) => rule.noneOf!.includes(id))) return false;
  return true;
}

export function visibleQuestions(survey: SurveyDefinition, answers: SurveyAnswers): SurveyQuestion[] {
  const kept: SurveyAnswers = {};
  const visible: SurveyQuestion[] = [];
  for (const question of survey.questions) {
    if (!isShown(question, kept)) continue;
    visible.push(question);
    if (answers[question.id]) kept[question.id] = answers[question.id];
  }
  return visible;
}

export function needsOtherText(question: SurveyQuestion, answer: SurveyAnswer | undefined): boolean {
  return picked(answer).some((id) => question.options?.find((o) => o.id === id)?.other);
}

export function isAnswered(question: SurveyQuestion, answer: SurveyAnswer | undefined): boolean {
  if (!answer) return false;
  if (needsOtherText(question, answer) && !answer.other?.trim()) return false;
  if (question.kind === 'multi' || question.kind === 'list') {
    return Array.isArray(answer.value) && answer.value.some((item) => item.trim() !== '');
  }
  return typeof answer.value === 'string' && answer.value.trim() !== '';
}

export function sanitizeAnswers(survey: SurveyDefinition, answers: SurveyAnswers): SurveyAnswers {
  const out: SurveyAnswers = {};
  for (const question of visibleQuestions(survey, answers)) {
    if (answers[question.id]) out[question.id] = answers[question.id];
  }
  return out;
}

/** A readable version of an answer in the viewer's language (review screens, admin views). */
export function answerSummary(question: SurveyQuestion, answer: SurveyAnswer | undefined, locale: Locale): string[] {
  if (!answer) return [];
  if (question.kind === 'text') return [String(answer.value)];
  if (question.kind === 'list') return (answer.value as string[]).filter((item) => item.trim());
  return picked(answer).map((id) => {
    const option = question.options?.find((o) => o.id === id);
    if (!option) return id;
    const label = localized(option.label, locale);
    return option.other && answer.other ? `${label}: ${answer.other}` : label;
  });
}
