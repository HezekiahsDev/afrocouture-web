/**
 * Survey shapes (IPILE-api src/surveys). Question copy arrives from the API in
 * every supported language; answers are keyed by question id.
 */
import type { Locale } from '@/i18n/config';
import type { UserRole } from './index';

export type Localized = Record<Locale, string>;

export interface SurveyOption {
  id: string;
  label: Localized;
  other?: true;
  exclusive?: true;
}

export interface SurveyQuestion {
  id: string;
  kind: 'single' | 'multi' | 'text' | 'list';
  prompt: Localized;
  help?: Localized;
  options?: SurveyOption[];
  items?: number;
  required: boolean;
  showIf?: { question: string; anyOf?: string[]; noneOf?: string[] };
}

export interface SurveyDefinition {
  id: string;
  role: Exclude<UserRole, 'admin'>;
  title: Localized;
  intro: Localized;
  questions: SurveyQuestion[];
}

export interface SurveyAnswer {
  value: string | string[];
  other?: string;
}

export type SurveyAnswers = Record<string, SurveyAnswer>;

export interface MySurveyResponse {
  answers: SurveyAnswers;
  completedAt: string | null;
  updatedAt: string;
}

export interface MySurvey {
  survey: SurveyDefinition;
  response: MySurveyResponse | null;
}

export interface SurveyStatus {
  surveyId: string;
  completed: boolean;
  dismissed: boolean;
  answered: number;
  total: number;
}

// ── Admin ──

export interface AdminSurveyRow {
  id: string;
  role: SurveyDefinition['role'];
  title: Localized;
  questionCount: number;
  completed: number;
  inProgress: number;
}

export interface AdminSurveyResults {
  survey: SurveyDefinition;
  completed: number;
  tallies: Record<string, { answered: number; options: Record<string, number> }>;
}

export interface AdminSurveyResponseRow {
  id: string;
  user: { id: string; fullName: string | null; email: string } | null;
  role: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  answered: number;
  total: number;
}

export interface AdminSurveyResponse extends AdminSurveyResponseRow {
  surveyId: string;
  answers: SurveyAnswers;
}
