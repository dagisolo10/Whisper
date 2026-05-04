import { useMemo } from "react";
import useTheme from "@/store/theme-store";

export default function useThemeColors() {
    const { isDark } = useTheme();

    return useMemo(() => {
        const darkColors = {
            accent: "#ff6569",
            success: "#00bc7d",
            primary: "#5b7cff",
            background: "#191921",
            foreground: "#ffffff",
            card: "#2d2d43",
            cardForeground: "#ffffff",
            muted: "#23232f",
            mutedForeground: "#73738c",
        };
        const lightColors = {
            accent: "#ea7a53",
            success: "#16a34a",
            primary: "#4f7cff",
            background: "#f8fafc",
            foreground: "#081126",
            card: "hsl(48, 68%, 89%)",
            cardForeground: "#081126",
            muted: "#e2e8f0",
            mutedForeground: "#334155",
        };
        const staticColors = { destructive: "#e35454", opaqueDestructive: "#e35454bf", border: "#2e2e3d" };

        return { ...staticColors, ...(isDark ? darkColors : lightColors) };
    }, [isDark]);
}

export type Colors = ReturnType<typeof useThemeColors>;
