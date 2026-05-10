"use client";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton, useUser as useClerkUser } from "@clerk/nextjs";
import { Bell, MessageCircle } from "lucide-react";
import Link from "next/link";
import useUtil from "@/store/util-store";
import { DevUserSwitch } from "../dev-switch";

const sidebarLinks = [
    { label: "Chats", icon: MessageCircle, href: "/" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const sidebar = useUtil((s) => s.sidebar);
    const { user: clerkUser } = useClerkUser();
    const setSidebar = useUtil((s) => s.setSidebar);
    const toggleSidebar = useUtil((s) => s.toggleSidebar);

    return (
        <div
            onClick={toggleSidebar}
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
                <DevUserSwitch />

                <nav className="space-y-2">
                    {sidebarLinks.map(({ label, icon: Icon, href }) => (
                        <Button
                            asChild
                            key={label}
                            variant={pathname === href ? "outline" : "ghost"}
                            className={cn(pathname === href ? "" : "text-muted-foreground", "h-10 w-full justify-start gap-3 rounded-xl px-4 text-sm")}
                        >
                            <Link href={href}>
                                <Icon className="size-5" />
                                <span>{label}</span>
                            </Link>
                        </Button>
                    ))}
                </nav>

                <div className="mt-auto flex items-center gap-4 px-2">
                    <UserButton />
                    <div>
                        <p className="text-sm font-semibold">{clerkUser?.fullName || "Whisper"}</p>
                        <p className="text-muted-foreground text-[11px]">{clerkUser?.primaryEmailAddress?.emailAddress || "Signed in"}</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
