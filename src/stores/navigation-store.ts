import { create } from "zustand";
import type { BreadcrumbItem } from "@/types/ui";

interface NavigationStore {
  breadcrumbs: BreadcrumbItem[];
  previousPath: string | null;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setPreviousPath: (path: string | null) => void;
  reset: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  breadcrumbs: [],
  previousPath: null,
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setPreviousPath: (path) => set({ previousPath: path }),
  reset: () => set({ breadcrumbs: [], previousPath: null }),
}));
