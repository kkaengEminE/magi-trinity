'use client';

import { useStore } from '@/store/useStore';
import { FinalChoice } from '@/types';

export default function FinalDecision() {
  const { makeFinalDecision, totalApprove, totalReject, phase, archive, reset } = useStore();

  if (phase === 'decision') {
    const latest = archive[archive.length - 1];
    const choiceLabels: Record<FinalChoice, string> = {
      magi: '마기 다수결 채택',
      gendo: '사령관 권고안 채택',
      human: '인류보완계획 발동',
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-4">
            MAGI SYSTEM — SIMULATION COMPLETE
          </p>
          <h2 className="text-2xl md:text-3xl glow-orange tracking-[0.2em] mb-6">
            최종 명령 하달 완료
          </h2>
          <div className="nerv-border p-6 max-w-md mx-auto mb-8">
            <p className="text-xs text-[var(--nerv-text-dim)] tracking-widest mb-2">DECISION</p>
            <p className="text-lg text-[var(--nerv-green)] glow-green font-bold">
              {choiceLabels[latest.finalChoice]}
            </p>
            <p className="text-xs text-[var(--nerv-text-dim)] mt-2">
              MAGI {latest.totalApprove}:{latest.totalReject} | {new Date(latest.timestamp).toLocaleString('ko-KR')}
            </p>
          </div>

          <button
            onClick={reset}
            className="nerv-border px-8 py-3 text-[var(--nerv-orange)] tracking-[0.2em]
                       hover:bg-[var(--nerv-orange)] hover:text-black transition-colors"
          >
            NEW SIMULATION
          </button>
        </div>
      </div>
    );
  }

  const overallVerdict = totalApprove > totalReject ? '가결' : '부결';

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-12 px-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-[var(--nerv-orange)]" />
        <span className="text-xs tracking-[0.3em] text-[var(--nerv-orange)]">
          FINAL DECISION
        </span>
        <div className="h-px flex-1 bg-[var(--nerv-orange)]" />
      </div>

      <p className="text-xs text-[var(--nerv-text-dim)] text-center mb-6 tracking-wider">
        최종 명령을 하달하십시오, 사령관.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => makeFinalDecision('magi')}
          className="nerv-border p-4 text-left hover:bg-[var(--nerv-green)]/10 transition-colors group"
        >
          <span className="text-xs text-[var(--nerv-green)] tracking-widest">OPTION 01</span>
          <p className="text-sm text-[var(--nerv-text)] mt-2 font-bold group-hover:text-[var(--nerv-green)]">
            마기 다수결에 따른다
          </p>
          <p className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            MAGI 판정: {overallVerdict} ({totalApprove}:{totalReject})
          </p>
        </button>

        <button
          onClick={() => makeFinalDecision('gendo')}
          className="nerv-border p-4 text-left hover:bg-[var(--nerv-purple)]/10 transition-colors group"
        >
          <span className="text-xs text-[var(--nerv-purple)] tracking-widest">OPTION 02</span>
          <p className="text-sm text-[var(--nerv-text)] mt-2 font-bold group-hover:text-[var(--nerv-purple)]">
            사령관 권고안을 채택한다
          </p>
          <p className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            제3의 타협안 수용
          </p>
        </button>

        <button
          onClick={() => makeFinalDecision('human')}
          className="nerv-border p-4 text-left hover:bg-[var(--nerv-red)]/10 transition-colors group"
        >
          <span className="text-xs text-[var(--nerv-red)] tracking-widest">OPTION 03</span>
          <p className="text-sm text-[var(--nerv-text)] mt-2 font-bold group-hover:text-[var(--nerv-red)]">
            인류보완계획을 발동한다
          </p>
          <p className="text-[10px] text-[var(--nerv-text-dim)] mt-1">
            독자적 판단에 의한 결정
          </p>
        </button>
      </div>
    </div>
  );
}
