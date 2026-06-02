'use client';

import { ChamberResult } from '@/types';
import { CHAMBER_CONFIGS } from '@/core/chamber';

interface ChamberCardProps {
  index: number;
  result: ChamberResult | null;
}

const ENGINE_LABELS: Record<string, string> = {
  'gpt-4o': 'GPT',
  'claude-3.5-sonnet': 'CLD',
  'gemini-1.5-pro': 'GEM',
};

export default function ChamberCard({ index, result }: ChamberCardProps) {
  const config = CHAMBER_CONFIGS[index];
  const isLoading = result === null;

  return (
    <div
      className={`nerv-border p-3 transition-all duration-500 ${
        isLoading
          ? 'opacity-60 animate-pulse-glow'
          : result.verdict === 'APPROVE'
            ? 'border-[var(--nerv-green)] shadow-[0_0_10px_rgba(0,255,65,0.3)]'
            : 'border-[var(--nerv-red)] shadow-[0_0_10px_rgba(255,0,51,0.3)]'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs tracking-widest text-[var(--nerv-orange)]">
          CHAMBER-{config.id}
        </span>
        <span className="text-[10px] tracking-wider text-[var(--nerv-text-dim)]">
          {config.type === 'independent' ? 'SOLO' : 'COLLAB'}
        </span>
      </div>

      <div className="flex gap-1 mb-2 text-[10px] font-mono">
        <span className="text-[var(--nerv-text-dim)]">M:</span>
        <span className="text-[var(--nerv-green)]">{ENGINE_LABELS[config.assignments.melchior]}</span>
        <span className="text-[var(--nerv-text-dim)] ml-1">B:</span>
        <span className="text-[var(--nerv-green)]">{ENGINE_LABELS[config.assignments.balthasar]}</span>
        <span className="text-[var(--nerv-text-dim)] ml-1">C:</span>
        <span className="text-[var(--nerv-green)]">{ENGINE_LABELS[config.assignments.caspar]}</span>
      </div>

      {isLoading ? (
        <div className="text-xs text-[var(--nerv-orange)] animate-pulse tracking-wider">
          동기화 중...
        </div>
      ) : (
        <div className="text-center">
          <span
            className={`text-lg font-bold tracking-widest ${
              result.verdict === 'APPROVE' ? 'text-[var(--nerv-green)] glow-green' : 'text-[var(--nerv-red)] glow-red'
            }`}
          >
            {result.verdict === 'APPROVE' ? '가결' : '부결'}
          </span>
          <div className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            {result.approveCount}:{result.rejectCount}
          </div>
        </div>
      )}
    </div>
  );
}
