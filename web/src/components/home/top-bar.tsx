import { AppWindow, Bell, ChevronDown, type LucideIcon, MoreHorizontal, Search, Store, Wallet } from "lucide-react";

export default function TopBar() {
    return (
        <header className="border-border flex flex-col gap-4 border-b px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            {/* <header className="bg-card flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between"> */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                <TopNavItem icon={Wallet} label="Wallet" />
                <TopNavItem icon={Store} label="Marketplace" />
                <TopNavItem icon={AppWindow} label="Apps" />
                <TopNavItem icon={MoreHorizontal} label="More" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="border-input text-muted-foreground flex h-11 min-w-60 flex-1 items-center gap-3 rounded-full border px-4 sm:min-w-[320px] lg:flex-none">
                    <Search className="size-4" />
                    <span className="text-sm">Search people, posts</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-primary-foreground bg-primary rounded-full px-4 py-2 text-sm font-semibold shadow-sm">234.7k AC</div>
                    <button
                        aria-label="Notifications"
                        className="text-muted-foreground border-border flex size-10 items-center justify-center rounded-full border"
                    >
                        <Bell className="size-4" />
                    </button>
                    <div className="from-primary to-chart-3 text-primary-foreground border-border flex size-10 items-center justify-center rounded-full border bg-linear-to-br font-semibold">
                        JD
                    </div>
                </div>
            </div>
        </header>
    );
}

function TopNavItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <button className="hover:bg-accent hover:text-accent-foreground flex h-10 items-center gap-2 rounded-full px-3 transition">
            <Icon className="size-4" />
            <span>{label}</span>
            <ChevronDown className="text-muted-foreground size-3.5" />
        </button>
    );
}
