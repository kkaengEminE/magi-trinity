'use client';

import { create } from 'zustand';
import {
  Phase,
  ChamberResult,
  GendoMediation,
  FinalChoice,
  ArchiveEntry,
} from '@/types';
import { getProvider } from '@/providers/factory';
import {
  CHAMBER_CONFIGS,
  preprocessAgenda,
  runChamber,
  runGendo,
} from '@/core/chamber';
import { tallyAll } from '@/core/voting';

interface MagiState {
  phase: Phase;
  rawAgenda: string;
  formattedAgenda: string;
  chamberResults: (ChamberResult | null)[];
  completedCount: number;
  totalApprove: number;
  totalReject: number;
  gendo: GendoMediation | null;
  error: string | null;
  archive: ArchiveEntry[];
  setRawAgenda: (text: string) => void;
  startSimulation: () => Promise<void>;
  makeFinalDecision: (choice: FinalChoice) => void;
  reset: () => void;
}

export const useStore = create<MagiState>((set, get) => ({
  phase: 'input',
  rawAgenda: '',
  formattedAgenda: '',
  chamberResults: Array(9).fill(null),
  completedCount: 0,
  totalApprove: 0,
  totalReject: 0,
  gendo: null,
  error: null,
  archive: [],

  setRawAgenda: (text: string) => set({ rawAgenda: text }),

  startSimulation: async () => {
    const { rawAgenda } = get();
    if (!rawAgenda.trim() || rawAgenda.length > 500) return;

    set({
      phase: 'computing',
      chamberResults: Array(9).fill(null),
      completedCount: 0,
      error: null,
      gendo: null,
    });

    const provider = getProvider();

    try {
      const formatted = await preprocessAgenda(provider, rawAgenda);
      set({ formattedAgenda: formatted });

      const results: ChamberResult[] = [];

      await Promise.all(
        CHAMBER_CONFIGS.map(async (config) => {
          const result = await runChamber(provider, config, formatted);
          results[config.id - 1] = result;

          set(state => {
            const newResults = [...state.chamberResults];
            newResults[config.id - 1] = result;
            return {
              chamberResults: newResults,
              completedCount: state.completedCount + 1,
            };
          });
        })
      );

      const { totalApprove, totalReject } = tallyAll(results);
      const gendo = await runGendo(provider, formatted, results);

      set({
        phase: 'result',
        totalApprove,
        totalReject,
        gendo,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.startsWith('NERV_COMM_FAILURE')) {
        set({
          error: '네르프 본부 통신 회선 장애 — 마기 시스템과의 연결이 두절되었습니다.',
          phase: 'input',
          chamberResults: Array(9).fill(null),
          completedCount: 0,
        });
      } else {
        set({ error: message, phase: 'input' });
      }
    }
  },

  makeFinalDecision: (choice: FinalChoice) => {
    const state = get();
    const completedResults = state.chamberResults.filter(
      (r): r is ChamberResult => r !== null
    );

    const entry: ArchiveEntry = {
      agenda: state.rawAgenda,
      formattedAgenda: state.formattedAgenda,
      chambers: completedResults,
      totalApprove: state.totalApprove,
      totalReject: state.totalReject,
      gendo: state.gendo!,
      finalChoice: choice,
      timestamp: Date.now(),
    };

    set(state => ({
      phase: 'decision',
      archive: [...state.archive, entry],
    }));
  },

  reset: () =>
    set({
      phase: 'input',
      rawAgenda: '',
      formattedAgenda: '',
      chamberResults: Array(9).fill(null),
      completedCount: 0,
      totalApprove: 0,
      totalReject: 0,
      gendo: null,
      error: null,
    }),
}));
