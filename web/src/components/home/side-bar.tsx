"use client";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Compass, Image as ImageIcon, MessageCircle, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";

const sidebarLinks = [
    { label: "Chats", icon: MessageCircle, href: "/" },
    { label: "Discover", icon: Compass, href: "/discover" },
    { label: "Shorts", icon: PlayCircle, href: "/shorts" },
    { label: "Moments", icon: ImageIcon, href: "/moments" },
    { label: "Whisper AI", icon: Sparkles, href: "/whisper-ai" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
];

interface SidebarProp {
    sidebar: boolean;
    setSidebar: (value: boolean) => void;
}

export default function Sidebar({ sidebar, setSidebar }: SidebarProp) {
    const { user } = useUser();
    const pathname = usePathname();

    return (
        <div
            onClick={() => setSidebar(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebar(false)}
            role="presentation"
            className={cn(
                "fixed inset-0 z-50 hidden transition-colors duration-300 lg:block",
                sidebar ? "pointer-events-auto bg-black/50" : "pointer-events-none bg-transparent",
            )}
        >
            <aside
                role="dialog"
                inert={!sidebar}
                aria-modal="true"
                aria-label="Navigation"
                onClick={(event) => event.stopPropagation()}
                className={cn(
                    sidebar ? "translate-x-0" : "-translate-x-full",
                    "bg-background absolute top-0 left-0 flex h-full w-1/4 flex-col gap-4 border-r px-4 py-6 transition-transform duration-500",
                )}
            >
                <div className="flex items-center gap-4 px-2">
                    <UserButton />

                    <div>
                        <p className="text-sm font-semibold">{user?.fullName || "Whisper"}</p>
                        <p className="text-muted-foreground text-[11px]">{user?.primaryEmailAddress?.emailAddress || "Signed in"}</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {sidebarLinks.map(({ label, icon: Icon, href }) => (
                        <Button
                            asChild
                            key={label}
                            variant={pathname === href ? "outline" : "ghost"}
                            className={cn(
                                pathname === href ? "" : "text-muted-foreground",
                                "h-10 w-full justify-start gap-3 rounded-xl px-4 text-sm",
                            )}
                        >
                            <Link href={href}>
                                <Icon className="size-5" />
                                <span>{label}</span>
                            </Link>
                        </Button>
                    ))}
                </nav>
            </aside>
        </div>
    );
}
