'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ApiKeyModal from './ApiKeyModal';
import { isMockMode } from '@/providers/factory';

const MAX_LENGTH = 500;

export default function AgendaInput() {
  const { rawAgenda, setRawAgenda, startSimulation } = useStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    setMockMode(isMockMode());
  }, []);

  const charCount = rawAgenda.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = rawAgenda.trim().length === 0;

  const handleSubmit = () => {
    if (isEmpty || isOverLimit) return;
    startSimulation();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.5em] text-[var(--nerv-text-dim)] mb-2">
          NERV HEADQUARTERS — TERMINAL ACCESS
        </p>
        <h1 className="text-3xl md:text-5xl glow-orange tracking-[0.3em] font-bold">
          MAGI SYSTEM
        </h1>
        <p className="text-sm text-[var(--nerv-orange-dim)] mt-2 tracking-widest">
          MELCHIOR // BALTHASAR // CASPAR
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs tracking-widest text-[var(--nerv-green)]">
            AGENDA INPUT ▸
          </label>
          <button
            onClick={() => setShowApiKey(true)}
            className="text-xs tracking-wider text-[var(--nerv-text-dim)] hover:text-[var(--nerv-orange)] transition-colors"
          >
            {mockMode ? '🟡 MOCK MODE' : '🟢 API ACTIVE'} — CONFIG
          </button>
        </div>

        <textarea
          value={rawAgenda}
          onChange={e => setRawAgenda(e.target.value)}
          placeholder="안건을 입력하세요. 마기 시스템이 분석합니다..."
          rows={5}
          className="w-full bg-[var(--nerv-black)] nerv-border text-[var(--nerv-text)] p-4
                     font-mono text-sm resize-none focus:outline-none
                     placeholder:text-[var(--nerv-text-dim)]"
        />

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-[var(--nerv-text-dim)]">
            {isOverLimit && (
              <span className="text-[var(--nerv-red)]">⚠ 500자 제한 초과</span>
            )}
          </span>
          <span
            className={`text-xs font-mono ${
              isOverLimit
                ? 'text-[var(--nerv-red)] glow-red'
                : charCount > 400
                  ? 'text-[var(--nerv-orange)]'
                  : 'text-[var(--nerv-text-dim)]'
            }`}
          >
            {charCount} / {MAX_LENGTH}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit}
          className={`w-full mt-6 py-4 text-lg tracking-[0.3em] font-bold transition-all
            ${
              isEmpty || isOverLimit
                ? 'border border-[var(--nerv-text-dim)] text-[var(--nerv-text-dim)] cursor-not-allowed'
                : 'nerv-border text-[var(--nerv-orange)] glow-orange hover:bg-[var(--nerv-orange)] hover:text-black cursor-pointer'
            }`}
        >
          MAGI SYSTEM ACTIVATE
        </button>
      </div>

      <ApiKeyModal isOpen={showApiKey} onClose={() => {
        setShowApiKey(false);
        setMockMode(isMockMode());
      }} />
    </div>
  );
}
