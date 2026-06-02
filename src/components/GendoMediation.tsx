'use client';

import { GendoMediation as GendoType } from '@/types';

interface GendoMediationProps {
  gendo: GendoType;
}

export default function GendoMediationComponent({ gendo }: GendoMediationProps) {
  return (
    <div className="w-full max-w-3xl mt-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-[var(--nerv-purple)]" />
        <span className="text-xs tracking-[0.3em] text-[var(--nerv-purple)]">
          COMMANDER IKARI
        </span>
        <div className="h-px flex-1 bg-[var(--nerv-purple)]" />
      </div>

      <div className="border-l-4 border-[var(--nerv-purple)] bg-[var(--nerv-gray)] p-4">
        <p className="text-xs text-[var(--nerv-purple)] tracking-widest mb-2">
          이카리 겐도 — 사령관 중재안
        </p>
        <p className="text-sm text-[var(--nerv-text)] leading-relaxed font-mono">
          &ldquo;{gendo.statement}&rdquo;
        </p>
      </div>
    </div>
  );
}
