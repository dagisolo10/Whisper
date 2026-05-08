import { create } from "zustand";

interface SideBar {
    sidebar: boolean;
    setSidebar: (val: boolean) => void;
    toggleSidebar: () => void;
}

const useUtil = create<SideBar>((set) => ({
    sidebar: false,
    setSidebar: (val) => set({ sidebar: val }),
    toggleSidebar: () => set((s) => ({ sidebar: !s.sidebar })),
}));

export default useUtil;
