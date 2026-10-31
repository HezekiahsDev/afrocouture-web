'use client';

import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PortalHeader } from '@/components/onboarding/PortalHeader';
import { FitProfileForm } from '@/components/onboarding/fit/FitProfileForm';

export default function FitProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0E8] text-[#171717] selection:bg-[#B8734E] selection:text-[#F5F0E8]">
      <PortalHeader portal="Customer fit profile" current="Fit profile" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-24 sm:px-6 md:pt-28 lg:px-10">
        <RequireAuth role="customer">
          {/* FitProfileForm reads ?next= (where to return after saving). */}
          <Suspense fallback={null}>
            <FitProfileForm />
          </Suspense>
        </RequireAuth>
      </main>
      <footer className="border-t border-[#171717]/8 px-4 py-6 text-center text-[11px] text-[#6B655C]">
        © 2026 IPILE
      </footer>
    </div>
  );
}
