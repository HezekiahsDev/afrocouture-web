'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { ErrorState, useRemote } from '@/components/marketplace/shared';
import { Spinner } from '@/components/orders/ui';
import { useI18n } from '@/i18n/I18nProvider';
import { completeSurvey, getMySurvey, localized, saveSurveyAnswers } from '@/lib/survey';
import type { MySurvey } from '@/types/survey';
import { SurveyForm } from './SurveyForm';

/** /survey: the signed-in member's testing survey for their role. */
export default function SurveyExperience() {
  return (
    <RequireAuth>
      <Survey />
    </RequireAuth>
  );
}

function Survey() {
  const { t } = useI18n();
  const { result, retry } = useRemote(() => getMySurvey(), []);

  if (result.state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#6B655C]" role="status">
        <Spinner label={t.survey.loading} />
      </div>
    );
  }
  if (result.state === 'error') {
    return (
      <div className="mx-auto max-w-xl py-16">
        <ErrorState message={result.message} onRetry={retry} />
      </div>
    );
  }
  return <SurveyPage data={result.data} />;
}

export function SurveyHeading({ data }: { data: Pick<MySurvey, 'survey'> }) {
  const { t, locale } = useI18n();
  return (
    <header className="flex flex-col gap-3">
      <span className="section-kicker">{t.survey.kicker}</span>
      <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] font-semibold leading-[1.05] text-[#171717] sm:text-[52px]">
        {localized(data.survey.title, locale)}
      </h1>
      <p className="max-w-2xl text-[15px] leading-relaxed text-[#5F5A52]">{localized(data.survey.intro, locale)}</p>
    </header>
  );
}

function SurveyPage({ data }: { data: MySurvey }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 py-10 sm:py-14">
      <SurveyHeading data={data} />
      <SurveyForm
        survey={data.survey}
        initialAnswers={data.response?.answers ?? {}}
        completed={Boolean(data.response?.completedAt)}
        onSave={async (patch) => (await saveSurveyAnswers(patch)).answers}
        onSubmit={async () => {
          await completeSurvey();
        }}
      />
    </div>
  );
}
