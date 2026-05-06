import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto flex w-full items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="text-ss font-bold tracking-widest text-zinc-500 uppercase">© 2026 Whisper</p>
            <Link className="text-ss font-semibold tracking-widest text-zinc-500 uppercase transition-colors hover:text-white" href="/support">
                Support
            </Link>
        </footer>
    );
}
