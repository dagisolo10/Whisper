"use client";

import { Button } from "@/components/ui/button";
import { EditIcon, Lock, MessageCircleMore, Zap } from "lucide-react";

const quickActions = [{ label: "New chat", icon: EditIcon }];

export default function NoOpenChat({ onClick }: { onClick: () => void }) {
    return (
        <section className="relative hidden overflow-hidden xl:flex">
            <div className="from-primary/18 absolute top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-radial from-0% to-transparent to-70% blur-2xl" />
            <div className="from-chart-3/12 absolute right-20 bottom-12 size-72 rounded-full bg-radial from-0% to-transparent to-70% blur-3xl" />

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
                <div className="absolute top-6 right-6">
                    <Button variant="outline" className="rounded-full" onClick={onClick}>
                        <MessageCircleMore className="size-4" />
                        Preview chat
                    </Button>
                </div>

                <div className="bg-card border-border flex size-24 items-center justify-center rounded-full border shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                        <Zap className="text-primary size-6" />
                    </div>
                </div>

                <div>
                    <h2 className="font-jakarta text-foreground text-3xl font-semibold tracking-tight">Whisper for desktop</h2>
                    <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-6">Select a conversation on the left to start messaging, or jump in with a quick action below.</p>
                </div>

                <div className="flex w-full max-w-3xl justify-center gap-8">
                    {quickActions.map(({ label, icon: Icon }) => (
                        <Button key={label} variant={"ghost"} className="border-border size-48 h-auto flex-col gap-4 rounded-[1.75rem] border p-6 hover:-translate-y-0.5" onClick={onClick}>
                            <div className="bg-primary/12 text-primary flex size-12 items-center justify-center rounded-2xl">
                                <Icon className="size-5" />
                            </div>
                            <p className="font-jakarta text-foreground font-semibold">{label}</p>
                        </Button>
                    ))}
                </div>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Lock className="size-4" />
                    <span>Your personal messages are end-to-end encrypted.</span>
                </div>
            </div>
        </section>
    );
}
