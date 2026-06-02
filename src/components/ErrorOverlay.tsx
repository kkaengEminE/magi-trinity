'use client';

import { useStore } from '@/store/useStore';

export default function ErrorOverlay() {
  const { error, reset } = useStore();

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="border-2 border-[var(--nerv-red)] bg-[var(--nerv-black)] p-8 max-w-md text-center
                      shadow-[0_0_30px_rgba(255,0,51,0.4)]">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="text-lg text-[var(--nerv-red)] glow-red tracking-[0.2em] mb-4">
          SYSTEM ERROR
        </h2>
        <p className="text-sm text-[var(--nerv-text)] mb-6 font-mono">
          {error}
        </p>
        <button
          onClick={reset}
          className="border border-[var(--nerv-red)] text-[var(--nerv-red)] px-6 py-2
                     hover:bg-[var(--nerv-red)] hover:text-black transition-colors tracking-wider"
        >
          RETURN TO BASE
        </button>
      </div>
    </div>
  );
}
