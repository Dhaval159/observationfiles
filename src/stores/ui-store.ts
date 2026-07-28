import { create } from "zustand";
import type { Toast, ModalConfig, DrawerConfig } from "@/types/ui";

interface UIStore {
  toasts: Toast[];
  modal: ModalConfig | null;
  drawer: DrawerConfig | null;
  sidebarOpen: boolean;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  openModal: (config: Omit<ModalConfig, "isOpen">) => void;
  closeModal: () => void;
  openDrawer: (config: Omit<DrawerConfig, "isOpen">) => void;
  closeDrawer: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

let toastId = 0;

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  modal: null,
  drawer: null,
  sidebarOpen: true,

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast-${++toastId}` }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (config) =>
    set({ modal: { ...config, isOpen: true } }),

  closeModal: () =>
    set({ modal: null }),

  openDrawer: (config) =>
    set({ drawer: { ...config, isOpen: true } }),

  closeDrawer: () =>
    set({ drawer: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),
}));
