import { create } from 'zustand';
import { currentPeriod } from '@/lib/format';

/**
 * uiStore.ts — ephemeral UI state.
 *
 * NOT persisted — resets on every page load.
 * Holds transient state that affects the UI but not data:
 *   - Sidebar open/closed on mobile
 *   - Active period picker value
 *   - Global loading state
 *
 * Period picker is the most important piece —
 * it's shared across the dashboard, members, and reports pages
 * so changing the period in the topbar updates all panels.
 */

interface UiState {
  // Sidebar
  sidebarOpen: boolean;
  openSidebar:  () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Period picker — YYYY-MM shared across dashboard + reports
  activePeriod: string;
  setActivePeriod: (period: string) => void;

  // Global loading overlay (for multi-step operations)
  globalLoading: boolean;
  setGlobalLoading: (v: boolean) => void;

  // Active modal — string ID of which modal is open
  activeModal: string | null;
  openModal:   (id: string) => void;
  closeModal:  () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  // Sidebar
  sidebarOpen: false,
  openSidebar:   () => set({ sidebarOpen: true }),
  closeSidebar:  () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Period picker
  activePeriod:    currentPeriod(),
  setActivePeriod: (period) => set({ activePeriod: period }),

  // Global loading
  globalLoading:    false,
  setGlobalLoading: (v) => set({ globalLoading: v }),

  // Modal
  activeModal: null,
  openModal:   (id) => set({ activeModal: id }),
  closeModal:  ()   => set({ activeModal: null }),
}));