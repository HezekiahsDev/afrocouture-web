'use client';

import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PortalHeader } from '@/components/onboarding/PortalHeader';
import { FitProfileForm } from '@/components/onboarding/fit/FitProfileForm';

export default function FitProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090D16] text-[#F8FAFC] selection:bg-[#00A3FF] selection:text-[#090D16]">
      <PortalHeader portal="Customer fit profile" current="Fit profile" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-24 sm:px-6 md:pt-28 lg:px-10">
        <RequireAuth role="customer">
          {/* FitProfileForm reads ?next= (where to return after saving). */}
          <Suspense fallback={null}>
            <FitProfileForm />
          </Suspense>
        </RequireAuth>
      </main>
      <footer className="border-t border-white/[0.06] px-4 py-6 text-center text-[11px] text-[#64748B]">
        © 2026 AfroCouture AI
      </footer>
    </div>
  );
}
