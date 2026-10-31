'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Download, Eye, LoaderCircle } from 'lucide-react';
import { useRemote, ErrorState } from '@/components/marketplace/shared';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { SurveyHeading } from '@/components/survey/SurveyExperience';
import { downloadSurveyCsv, getSurveyResponse, getSurveyResults, listSurveyResponses, listSurveys } from '@/lib/admin';
import { apiErrorMessage } from '@/lib/api';
import { answerSummary, visibleQuestions } from '@/lib/survey';
import { LOCALES, LOCALE_META, type Locale } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import type { AdminSurveyResults } from '@/types/survey';
import { AdminHeading } from './AdminShell';
import { Alert, Chips, Empty, Facts, Loading, Pager, Panel, Pill, fmtDate } from './ui';
import { useUrlFilters } from './useUrlFilters';
import { ROLE_NAME } from './UsersPanel';

const LIMIT = 25;
const STATUSES = [
  { value: '', label: 'Everyone' },
  { value: 'completed', label: 'Submitted' },
  { value: 'in_progress', label: 'In progress' },
];

function ResponseStatus({ completedAt }: { completedAt: string | null }) {
  return completedAt ? <Pill tone="green">Submitted</Pill> : <Pill tone="amber">In progress</Pill>;
}

function DownloadCsv({ surveyId }: { surveyId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        className="btn-ghost px-3 py-1.5"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await downloadSurveyCsv(surveyId);
          } catch (err) {
            setError(apiErrorMessage(err, 'Could not download the CSV.'));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}
        Download CSV
      </button>
      {error && (
        <span className="text-xs text-[#9B2C24]" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}

/** /admin/surveys: one card per role's form. */
export function SurveysPanel() {
  const { result, retry } = useRemote(() => listSurveys(), []);
  return (
    <>
      <AdminHeading kicker="Community" title="Surveys" />
      <p className="-mt-3 mb-5 max-w-2xl text-sm text-[#6B655C]">
        Pre-launch testing forms. Each member answers the form for their role; questions adapt to earlier answers.
        CSV exports include names and emails and are recorded in the audit log.
      </p>
      {result.state === 'loading' && <Loading label="Loading surveys" />}
      {result.state === 'error' && <ErrorState message={result.message} onRetry={retry} />}
      {result.state === 'ready' && (
        <div className="grid gap-4 lg:grid-cols-3">
          {result.data.map((survey) => (
            <section key={survey.id} className="flex flex-col gap-4 rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-5" data-testid="survey-card">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F5637]">{ROLE_NAME[survey.role]}s</p>
                <h2 className="mt-1 text-lg font-bold text-[#171717]">{survey.title.en}</h2>
                <p className="text-xs text-[#6B655C]">
                  {survey.id} · {survey.questionCount} questions
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#2F6B4F]/8 p-3">
                  <dt className="text-xs text-[#6B655C]">Submitted</dt>
                  <dd className="text-2xl font-extrabold tabular-nums text-[#171717]">{survey.completed}</dd>
                </div>
                <div className="rounded-xl bg-[#8A6A1F]/8 p-3">
                  <dt className="text-xs text-[#6B655C]">In progress</dt>
                  <dd className="text-2xl font-extrabold tabular-nums text-[#171717]">{survey.inProgress}</dd>
                </div>
              </dl>
              <div className="mt-auto flex flex-wrap items-start gap-2">
                <Link href={`/admin/surveys/${survey.id}`} className="btn-ghost px-3 py-1.5">
                  Responses <ChevronRight size={14} aria-hidden="true" />
                </Link>
                <Link href={`/admin/surveys/${survey.id}/preview`} className="btn-ghost px-3 py-1.5">
                  <Eye size={14} aria-hidden="true" /> Preview
                </Link>
                <DownloadCsv surveyId={survey.id} />
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function Tallies({ data }: { data: AdminSurveyResults }) {
  const choice = data.survey.questions.filter((q) => q.kind === 'single' || q.kind === 'multi');
  if (!data.completed) return <Empty>No submitted responses yet.</Empty>;
  return (
    <div className="flex flex-col gap-6">
      {choice.map((question) => {
        const tally = data.tallies[question.id];
        return (
          <div key={question.id}>
            <h3 className="text-sm font-semibold text-[#171717]">{question.prompt.en}</h3>
            <p className="mb-2 text-xs text-[#6B655C]">
              {tally?.answered ?? 0} answered{question.kind === 'multi' ? ' · several choices allowed' : ''}
              {question.showIf ? ' · only asked after certain answers' : ''}
            </p>
            <ul className="flex flex-col gap-1.5">
              {question.options!.map((option) => {
                const count = tally?.options[option.id] ?? 0;
                const pct = tally?.answered ? Math.round((count / tally.answered) * 100) : 0;
                return (
                  <li key={option.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-sm">
                    <span className="truncate text-[#4B453E]">{option.label.en}</span>
                    <span className="tabular-nums text-[#6B655C]">
                      {count} · {pct}%
                    </span>
                    <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-[#171717]/8" aria-hidden="true">
                      <span className="block h-full rounded-full bg-[#B8734E]" style={{ width: `${pct}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-[#6B655C]">Written answers are in each response and in the CSV.</p>
    </div>
  );
}

/** /admin/surveys/[surveyId]: option tallies and the list of responses. */
export function SurveyResultsPanel({ surveyId }: { surveyId: string }) {
  const [f, set] = useUrlFilters(['status', 'page'] as const);
  const page = Number(f.page) || 1;
  const results = useRemote(() => getSurveyResults(surveyId), [surveyId]);
  const responses = useRemote(
    () => listSurveyResponses(surveyId, { status: (f.status || undefined) as 'completed' | 'in_progress' | undefined, page, limit: LIMIT }),
    [surveyId, f.status, page],
  );

  return (
    <>
      <Link href="/admin/surveys" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B655C] hover:text-[#171717]">
        <ArrowLeft size={15} aria-hidden="true" /> All surveys
      </Link>
      <AdminHeading kicker="Surveys" title={results.result.state === 'ready' ? results.result.data.survey.title.en : 'Survey'}>
        <div className="flex flex-wrap items-start gap-2">
          <Link href={`/admin/surveys/${surveyId}/preview`} className="btn-ghost px-3 py-1.5">
            <Eye size={14} aria-hidden="true" /> Preview
          </Link>
          <DownloadCsv surveyId={surveyId} />
        </div>
      </AdminHeading>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel title={results.result.state === 'ready' ? `Submitted answers (${results.result.data.completed})` : 'Submitted answers'}>
          {results.result.state === 'loading' && <Loading label="Loading results" />}
          {results.result.state === 'error' && <ErrorState message={results.result.message} onRetry={results.retry} />}
          {results.result.state === 'ready' && <Tallies data={results.result.data} />}
        </Panel>
        <Panel title="Responses" actions={<Chips label="Status" value={f.status} onChange={(status) => set({ status })} options={STATUSES} />}>
          {responses.result.state === 'loading' && <Loading label="Loading responses" />}
          {responses.result.state === 'error' && <ErrorState message={responses.result.message} onRetry={responses.retry} />}
          {responses.result.state === 'ready' && responses.result.data.items.length === 0 && <Empty>No responses yet.</Empty>}
          {responses.result.state === 'ready' && responses.result.data.items.length > 0 && (
            <div className="flex flex-col gap-4">
              <ul className="divide-y divide-[#171717]/8 overflow-hidden rounded-xl border border-[#171717]/10">
                {responses.result.data.items.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/surveys/responses/${r.id}`} className="flex items-center gap-3 bg-[#FFFFFF]/60 p-3.5 hover:bg-[#FFFFFF]" data-testid="survey-response-row">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-[#171717]">{r.user?.fullName ?? r.user?.email ?? 'Deleted account'}</span>
                        <span className="block truncate text-xs text-[#6B655C]">{r.user?.email}</span>
                      </span>
                      <span className="hidden text-xs tabular-nums text-[#6B655C] sm:block">
                        {r.answered}/{r.total} answered
                      </span>
                      <ResponseStatus completedAt={r.completedAt} />
                      <span className="hidden w-24 text-right text-xs text-[#6B655C] sm:block">{fmtDate(r.updatedAt)}</span>
                      <ChevronRight size={16} className="text-[#6B655C]" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Pager page={page} limit={LIMIT} total={responses.result.data.total} onPage={(p) => set({ page: String(p) })} />
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

/** /admin/surveys/responses/[id]: one person's answers. */
export function SurveyResponseDetail({ id }: { id: string }) {
  const { result, retry } = useRemote(async () => {
    const response = await getSurveyResponse(id);
    return { response, results: await getSurveyResults(response.surveyId) };
  }, [id]);

  if (result.state === 'loading') return <Loading label="Loading response" />;
  if (result.state === 'error') return <ErrorState message={result.message} onRetry={retry} />;
  const { response, results } = result.data;
  const survey = results.survey;

  return (
    <>
      <Link href={`/admin/surveys/${survey.id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B655C] hover:text-[#171717]">
        <ArrowLeft size={15} aria-hidden="true" /> {survey.title.en}
      </Link>
      <AdminHeading kicker="Survey response" title={response.user?.fullName ?? response.user?.email ?? 'Deleted account'}>
        <ResponseStatus completedAt={response.completedAt} />
      </AdminHeading>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Panel title="Details">
          <Facts
            rows={[
              ['Email', response.user ? <Link href={`/admin/users/${response.user.id}`} className="font-semibold text-[#8F5637] hover:underline">{response.user.email}</Link> : '—'],
              ['Role', response.role],
              ['Progress', `${response.answered}/${response.total} answered`],
              ['Started', fmtDate(response.createdAt)],
              ['Last change', fmtDate(response.updatedAt)],
              ['Submitted', response.completedAt ? fmtDate(response.completedAt) : '—'],
            ]}
          />
        </Panel>
        <Panel title="Answers">
          <ol className="flex flex-col divide-y divide-[#171717]/8">
            {visibleQuestions(survey, response.answers).map((question, index) => {
              const lines = answerSummary(question, response.answers[question.id], 'en');
              return (
                <li key={question.id} className="py-3.5 first:pt-0">
                  <p className="text-sm font-semibold text-[#171717]">
                    {index + 1}. {question.prompt.en}
                  </p>
                  {lines.length ? (
                    <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[#4B453E]">
                      {lines.map((line, i) => (
                        <li key={i} className="whitespace-pre-line break-words">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm italic text-[#6B655C]">Not answered</p>
                  )}
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>
    </>
  );
}

/** /admin/surveys/[surveyId]/preview: the form as a member sees it, with nothing saved. */
export function SurveyPreviewPanel({ surveyId }: { surveyId: string }) {
  const { locale, setLocale } = useI18n();
  const { result, retry } = useRemote(() => getSurveyResults(surveyId), [surveyId]);
  if (result.state === 'loading') return <Loading label="Loading survey" />;
  if (result.state === 'error') return <ErrorState message={result.message} onRetry={retry} />;
  const { survey } = result.data;
  return (
    <>
      <Link href={`/admin/surveys/${survey.id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B655C] hover:text-[#171717]">
        <ArrowLeft size={15} aria-hidden="true" /> {survey.title.en}
      </Link>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Alert tone="success">Preview: answers are not saved. Questions branch exactly as members see them.</Alert>
        <Chips
          label="Language"
          value={locale}
          onChange={(code) => setLocale(code as Locale)}
          options={LOCALES.map((code) => ({ value: code, label: LOCALE_META[code].nativeName }))}
        />
        <SurveyHeading data={{ survey }} />
        <SurveyForm survey={survey} initialAnswers={{}} preview />
      </div>
    </>
  );
}
