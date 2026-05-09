"use client";
import { Button } from "@/components/ui/button";
import { Lock, MessageSquarePlus } from "lucide-react";
import { motion } from "framer-motion";

const quickActions = [{ label: "New Message", icon: MessageSquarePlus, description: "Start a new conversation" }];

export default function NoOpenChat() {
    return (
        <section className="bg-background/50 relative hidden h-screen flex-1 xl:flex">
            <div className="bg-primary/10 absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full blur-[120px]" />
            <div className="bg-chart-3/5 absolute right-0 -bottom-24 size-96 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 text-center"
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="relative">
                    <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full opacity-20" />
                    <div className="bg-card border-border relative flex size-24 items-center justify-center rounded-[2em] border shadow-2xl backdrop-blur-md">
                        <div className="bg-primary/10 flex size-14 items-center justify-center rounded-xl">
                            <MessageSquarePlus className="text-primary size-7" />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }} className="space-y-3">
                    <h2 className="font-jakarta text-foreground text-4xl font-bold tracking-tight">Welcome to Whisper</h2>
                    <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
                        Your space for secure, seamless, and meaningful conversations. Select a chat to begin or start a fresh connection.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="flex w-full max-w-2xl justify-center gap-6"
                >
                    {quickActions.map(({ label, icon: Icon, description }) => (
                        <Button
                            key={label}
                            variant="outline"
                            className="bg-card/50 hover:bg-card group border-border hover:shadow-primary/5 flex h-auto w-64 flex-col items-center gap-4 rounded-[2rem] p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
                                <Icon className="size-6" />
                            </div>
                            <div className="">
                                <p className="font-jakarta text-foreground text-lg font-semibold">{label}</p>
                                <p className="text-muted-foreground mt-1 text-xs font-normal">{description}</p>
                            </div>
                        </Button>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="bg-muted/50 border-border text-muted-foreground absolute right-8 bottom-8 flex items-center gap-3 rounded-full border px-5 py-2.5 text-xs backdrop-blur-sm"
                >
                    <div className="flex size-2 items-center justify-center rounded-full bg-green-500/20">
                        <div className="size-1 rounded-full bg-green-500" />
                    </div>
                    <Lock className="size-3.5" />
                    <span className="font-medium">End-to-end encrypted</span>
                </motion.div>
            </motion.div>
        </section>
    );
}
