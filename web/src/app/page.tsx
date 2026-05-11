"use client";
import GlitchText from "@/components/ui/glitch-text";
import Orb from "@/components/ui/orb";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function WelcomePage() {
    return (
        <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
            <Orb />

            <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black,transparent)] bg-size-[32px_32px]" />

            <nav className="absolute top-0 flex h-20 w-full items-center justify-end px-10">
                <Show when="signed-in">
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "size-8 rounded-none border border-white/20" } }} />
                </Show>
            </nav>

            <div>
                <GlitchText speed={0.4} enableShadows={true}>
                    WHISPER
                </GlitchText>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-3 text-white/30">
                        <div className="h-px w-8 bg-white/10" />
                        <span className="text-[9px] tracking-[0.3em] uppercase">Secure Messaging Platform</span>
                        <div className="h-px w-8 bg-white/10" />
                    </div>

                    <div className="flex items-center gap-8">
                        <Show when="signed-out">
                            <SignInButton forceRedirectUrl={"/chats"} mode="modal">
                                {/* <button className="cursor-pointer border border-white/10 px-5 py-2 text-[10px] tracking-widest uppercase opacity-50 transition-all hover:tracking-[0.2em] hover:opacity-100"> */}
                                <button className="cursor-pointer border border-white/10 px-5 py-2 text-[10px] tracking-widest uppercase opacity-50 transition-all hover:tracking-[0.2em] hover:opacity-99">
                                    Login
                                </button>
                            </SignInButton>

                            <SignUpButton mode="modal">
                                <button className="group relative cursor-pointer overflow-hidden border border-white/10 bg-white/5 bg-clip-text px-5 py-2 text-[10px] tracking-widest text-transparent uppercase backdrop-blur-sm transition-all">
                                    <div className="absolute top-1/2 -left-full -z-10 h-full w-full -translate-y-1/2 bg-white transition-all duration-500 group-hover:left-0" />
                                    <p className="bg-transparent from-purple-500 via-black to-violet-500 bg-clip-text text-white transition-all duration-500 group-hover:left-0 group-hover:bg-linear-to-r group-hover:text-transparent">
                                        Register
                                    </p>
                                </button>
                            </SignUpButton>
                        </Show>

                        <Show when={"signed-in"}>
                            <Link href={"/chats"}>
                                <button className="border border-white/10 bg-white/5 px-5 py-2 text-[10px] tracking-widest uppercase backdrop-blur-sm transition-all hover:bg-white hover:text-black">
                                    Go Back
                                </button>
                            </Link>
                        </Show>
                    </div>
                </div>
            </div>

            <p className="absolute bottom-6 text-[8px] tracking-[0.5em] text-white/20 uppercase">Authorization Required // Access Restricted</p>
        </main>
    );
}
