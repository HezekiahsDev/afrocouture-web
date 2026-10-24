'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { listUsers } from '@/lib/admin';
import { useRemote, ErrorState } from '@/components/marketplace/shared';
import type { UserRole } from '@/types';
import { AdminHeading } from './AdminShell';
import { Chips, Empty, Loading, Pager, Pill, SearchBox, fmtDate } from './ui';
import { useUrlFilters } from './useUrlFilters';

const ROLES = [
  { value: '', label: 'Everyone' },
  { value: 'customer', label: 'Customers' },
  { value: 'tailor', label: 'Artisans' },
  { value: 'merchant', label: 'Merchants' },
  { value: 'admin', label: 'Admins' },
];
const STATUSES = [
  { value: '', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];
export const ROLE_NAME: Record<UserRole, string> = { customer: 'Customer', tailor: 'Artisan', merchant: 'Merchant', admin: 'Admin' };
const LIMIT = 25;

export function UsersPanel() {
  const [f, set] = useUrlFilters(['q', 'role', 'status', 'page'] as const);
  const page = Number(f.page) || 1;
  const { result, retry } = useRemote(
    () => listUsers({ q: f.q || undefined, role: (f.role || undefined) as UserRole | undefined, status: f.status || undefined, page, limit: LIMIT }),
    [f.q, f.role, f.status, page],
  );

  return (
    <>
      <AdminHeading kicker="Community" title="Users" />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox label="Search users" placeholder="Name or email" value={f.q} onChange={(q) => set({ q })} />
        <div className="flex flex-wrap gap-3">
          <Chips label="Role" value={f.role} onChange={(role) => set({ role })} options={ROLES} />
          <Chips label="Status" value={f.status} onChange={(status) => set({ status })} options={STATUSES} />
        </div>
      </div>

      {result.state === 'loading' && <Loading label="Loading users" />}
      {result.state === 'error' && <ErrorState message={result.message} onRetry={retry} />}
      {result.state === 'ready' && result.data.items.length === 0 && <Empty>No users match these filters.</Empty>}
      {result.state === 'ready' && result.data.items.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-[#0F172A] text-[11px] uppercase tracking-wider text-[#94A3B8]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Person</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((u) => (
                  <tr key={u.id} className="border-t border-white/[0.06] bg-[#0F172A]/60 hover:bg-[#1E293B]/60" data-testid="user-row">
                    <td className="max-w-[320px] px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="block truncate font-semibold text-[#F8FAFC] hover:text-[#38BDF8]">
                        {u.fullName ?? 'No name'}
                      </Link>
                      <span className="block truncate text-xs text-[#94A3B8]">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">{ROLE_NAME[u.role]}</td>
                    <td className="px-4 py-3">
                      <UserStatus status={u.status} verified={u.emailVerified} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.orderCount}</td>
                    <td className="px-4 py-3 text-[#94A3B8]">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/users/${u.id}`} className="btn-ghost px-3 py-1.5" aria-label={`Open ${u.fullName ?? u.email}`}>
                        Open <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="divide-y divide-white/[0.06] md:hidden">
              {result.data.items.map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 bg-[#0F172A]/60 p-4">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[#F8FAFC]">{u.fullName ?? 'No name'}</span>
                      <span className="block truncate text-xs text-[#94A3B8]">{u.email}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                        {ROLE_NAME[u.role]} <UserStatus status={u.status} verified={u.emailVerified} />
                      </span>
                    </span>
                    <ChevronRight size={16} className="text-[#64748B]" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Pager page={page} limit={LIMIT} total={result.data.total} onPage={(p) => set({ page: String(p) })} />
        </div>
      )}
    </>
  );
}

export function UserStatus({ status, verified }: { status: string; verified: boolean }) {
  if (status === 'suspended') return <Pill tone="red">Suspended</Pill>;
  if (!verified) return <Pill tone="amber">Unverified email</Pill>;
  return <Pill tone="green">Active</Pill>;
}
