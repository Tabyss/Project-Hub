import { create } from 'zustand';

type ViewMode = 'portfolio' | 'devdocs';

interface ViewModeState {
  mode: ViewMode;
  toggleMode: () => void;
  setMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  mode: 'portfolio',
  toggleMode: () => set((state) => ({ 
    mode: state.mode === 'portfolio' ? 'devdocs' : 'portfolio' 
  })),
  setMode: (mode) => set({ mode }),
}));