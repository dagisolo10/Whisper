import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function TypingIndicator({ isTyping, small = false }: { isTyping: boolean; small?: boolean }): import("react/jsx-runtime").JSX.Element | null {
    if (!isTyping) return null;
    const size = small ? 2.5 : 3;

    return (
        <div className="flex items-center gap-2">
            <div className="inline-flex gap-1">
                {Array.from({ length: 3 }).map((val, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.15,
                            repeatType: "reverse",
                        }}
                        style={{ width: size, height: size }}
                        className={cn("rounded-full bg-emerald-500")}
                    />
                ))}
            </div>
            <p className="text-xs font-medium text-emerald-500">typing</p>
        </div>
    );
}
