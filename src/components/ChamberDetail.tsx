'use client';

import { ChamberResult } from '@/types';

interface ChamberDetailProps {
  chamber: ChamberResult;
  isOpen: boolean;
  onToggle: () => void;
}

const ENGINE_LABELS: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'claude-3.5-sonnet': 'Claude',
  'gemini-1.5-pro': 'Gemini',
};

export default function ChamberDetail({ chamber, isOpen, onToggle }: ChamberDetailProps) {
  return (
    <div className="nerv-border mb-2">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-3 hover:bg-[var(--nerv-gray)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest text-[var(--nerv-orange)]">
            CHAMBER-{chamber.chamberId}
          </span>
          <span className="text-[10px] text-[var(--nerv-text-dim)]">
            [{chamber.type === 'independent' ? 'SOLO' : 'COLLAB'}]
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--nerv-text-dim)]">
            {chamber.approveCount}:{chamber.rejectCount}
          </span>
          <span
            className={`text-sm font-bold tracking-wider ${
              chamber.verdict === 'APPROVE' ? 'text-[var(--nerv-green)]' : 'text-[var(--nerv-red)]'
            }`}
          >
            {chamber.verdict === 'APPROVE' ? '가결' : '부결'}
          </span>
          <span className="text-[var(--nerv-text-dim)] text-xs">
            {isOpen ? '▾' : '▸'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[var(--nerv-gray-light)] p-3 space-y-2">
          {chamber.opinions.map((op, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`text-xs font-bold min-w-[60px] ${
                  op.vote === 'APPROVE' ? 'text-[var(--nerv-green)]' : 'text-[var(--nerv-red)]'
                }`}
              >
                {op.personaName}
              </span>
              <span className="text-[10px] text-[var(--nerv-text-dim)] min-w-[45px]">
                [{ENGINE_LABELS[op.aiEngine]}]
              </span>
              <span className="text-xs text-[var(--nerv-text)] flex-1">
                {op.opinion}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  op.vote === 'APPROVE' ? 'text-[var(--nerv-green)]' : 'text-[var(--nerv-red)]'
                }`}
              >
                {op.vote}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
