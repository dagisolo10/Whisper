"use client";
import { motion } from "framer-motion";
import Orb from "../ui/orb";
import GlitchText from "../ui/glitch-text";

export default function UltimateLoader() {
    return (
        <div className="fixed inset-0 z-9999 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black font-sans text-white selection:bg-none">
            <div className="absolute inset-0 z-0">
                <Orb hoverIntensity={2} rotateOnHover hue={0} forceHoverState={false} backgroundColor="#000000" />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]" />

            <div className="pointer-events-none absolute inset-0 z-10 [background:radial-gradient(circle_at_center,transparent_0%,#000_85%)]" />

            <div className="relative z-20 flex flex-col items-center gap-2">
                <GlitchText speed={0.4} enableShadows={true} className="font-black uppercase">
                    WHISPER
                </GlitchText>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-3"
                >
                    <span className="h-px w-8 bg-white/20" />
                    <p className="text-xs font-light tracking-[0.5em] text-white/50 uppercase">Loading System</p>
                    <span className="h-px w-8 bg-white/20" />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-12 z-20 flex flex-col items-center gap-4"
            >
                <div className="h-px w-32 overflow-hidden bg-white/5">
                    <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-full bg-linear-to-r from-transparent via-blue-500 to-transparent"
                    />
                </div>

                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase">End-to-End Encrypted</p>
                    <p className="text-[8px] tracking-widest text-gray-700 uppercase">v1.0.8 Secure Node</p>
                </div>
            </motion.div>

            <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.02] mix-blend-overlay">
                <div
                    className="h-full w-full"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 2px, transparent 4px)", backgroundSize: "100% 4px" }}
                />
            </div>
        </div>
    );
}
