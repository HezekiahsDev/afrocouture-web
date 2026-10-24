'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, LoaderCircle, RefreshCw, Scissors, Store, X } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api';
import { getVerificationQueue, reviewMerchant, reviewTailor } from '@/lib/orders';
import type { KycStatus, MerchantProfile, TailorProfile } from '@/types';
import { useAdminQueues } from './AdminShell';
import { Alert, Chips, DocumentPreview, Facts, Pill, fmtDate, naira } from './ui';

type Applicant =
  | { kind: 'tailor'; profile: TailorProfile }
  | { kind: 'merchant'; profile: MerchantProfile };

const STATUS: { value: KycStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
const KIND: { value: 'all' | 'tailor' | 'merchant'; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'tailor', label: 'Artisans' },
  { value: 'merchant', label: 'Merchants' },
];

const nameOf = (a: Applicant) =>
  a.kind === 'tailor' ? a.profile.atelierName || a.profile.displayName || 'Unnamed atelier' : a.profile.businessName || 'Unnamed business';
const statusOf = (a: Applicant) => (a.kind === 'tailor' ? a.profile.kycStatus : a.profile.verificationStatus);
const key = (a: Applicant) => `${a.kind}:${a.profile.id}`;

export function VerificationsPanel() {
  const { refreshQueues } = useAdminQueues();
  const [status, setStatus] = useState<KycStatus>('pending');
  const [kind, setKind] = useState<'all' | 'tailor' | 'merchant'>('all');
  const [items, setItems] = useState<Applicant[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<Applicant | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setItems(null);
    setError('');
    try {
      const { tailors, merchants } = await getVerificationQueue(status);
      setItems([
        ...tailors.map((profile) => ({ kind: 'tailor' as const, profile })),
        ...merchants.map((profile) => ({ kind: 'merchant' as const, profile })),
      ].sort((a, b) => +new Date(a.profile.submittedAt ?? 0) - +new Date(b.profile.submittedAt ?? 0)));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load the verification queue.'));
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when the filter changes
    void load();
  }, [load]);

  const shown = items?.filter((a) => kind === 'all' || a.kind === kind) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Chips label="Status" value={status} onChange={setStatus} options={STATUS} />
          <Chips label="Who" value={kind} onChange={setKind} options={KIND} />
        </div>
        <button type="button" onClick={load} className="btn-ghost px-3 py-2" aria-label="Refresh queue">
          <RefreshCw size={14} aria-hidden="true" /> Refresh
        </button>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      {!shown && !error && (
        <div className="flex justify-center py-12 text-[#94A3B8]">
          <LoaderCircle className="animate-spin" size={24} aria-label="Loading queue" />
        </div>
      )}

      {shown && shown.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-sm text-[#94A3B8]">
          {status === 'pending' ? 'Nothing waiting for review. ' : 'No applications here yet.'}
        </p>
      )}

      {shown && shown.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-[#0F172A] text-[11px] uppercase tracking-wider text-[#94A3B8]">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={key(a)} className="border-t border-white/[0.06] bg-[#0F172A]/60 hover:bg-[#1E293B]/60" data-testid="applicant-row">
                  <td className="px-4 py-3 font-semibold text-[#F8FAFC]">{nameOf(a)}</td>
                  <td className="px-4 py-3">{a.kind === 'tailor' ? 'Artisan' : 'Merchant'}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{a.profile.city ?? '—'}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{fmtDate(a.profile.submittedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setOpen(a)} className="btn-ghost px-3 py-1.5">
                      Review <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-white/[0.06] md:hidden">
            {shown.map((a) => (
              <li key={key(a)}>
                <button type="button" onClick={() => setOpen(a)} className="flex w-full items-center gap-3 bg-[#0F172A]/60 p-4 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E293B] text-[#00A3FF]">
                    {a.kind === 'tailor' ? <Scissors size={18} /> : <Store size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[#F8FAFC]">{nameOf(a)}</span>
                    <span className="block text-xs text-[#94A3B8]">
                      {a.kind === 'tailor' ? 'Artisan' : 'Merchant'} · {a.profile.city ?? '—'} · {fmtDate(a.profile.submittedAt)}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-[#64748B]" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && (
        <VerificationDrawer
          applicant={open}
          onClose={() => setOpen(null)}
          onDecided={(a, decision, request) => {
            // Optimistically take it off the queue; put it back if the request fails.
            setItems((list) => list?.filter((x) => key(x) !== key(a)) ?? null);
            setOpen(null);
            setError('');
            setNotice(`${nameOf(a)} ${decision === 'approve' ? 'approved' : 'rejected'} — they’ve been emailed.`);
            request.then(refreshQueues, (err: unknown) => {
              setItems((list) => (list ? [a, ...list] : list));
              setNotice('');
              setError(`Could not record the decision for ${nameOf(a)}: ${apiErrorMessage(err)}`);
            });
          }}
        />
      )}
    </div>
  );
}

function VerificationDrawer({
  applicant,
  onClose,
  onDecided,
}: {
  applicant: Applicant;
  onClose: () => void;
  onDecided: (a: Applicant, decision: 'approve' | 'reject', request: Promise<unknown>) => void;
}) {
  const [mode, setMode] = useState<'idle' | 'reject'>('idle');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const status = statusOf(applicant);
  const reviewable = status === 'pending' || status === 'under_review';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function decide(decision: 'approve' | 'reject') {
    if (decision === 'reject' && note.trim().length < 5) {
      setError('Write a reason of at least 5 characters — it is emailed to the applicant.');
      return;
    }
    const reason = decision === 'reject' ? note.trim() : undefined;
    // The drawer closes straight away; a failure is reported back on the list.
    onDecided(
      applicant,
      decision,
      applicant.kind === 'tailor'
        ? reviewTailor(applicant.profile.id, decision, reason)
        : reviewMerchant(applicant.profile.id, decision, reason),
    );
  }

  const p = applicant.profile;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-[#090D16]/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Review ${nameOf(applicant)}`}
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#0B1120] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/[0.08] p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">
              {applicant.kind === 'tailor' ? 'Artisan verification' : 'Merchant verification'}
            </p>
            <h2 className="mt-1 truncate text-xl font-bold text-[#F8FAFC]">{nameOf(applicant)}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
              <Pill tone={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'amber'}>{status.replace('_', ' ')}</Pill>
              Submitted {fmtDate(p.submittedAt)}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {applicant.kind === 'tailor' ? <TailorDetails p={applicant.profile} /> : <MerchantDetails p={applicant.profile} />}
          {p.reviewNote && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Previous review note</h3>
              <p className="text-sm text-[#F8FAFC]">{p.reviewNote}</p>
            </div>
          )}
        </div>

        {reviewable && (
          <footer className="space-y-3 border-t border-white/[0.08] bg-[#0F172A] p-5">
            {mode === 'reject' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Reason (emailed to the applicant)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  autoFocus
                  placeholder="e.g. The CAC certificate is blurry — upload a clearer scan."
                  className="w-full rounded-xl border border-white/10 bg-[#090D16] px-3.5 py-2.5 text-sm text-[#F8FAFC] outline-none focus:border-[#00A3FF]"
                />
              </label>
            )}
            {error && <Alert>{error}</Alert>}
            <div className="flex flex-wrap justify-end gap-2">
              {mode === 'reject' ? (
                <>
                  <button type="button" className="btn-ghost" onClick={() => setMode('idle')}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('reject')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#93000a] px-5 py-3 text-[13px] font-semibold text-[#ffdad6] hover:brightness-110"
                  >
                    Send rejection
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-ghost" onClick={() => setMode('reject')}>
                    Reject…
                  </button>
                  <button type="button" className="btn-primary" onClick={() => decide('approve')}>
                    Approve
                  </button>
                </>
              )}
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">{title}</h3>
      {children}
    </div>
  );
}

function BankFacts({ p }: { p: TailorProfile | MerchantProfile }) {
  return (
    <Facts
      rows={[
        ['Bank', p.bankName ? `${p.bankName}${p.bankCode ? ` (${p.bankCode})` : ''}` : null],
        ['Account number', p.accountNumber],
        ['Account name', p.accountName],
      ]}
    />
  );
}

function TailorDetails({ p }: { p: TailorProfile }) {
  return (
    <>
      <Section title="Public profile">
        <Facts
          rows={[
            ['Display name', p.displayName],
            ['Atelier', p.atelierName],
            ['City', p.city],
            ['Craft', p.craft],
            ['Years of experience', p.yearsExperience],
            ['Starting price', naira(p.startingPrice)],
            ['Specialties', p.specialtyTags.join(', ')],
            ['Story', p.bio],
          ]}
        />
      </Section>
      <Section title="Identity">
        <Facts
          rows={[
            ['Legal name', p.legalName],
            ['Workshop address', p.workshopAddress],
            ['ID type', p.idType],
          ]}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DocumentPreview url={p.idDocumentUrl} label="ID document" />
          <DocumentPreview url={p.workshopPhotoUrl} label="Workshop photo" />
        </div>
      </Section>
      <Section title="Photos">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <DocumentPreview url={p.portraitUrl} label="Portrait" />
          <DocumentPreview url={p.coverImageUrl} label="Cover image" />
          {p.portfolioUrls.map((url, i) => (
            <DocumentPreview key={url} url={url} label={`Portfolio ${i + 1}`} />
          ))}
        </div>
      </Section>
      <Section title="Guild">
        <Facts rows={[['Guild or association', p.guildChapter], ['Membership ID', p.guildMembershipId]]} />
      </Section>
      <Section title="Payout account">
        <BankFacts p={p} />
      </Section>
    </>
  );
}

function MerchantDetails({ p }: { p: MerchantProfile }) {
  return (
    <>
      <Section title="Business">
        <Facts
          rows={[
            ['Business name', p.businessName],
            ['City', p.city],
            ['Market / warehouse', p.marketHub],
            ['Sourcing', p.sourcingType === 'direct_mill' ? 'Direct from mills or weavers' : p.sourcingType === 'importer' ? 'Importer / wholesaler' : null],
            ['Fabrics stocked', p.specialtyFabrics.join(', ')],
            ['Quality declaration', p.qualityDeclarationAccepted ? 'Accepted' : 'Not accepted'],
          ]}
        />
      </Section>
      <Section title="Registration">
        <Facts rows={[['CAC number', p.cacNumber]]} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DocumentPreview url={p.cacCertificateUrl} label="CAC certificate" />
          <DocumentPreview url={p.warehousePhotoUrl} label="Stall or warehouse photo" />
        </div>
      </Section>
      <Section title="Payout account">
        <BankFacts p={p} />
      </Section>
    </>
  );
}
