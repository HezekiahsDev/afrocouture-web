'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { dismissSurveyPrompt, getMySurveyStatus } from '@/lib/survey';
import type { SurveyStatus } from '@/types/survey';
import type { User } from '@/types';

/**
 * A line under the navbar inviting members to the testing survey until they submit it
 * or close the prompt. Closing is saved on the account, so it stays closed everywhere.
 */
export function SurveyPrompt({ user, pathname, hidden }: { user: User; pathname: string; hidden: boolean }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<SurveyStatus | null>(null);

  useEffect(() => {
    if (user.role === 'admin') return;
    let cancelled = false;
    getMySurveyStatus()
      .then((s) => !cancelled && setStatus(s))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user.id, user.role]);

  if (hidden || !status || status.completed || status.dismissed || pathname.startsWith('/survey')) return null;

  function dismiss() {
    setStatus((s) => (s ? { ...s, dismissed: true } : s));
    dismissSurveyPrompt().catch(() => undefined);
  }

  return (
    <div className="mk-setup-banner mk-survey-prompt" role="status" data-testid="survey-prompt">
      <div className="mk-setup-inner">
        <ClipboardList size={16} aria-hidden="true" />
        <p>{t.survey.promptText}</p>
        <Link href="/survey">
          {status.answered > 0 ? t.survey.promptContinue(status.answered, status.total) : t.survey.promptStart}{' '}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <button type="button" className="mk-survey-dismiss" onClick={dismiss} aria-label={t.survey.dismiss} title={t.survey.dismiss}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
