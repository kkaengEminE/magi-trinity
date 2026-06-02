'use client';

import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, clearApiKey } from '@/providers/factory';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getApiKey();
      if (existing) setKey(existing);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
    } else {
      clearApiKey();
    }
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="nerv-border bg-[var(--nerv-gray)] p-6 w-full max-w-md">
        <h2 className="text-lg glow-orange mb-4 tracking-widest">
          API KEY CONFIGURATION
        </h2>

        <p className="text-xs text-[var(--nerv-text-dim)] mb-4">
          OpenRouter API 키를 입력하세요. 키는 브라우저 localStorage에만 저장되며 외부로 전송되지 않습니다.
          미입력 시 Mock 모드로 동작합니다.
        </p>

        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-or-v1-..."
          className="w-full bg-[var(--nerv-black)] border border-[var(--nerv-orange-dim)] text-[var(--nerv-green)]
                     p-3 font-mono text-sm focus:outline-none focus:border-[var(--nerv-orange)]
                     placeholder:text-[var(--nerv-text-dim)]"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 nerv-border bg-[var(--nerv-black)] text-[var(--nerv-orange)] py-2
                       hover:bg-[var(--nerv-orange)] hover:text-black transition-colors tracking-wider text-sm"
          >
            {saved ? '✓ SAVED' : 'SAVE'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[var(--nerv-text-dim)] text-[var(--nerv-text-dim)] py-2
                       hover:border-[var(--nerv-text)] hover:text-[var(--nerv-text)] transition-colors tracking-wider text-sm"
          >
            CLOSE
          </button>
        </div>

        <p className="text-xs text-[var(--nerv-text-dim)] mt-3 text-center">
          {key.trim() ? '🟢 API KEY SET — REAL MODE' : '🟡 NO KEY — MOCK MODE'}
        </p>
      </div>
    </div>
  );
}
