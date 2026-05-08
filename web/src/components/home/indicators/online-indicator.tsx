export default function OnlineIndicator({ isOnline }: { isOnline: boolean }) {
    if (!isOnline) return null;

    return (
        <div className="absolute right-0 bottom-0 z-10">
            <div className="relative flex items-center justify-center">
                <div className="size-1.5 rounded-full bg-emerald-500" />
            </div>
        </div>
    );
}
