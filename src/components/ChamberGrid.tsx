'use client';

import { useStore } from '@/store/useStore';
import ChamberCard from './ChamberCard';

export default function ChamberGrid() {
  const { chamberResults, completedCount, formattedAgenda } = useStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-2">
          MAGI SYSTEM — COMPUTING
        </p>
        <h2 className="text-xl md:text-2xl glow-orange tracking-[0.2em]">
          연산 체임버 가동 중
        </h2>
      </div>

      {formattedAgenda && (
        <div className="w-full max-w-3xl mb-6 p-3 border border-[var(--nerv-gray-light)] text-center">
          <p className="text-xs text-[var(--nerv-text-dim)] mb-1 tracking-widest">AGENDA</p>
          <p className="text-sm text-[var(--nerv-green)]">{formattedAgenda}</p>
        </div>
      )}

      <div className="w-full max-w-3xl mb-4">
        <div className="flex justify-between text-xs text-[var(--nerv-text-dim)] mb-1">
          <span>PROGRESS</span>
          <span>{completedCount} / 9</span>
        </div>
        <div className="w-full h-1 bg-[var(--nerv-gray)]">
          <div
            className="h-full bg-[var(--nerv-orange)] transition-all duration-500"
            style={{ width: `${(completedCount / 9) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-3xl">
        {chamberResults.map((result, i) => (
          <ChamberCard key={i} index={i} result={result} />
        ))}
      </div>

      <p className="text-xs text-[var(--nerv-text-dim)] mt-6 animate-pulse tracking-wider">
        마기 시스템 동기화 중...
      </p>
    </div>
  );
}
