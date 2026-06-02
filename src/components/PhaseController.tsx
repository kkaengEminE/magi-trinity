'use client';

import { useStore } from '@/store/useStore';
import AgendaInput from './AgendaInput';
import ChamberGrid from './ChamberGrid';
import TrinityMatrix from './TrinityMatrix';
import FinalDecision from './FinalDecision';
import ErrorOverlay from './ErrorOverlay';

export default function PhaseController() {
  const { phase } = useStore();

  return (
    <>
      <ErrorOverlay />
      {phase === 'input' && <AgendaInput />}
      {phase === 'computing' && <ChamberGrid />}
      {phase === 'result' && (
        <div>
          <TrinityMatrix />
          <FinalDecision />
        </div>
      )}
      {phase === 'decision' && <FinalDecision />}
    </>
  );
}
