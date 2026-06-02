'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ChamberResult } from '@/types';
import ChamberDetail from './ChamberDetail';
import GendoMediationComponent from './GendoMediation';

export default function TrinityMatrix() {
  const { chamberResults, totalApprove, totalReject, formattedAgenda, gendo } = useStore();
  const [openChamber, setOpenChamber] = useState<number | null>(null);

  const chambers = chamberResults.filter(
    (r): r is ChamberResult => r !== null
  );

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-2">
          MAGI SYSTEM — ANALYSIS COMPLETE
        </p>
        <h2 className="text-xl md:text-2xl glow-orange tracking-[0.2em]">
          TRINITY MATRIX
        </h2>
      </div>

      <div className="w-full max-w-3xl mb-4 p-3 border border-[var(--nerv-gray-light)] text-center">
        <p className="text-xs text-[var(--nerv-text-dim)] mb-1 tracking-widest">AGENDA</p>
        <p className="text-sm text-[var(--nerv-green)]">{formattedAgenda}</p>
      </div>

      <div className="flex gap-8 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-[var(--nerv-green)] glow-green">
            {totalApprove}
          </p>
          <p className="text-xs tracking-widest text-[var(--nerv-green)]">APPROVE</p>
        </div>
        <div className="text-2xl text-[var(--nerv-text-dim)] flex items-center">:</div>
        <div className="text-center">
          <p className="text-3xl font-bold text-[var(--nerv-red)] glow-red">
            {totalReject}
          </p>
          <p className="text-xs tracking-widest text-[var(--nerv-red)]">REJECT</p>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <p className="text-xs tracking-widest text-[var(--nerv-text-dim)] mb-3">
          CHAMBER RESULTS — 클릭하여 상세 보기
        </p>
        {chambers.map(chamber => (
          <ChamberDetail
            key={chamber.chamberId}
            chamber={chamber}
            isOpen={openChamber === chamber.chamberId}
            onToggle={() =>
              setOpenChamber(prev =>
                prev === chamber.chamberId ? null : chamber.chamberId
              )
            }
          />
        ))}
      </div>

      {gendo && <GendoMediationComponent gendo={gendo} />}
    </div>
  );
}
