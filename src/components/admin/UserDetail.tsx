'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldOff, ShieldCheck } from 'lucide-react';
import { getUser, reactivateUser, suspendUser } from '@/lib/admin';
import { apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRemote, ErrorState } from '@/components/marketplace/shared';
import { StatusPill } from '@/components/orders/ui';
import type { AdminUserDetail } from '@/types/admin';
import { useAdminQueues } from './AdminShell';
import { Alert, Facts, Loading, Panel, Pill, fmtDate, naira } from './ui';
import { ROLE_NAME, UserStatus } from './UsersPanel';
import { AuditList } from './AuditPanel';

export function UserDetail({ id }: { id: string }) {
  const { result, retry } = useRemote(() => getUser(id), [id]);
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/users" className="back-link w-fit">
        <ArrowLeft size={16} /> All users
      </Link>
      {result.state === 'loading' && <Loading label="Loading user" />}
      {result.state === 'error' && <ErrorState message={result.message} onRetry={retry} />}
      {result.state === 'ready' && <Detail initial={result.data} />}
    </div>
  );
}

function Detail({ initial }: { initial: AdminUserDetail }) {
  const { user: me } = useAuth();
  const { refreshQueues } = useAdminQueues();
  const [data, setData] = useState(initial);
  const [auditKey, setAuditKey] = useState(0);
  const { user, stats, tailorProfile, merchantProfile, recentOrders } = data;
  const canModerate = user.role !== 'admin' && user.id !== me?.id;

  const onChanged = async () => {
    setData(await getUser(user.id));
    setAuditKey((k) => k + 1);
    refreshQueues();
  };

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F5637]">{ROLE_NAME[user.role]}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#171717] sm:text-3xl">{user.fullName ?? 'No name'}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6B655C]">
            {user.email} <UserStatus status={user.status} verified={user.emailVerified} />
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Orders as customer" value={String(stats.ordersAsCustomer)} />
        <Tile label="Orders as artisan" value={String(stats.ordersAsTailor)} />
        <Tile label="Spent" value={naira(stats.spent)} />
        <Tile label="Paid out to them" value={naira(stats.earned)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Panel title="Account">
            <Facts
              rows={[
                ['Email', user.email],
                ['Phone', user.phone],
                ['Email verified', user.emailVerified ? 'Yes' : 'No'],
                ['Joined', fmtDate(user.createdAt)],
                ['Last updated', fmtDate(user.updatedAt)],
                ...(user.status === 'suspended'
                  ? ([
                      ['Suspended', fmtDate(user.suspendedAt)],
                      ['Reason', user.suspensionReason],
                    ] as [string, string | null | undefined][])
                  : []),
              ]}
            />
          </Panel>

          {(tailorProfile || merchantProfile) && (
            <Panel title="Profile">
              {tailorProfile && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#171717]">{tailorProfile.atelierName ?? tailorProfile.displayName ?? 'Atelier'}</p>
                    <p className="text-xs text-[#6B655C]">
                      {tailorProfile.city ?? '—'} · {tailorProfile.rating !== null ? `${tailorProfile.rating.toFixed(1)} ★ (${tailorProfile.reviewCount})` : 'No reviews'}
                    </p>
                  </div>
                  <span className="flex items-center gap-2">
                    <KycPill status={tailorProfile.kycStatus} />
                    {tailorProfile.kycStatus === 'approved' && (
                      <Link href={`/tailors/${tailorProfile.id}`} className="btn-ghost px-3 py-1.5" target="_blank">
                        Public profile <ExternalLink size={13} aria-hidden="true" />
                      </Link>
                    )}
                  </span>
                </div>
              )}
              {merchantProfile && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#171717]">{merchantProfile.businessName ?? 'Business'}</p>
                    <p className="text-xs text-[#6B655C]">{merchantProfile.city ?? '—'}</p>
                  </div>
                  <span className="flex items-center gap-2">
                    <KycPill status={merchantProfile.verificationStatus} />
                    <Link href={`/admin/fabrics?q=${encodeURIComponent(merchantProfile.businessName ?? '')}`} className="btn-ghost px-3 py-1.5">
                      Their fabrics
                    </Link>
                  </span>
                </div>
              )}
            </Panel>
          )}

          <Panel title="Recent orders">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[#6B655C]">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-[#171717]">
                      <span>
                        <span className="font-mono text-sm font-bold text-[#171717]">{o.reference}</span>{' '}
                        <span className="text-sm text-[#6B655C]">
                          {o.garmentType} · as {o.as === 'customer' ? 'customer' : 'artisan'}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm tabular-nums text-[#171717]">{naira(o.totalAmount)}</span>
                        <StatusPill status={o.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          {canModerate ? (
            <SuspendPanel userId={user.id} suspended={user.status === 'suspended'} onChanged={onChanged} />
          ) : (
            <Panel title="Access">
              <p className="text-sm text-[#6B655C]">
                {user.id === me?.id ? 'This is your account.' : 'Admin accounts'} can&apos;t be suspended from the dashboard.
                {user.role === 'admin' && ' Manage admins on the server with the admin scripts.'}
              </p>
            </Panel>
          )}
          <Panel title="Admin history">
            <AuditList key={auditKey} filter={{ targetType: 'user', targetId: user.id }} compact />
          </Panel>
        </div>
      </div>
    </>
  );
}

function SuspendPanel({ userId, suspended, onChanged }: { userId: string; suspended: boolean; onChanged: () => Promise<void> }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (suspended) await reactivateUser(userId);
      else await suspendUser(userId, reason.trim());
      setReason('');
      setConfirming(false);
      await onChanged();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title={suspended ? 'Reactivate account' : 'Suspend account'}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {suspended ? (
          <p className="text-sm text-[#6B655C]">They&apos;ll be able to sign in again straight away and will get an email.</p>
        ) : (
          <>
            <p className="text-sm text-[#6B655C]">
              They&apos;re signed out everywhere and can&apos;t sign in until reactivated. Orders and payouts already in progress
              continue. They&apos;ll get an email with your reason.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#6B655C]">Reason (sent to them)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minLength={5}
                maxLength={500}
                required
                className="min-h-24 rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 px-3 py-2 text-sm text-[#171717] outline-none focus:border-[#B8734E]"
              />
            </label>
          </>
        )}
        {error && <Alert>{error}</Alert>}
        {!suspended && !confirming ? (
          <button
            type="button"
            className="btn-ghost self-start border-[#9B2C24]/40 text-[#9B2C24]"
            disabled={reason.trim().length < 5}
            onClick={() => setConfirming(true)}
          >
            <ShieldOff size={15} aria-hidden="true" /> Suspend…
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={suspended ? 'btn-primary' : 'btn-primary bg-[#9B2C24] hover:bg-[#A33A30]'} disabled={busy}>
              {suspended ? <ShieldCheck size={15} aria-hidden="true" /> : <ShieldOff size={15} aria-hidden="true" />}
              {busy ? 'Saving…' : suspended ? 'Reactivate account' : 'Confirm suspension'}
            </button>
            {!suspended && (
              <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            )}
          </div>
        )}
      </form>
    </Panel>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#171717]/10 bg-[#FFFFFF]/80 p-4">
      <p className="text-xs text-[#6B655C]">{label}</p>
      <p className="mt-1 text-xl font-extrabold tabular-nums text-[#171717]">{value}</p>
    </div>
  );
}

export function KycPill({ status }: { status: string }) {
  const tone = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : status === 'draft' ? 'neutral' : 'amber';
  return <Pill tone={tone}>{status.replace('_', ' ')}</Pill>;
}
