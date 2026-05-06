import Link from "next/link";

export default function FooterRedirect({ text, link, href }: { text: string; link: string; href: string }) {
    return (
        <div className="mt-8 flex items-center justify-center gap-2 text-center text-sm">
            <p className="text-zinc-400">{text}</p>
            <Link href={href} className="font-semibold text-sky-300 transition-colors hover:text-sky-200">
                {link}
            </Link>
        </div>
    );
}
