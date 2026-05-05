"use client";

import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserPlus, LogIn, KeyRound, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTENT_MAP = {
    "/sign-in": {
        title: (
            <>
                Quiet chats, <br /> right where you left them
            </>
        ),
        description: "Sign in with email or Google and jump straight back into your private workspace.",
    },
    "/sign-up": {
        title: (
            <>
                Create a calm <br /> place to talk
            </>
        ),
        description: "Set up your account in a minute and keep every conversation neatly in sync.",
    },
    "/forgot-password": {
        title: (
            <>
                Reset access <br /> without the stress
            </>
        ),
        description: "We’ll send a secure code to your inbox so you can choose a new password safely.",
    },
    "/verification": {
        title: (
            <>
                One more step <br /> and you’re in
            </>
        ),
        description: "Use the email code we sent to confirm your account and finish setup.",
    },
    "/sign-in/continue": {
        title: (
            <>
                Finishing your <br /> secure sign-in
            </>
        ),
        description: "We’re wrapping up your Google authentication and checking if we still need profile details.",
    },
};

const NAV_STEPS = [
    { id: 1, text: "Sign In", href: "/sign-in", icon: LogIn },
    { id: 2, text: "Sign Up", href: "/sign-up", icon: UserPlus },
    { id: 3, text: "Recover", href: "/forgot-password", icon: KeyRound },
];

export default function Side() {
    const pathname = usePathname();
    const content = CONTENT_MAP[pathname as keyof typeof CONTENT_MAP] || CONTENT_MAP["/sign-in"];

    // bg-[radial-gradient(circle_at_top_left,rgba(86,131,255,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(160deg,#12131a_0%,#161922_48%,#0e1016_100%)]

    return (
        <aside className="relative hidden flex-col gap-8 rounded-4xl border p-8 lg:flex">
            <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent" />
            <div className="space-y-2">
                <h1 className="text-2xl leading-tight font-semibold tracking-tight text-white xl:text-3xl">{content.title}</h1>
                <p className="text-muted-foreground max-w-md text-xs">{content.description}</p>
            </div>

            <div className="mt-auto grid w-full grid-cols-3 gap-4">
                {NAV_STEPS.map((step) => {
                    const isActive = pathname === step.href;
                    const Icon = step.icon;

                    return (
                        <Link key={step.id} href={step.href} className={cn("transition-all duration-200", isActive ? "pointer-events-none" : "hover:opacity-70")}>
                            <Card
                                className={cn("flex flex-col gap-4 border-none p-4 shadow-none transition-colors", isActive ? "bg-white/15 shadow-2xl ring-1 shadow-white/5" : "bg-white/5 opacity-60")}
                            >
                                <div className={cn("flex size-8 items-center justify-center rounded-full transition-colors", isActive ? "bg-white text-zinc-950" : "bg-zinc-800 text-white")}>
                                    <Icon className="size-4" />
                                </div>
                                <p className={cn("text-xs leading-tight font-semibold", isActive ? "text-white" : "text-muted-foreground")}>{step.text}</p>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="relative space-y-5 rounded-3xl border p-6">
                <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent" />
                <div className="flex items-center gap-3 text-white">
                    <div className="flex size-10 items-center justify-center rounded-full bg-sky-400/15 text-sky-300">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Built for private, low-noise communication</p>
                        <p className="text-muted-foreground text-xs">Email auth, Google OAuth, and protected routes all in one clean flow.</p>
                    </div>
                </div>

                <div className="grid gap-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                            <Check className="size-2.5 text-emerald-500" />
                        </div>
                        <p>Fast sign-in with Google for returning users.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                            <Check className="size-2.5 text-emerald-500" />
                        </div>
                        <p>Email verification for new accounts before access.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                            <Check className="size-2.5 text-emerald-500" />
                        </div>
                        <p>Password reset flow that stays inside the same polished experience.</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
