import { create } from 'zustand';

export type IdeaViewMode = 'vault' | 'mind';
export type MindTab = 'everything' | 'spaces' | 'serendipity';

interface IdeaUiState {
  addSheetNonce: number;
  mindSheetNonce: number;
  viewMode: IdeaViewMode;
  mindTab: MindTab;
  activeSpaceId: string | null;
  mindSearch: string;
  requestAddSheet: () => void;
  requestMindSheet: () => void;
  setViewMode: (mode: IdeaViewMode) => void;
  setMindTab: (tab: MindTab) => void;
  setActiveSpaceId: (id: string | null) => void;
  setMindSearch: (search: string) => void;
}

export const useIdeaUiStore = create<IdeaUiState>((set) => ({
  addSheetNonce: 0,
  mindSheetNonce: 0,
  viewMode: 'vault',
  mindTab: 'everything',
  activeSpaceId: null,
  mindSearch: '',
  requestAddSheet: () => set((s) => ({ addSheetNonce: s.addSheetNonce + 1 })),
  requestMindSheet: () => set((s) => ({ mindSheetNonce: s.mindSheetNonce + 1 })),
  setViewMode: (viewMode) => set({ viewMode }),
  setMindTab: (mindTab) => set({ mindTab }),
  setActiveSpaceId: (activeSpaceId) => set({ activeSpaceId: activeSpaceId || null }),
  setMindSearch: (mindSearch) => set({ mindSearch }),
}));
