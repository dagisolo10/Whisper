/* eslint-disable react-hooks/purity */
import { Skeleton as UISkeleton } from "./ui/skeleton";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type ScreenSkeletonTag = "home" | "chat" | "rooms" | "default" | "sign-in" | "sign-up" | "app-shell" | "new-group" | "onboarding" | "verification";

export default function Skeleton({ tag = "default" }: { tag?: ScreenSkeletonTag }) {
    return <ScreenSkeleton tag={tag} />;
}

function RoomsSkeleton() {
    return (
        <div className="h-screen space-y-8 p-4">
            <div className="flex h-10 items-center gap-2">
                <UISkeleton className="bg-primary/20 size-10 rounded-full" />
                <UISkeleton className="bg-primary/20 h-full flex-1 rounded-full" />
            </div>

            <div className="space-y-4">
                <ChatListRow />
                <ChatListRow />
                <ChatListRow />
                <ChatListRow />
                <ChatListRow />
                <ChatListRow />
                <ChatListRow />
            </div>
        </div>
    );
}

function ChatListRow({ short = false }: { short?: boolean }) {
    return (
        <div className="flex items-center gap-4">
            <UISkeleton className="bg-primary/18 size-10 rounded-full" />

            <div className="flex-1 space-y-2">
                <UISkeleton className="bg-card h-5 w-24 rounded-xl" />
                <UISkeleton className={short ? "bg-card h-4 w-8/12 rounded-xl" : "bg-card h-4 w-full rounded-xl"} />
            </div>

            <div className="flex flex-col items-end space-y-2">
                <UISkeleton className="bg-card h-5 w-8 rounded-xl" />
                <UISkeleton className="bg-card size-5 rounded-full" />
            </div>
        </div>
    );
}

function ChatSkeleton() {
    const skeletonData = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            isMine: Math.random() > 0.5,
            isImage: Math.random() > 0.75,
            width: `${Math.floor(Math.random() * (80 - 40 + 1) + 40)}%`,
            height: `${Math.floor(Math.random() * (90 - 30 + 1) + 60)}%`,
        }));
    }, []);

    return (
        <div className="flex h-screen flex-col gap-4 py-4">
            <div className="flex items-center px-6">
                <div className="flex flex-1 items-center gap-2">
                    <UISkeleton className="bg-card size-10 rounded-full" />
                    <div className="space-y-2">
                        <UISkeleton className="bg-card h-3 w-24 rounded-2xl" />
                        <UISkeleton className="bg-card h-3 w-32 rounded-2xl" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <UISkeleton className="bg-card size-8 rounded-full" />
                    <UISkeleton className="bg-card size-8 rounded-full" />
                    <UISkeleton className="bg-card size-8 rounded-full" />
                </div>
            </div>

            <div className="no-scrollbar flex flex-1 flex-col-reverse gap-6 overflow-y-auto px-6">
                {skeletonData.map((item) => (
                    <MessageBubble key={item.id} mine={item.isMine} image={item.isImage} width={item.width} height={item.height} />
                ))}
            </div>

            <div className="flex items-center gap-3 px-6">
                <UISkeleton className="bg-primary/10 size-10 rounded-xl" />
                <UISkeleton className="bg-primary/10 h-10 flex-1 rounded-xl" />
                <UISkeleton className="bg-primary/10 size-10 rounded-xl" />
                <UISkeleton className="bg-primary/10 size-10 rounded-xl" />
            </div>
        </div>
    );
}

function MessageBubble({ mine, image, width, height }: { mine: boolean; image: boolean; width: string; height: string }) {
    const type = image ? "min-h-48 max-h-72" : "h-10";
    const cardStyle = mine ? "bg-primary/15" : "bg-card";
    const corners = mine ? "rounded-t-lg rounded-bl-lg" : "rounded-t-lg rounded-br-lg";

    return (
        <div className={cn(mine ? "self-end" : "self-start", "w-full max-w-[clamp(40em,50%,60%)]")}>
            <div className={cn(mine ? "items-end" : "items-start", "flex flex-col space-y-2")}>
                <UISkeleton className={cn(cardStyle, type, corners)} style={{ width, ...(image ? { height } : {}) }} />

                <div className="flex items-center gap-2">
                    <UISkeleton className={cn(mine ? "bg-primary/18" : "bg-card", "h-3 w-10 rounded-md")} />
                    <UISkeleton className={cn(mine ? "bg-primary/18" : "hidden", "size-4 rounded-md")} />
                </div>
            </div>
        </div>
    );
}

export function ScreenSkeleton({ tag = "app-shell" }: { tag?: ScreenSkeletonTag }) {
    switch (tag) {
        case "home":

        case "rooms":
            return <RoomsSkeleton />;

        case "chat":
            return <ChatSkeleton />;

        case "new-group":
            return <NewGroupSkeleton />;

        case "app-shell":
            return <AppShellSkeleton />;

        case "sign-in":
            return <AuthSkeleton compact />;

        case "sign-up":
            return <AuthSkeleton />;

        case "verification":
            return <VerificationSkeleton />;

        case "onboarding":
            return <OnboardingSkeleton />;

        default:
            return <DefaultSkeleton />;
    }
}

function ContactRow() {
    return (
        <div className="row items-center gap-4">
            <UISkeleton className="bg-accent/18 size-12 rounded-full" />
            <div className="flex-1 gap-2">
                <UISkeleton className="bg-card h-5 w-32 rounded-xl" />
                <UISkeleton className="bg-card h-4 w-24 rounded-xl" />
            </div>
            <UISkeleton className="bg-primary/20 size-6 rounded-md" />
        </div>
    );
}

function AppShellSkeleton() {
    return (
        <div className="justify-center gap-6">
            <div className="gap-4">
                <UISkeleton className="bg-primary/24 h-8 w-28 rounded-full" />
                <UISkeleton className="bg-card h-12 w-56 rounded-2xl" />
                <UISkeleton className="bg-card h-4 w-full rounded-xl" />
                <UISkeleton className="bg-card h-4 w-9/12 rounded-xl" />
            </div>
            <div className="gap-4">
                <UISkeleton className="bg-card h-28 w-full rounded-[28px]" />
                <UISkeleton className="bg-primary/50 h-14 w-full rounded-2xl" />
            </div>
        </div>
    );
}

function AuthSkeleton({ compact = false }: { compact?: boolean }) {
    return (
        <div className="justify-center gap-8">
            <div className="gap-3">
                <UISkeleton className="bg-primary/24 h-8 w-32 rounded-full" />
                <UISkeleton className={`bg-card h-12 ${compact ? "w-48" : "w-56"} rounded-2xl`} />
                <UISkeleton className="bg-card h-4 w-full rounded-xl" />
                <UISkeleton className="bg-card h-4 w-8/12 rounded-xl" />
            </div>

            <div className="gap-4">
                <UISkeleton className="bg-card h-14 w-full rounded-2xl" />
                <UISkeleton className="bg-card h-14 w-full rounded-2xl" />
                {!compact && (
                    <div className="gap-2">
                        <UISkeleton className="bg-card h-3 w-36 rounded-full" />
                        <UISkeleton className="bg-card h-4 w-full rounded-xl" />
                        <UISkeleton className="bg-card h-4 w-10/12 rounded-xl" />
                    </div>
                )}
                <UISkeleton className="bg-primary/55 h-14 w-full rounded-2xl" />
                <UISkeleton className="bg-card h-12 w-full rounded-2xl" />
            </div>
        </div>
    );
}

function VerificationSkeleton() {
    return (
        <div className="justify-center">
            <div className="gap-5">
                <UISkeleton className="bg-primary/24 h-8 w-40 rounded-full" />
                <div className="gap-2">
                    <UISkeleton className="bg-card h-10 w-44 rounded-2xl" />
                    <UISkeleton className="bg-card h-4 w-full rounded-xl" />
                    <UISkeleton className="bg-card h-4 w-10/12 rounded-xl" />
                </div>
                <UISkeleton className="bg-card h-14 w-full rounded-2xl" />
                <UISkeleton className="bg-primary/55 h-14 w-full rounded-2xl" />
                <UISkeleton className="bg-card h-12 w-full rounded-2xl" />
            </div>
        </div>
    );
}

function OnboardingSkeleton() {
    return (
        <div className="justify-center gap-8">
            <div className="gap-4">
                <UISkeleton className="bg-primary/24 h-8 w-36 rounded-full" />
                <UISkeleton className="bg-card h-12 w-52 rounded-2xl" />
                <UISkeleton className="bg-card h-4 w-full rounded-xl" />
                <UISkeleton className="bg-card h-4 w-9/12 rounded-xl" />
            </div>
            <div className="gap-4">
                <UISkeleton className="bg-primary/18 size-20 self-center rounded-full" />
                <UISkeleton className="bg-card h-14 w-full rounded-2xl" />
                <UISkeleton className="bg-card h-14 w-full rounded-2xl" />
                <UISkeleton className="bg-card h-28 w-full rounded-[28px]" />
                <UISkeleton className="bg-primary/55 h-14 w-full rounded-2xl" />
            </div>
        </div>
    );
}

function NewGroupSkeleton() {
    return (
        <div className="gap-6 pt-4">
            <div className="gap-3">
                <UISkeleton className="bg-primary/24 h-8 w-36 rounded-full" />
                <UISkeleton className="bg-card h-4 w-10/12 rounded-xl" />
            </div>

            <div className="gap-4">
                <UISkeleton className="bg-card h-14 w-full rounded-2xl" />
                <div className="row gap-3">
                    <UISkeleton className="bg-primary/18 h-10 w-24 rounded-full" />
                    <UISkeleton className="bg-card h-10 w-24 rounded-full" />
                    <UISkeleton className="bg-card h-10 w-24 rounded-full" />
                </div>
            </div>

            <div className="gap-5">
                <ContactRow />
                <ContactRow />
                <ContactRow />
                <ContactRow />
            </div>

            <UISkeleton className="bg-primary/55 mt-auto h-14 w-full rounded-2xl" />
        </div>
    );
}

function DefaultSkeleton() {
    return (
        <div className="justify-center gap-6">
            <div className="gap-4">
                <UISkeleton className="bg-primary/24 h-8 w-28 rounded-full" />
                <UISkeleton className="bg-card h-12 w-56 rounded-2xl" />
                <UISkeleton className="bg-card h-4 w-10/12 rounded-xl" />
                <UISkeleton className="bg-card h-4 w-full rounded-xl" />
            </div>
            <div className="gap-4">
                <UISkeleton className="bg-card h-6 w-40 rounded-xl" />
                <UISkeleton className="bg-card h-24 w-full rounded-2xl" />
                <UISkeleton className="bg-primary/55 h-14 w-full rounded-2xl" />
            </div>
        </div>
    );
}
