import { create } from "zustand";

interface Theme {
    isDark: boolean;
    toggle: () => void;
}

const useTheme = create<Theme>((set) => ({
    isDark: !false,
    toggle: () => set((state) => ({ isDark: !state.isDark })),
}));

export default useTheme;
