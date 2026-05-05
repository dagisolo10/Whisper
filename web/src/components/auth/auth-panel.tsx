import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Footer from "@/components/footer";

type AuthPanelProps = {
    title: string;
    description: string;
    children: ReactNode;
    redirect?: ReactNode;
    className?: string;
};

export default function AuthPanel({ title, description, children, redirect, className }: AuthPanelProps) {
    return (
        <section className={cn("relative flex w-full flex-col overflow-hidden rounded-4xl border border-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:min-h-180", className)}>
            <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent" />
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-8">
                <div className="mb-8 space-y-2 text-center">
                    <p className="text-ss font-semibold tracking-[0.35em] text-sky-200 uppercase">Whisper Auth</p>
                    <h1 className="font-jakarta text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                    <p className="text-sm leading-6 text-zinc-400">{description}</p>
                </div>

                {children}

                {redirect}
            </div>

            <Footer />
        </section>
    );
}
