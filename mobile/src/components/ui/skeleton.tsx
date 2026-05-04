import { Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Card, Screen, View } from "@/components/ui/display";

export type ScreenSkeletonTag = "app-shell" | "sign-in" | "sign-up" | "verification" | "home" | "rooms" | "chat" | "conversation" | "onboarding" | "new-group" | "default";

export default function Skeleton({ tag = "default" }: { tag?: ScreenSkeletonTag }) {
    return <ScreenSkeleton tag={tag} />;
}

function SkeletonBlock({ className }: { className?: string }) {
    const opacity = useRef(new Animated.Value(0.42)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([Animated.timing(opacity, { toValue: 0.92, duration: 900, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.42, duration: 900, useNativeDriver: true })]),
        );

        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return <Animated.View style={{ opacity }} className={className ?? "bg-card h-4 rounded-xl"} />;
}

function SkeletonDecor() {
    return (
        <>
            <View className="bg-primary/14 absolute -top-12 right-0 size-40 rounded-full" />
            <View className="bg-accent/10 absolute top-72 -left-10 size-36 rounded-full" />
        </>
    );
}

function SectionLabel({ className }: { className?: string }) {
    return <SkeletonBlock className={className ?? "bg-card h-3 w-24 rounded-full"} />;
}

function ChatListRow({ short = false }: { short?: boolean }) {
    return (
        <View className="row items-center gap-4">
            <SkeletonBlock className="bg-primary/18 size-14 rounded-full" />
            <View className="flex-1 gap-2">
                <View className="row items-center justify-between gap-3">
                    <SkeletonBlock className="bg-card h-5 w-32 rounded-xl" />
                    <SkeletonBlock className="bg-card h-3 w-12 rounded-full" />
                </View>
                <SkeletonBlock className={short ? "bg-card h-4 w-8/12 rounded-xl" : "bg-card h-4 w-full rounded-xl"} />
            </View>
        </View>
    );
}

function ContactRow() {
    return (
        <View className="row items-center gap-4">
            <SkeletonBlock className="bg-accent/18 size-12 rounded-full" />
            <View className="flex-1 gap-2">
                <SkeletonBlock className="bg-card h-5 w-32 rounded-xl" />
                <SkeletonBlock className="bg-card h-4 w-24 rounded-xl" />
            </View>
            <SkeletonBlock className="bg-primary/20 size-6 rounded-md" />
        </View>
    );
}

function MessageBubble({ mine = false, image = false, widthClass = "w-52" }: { mine?: boolean; image?: boolean; widthClass?: string }) {
    return (
        <View className={mine ? "items-end" : "items-start"}>
            <View className={mine ? "items-end gap-2" : "items-start gap-2"}>
                <SkeletonBlock className={`h-3 w-16 rounded-full ${mine ? "bg-primary/18" : "bg-card"}`} />
                <SkeletonBlock className={`${mine ? "bg-primary/22" : "bg-card"} ${image ? "h-40 w-44 rounded-3xl" : `h-16 ${widthClass} rounded-3xl`}`} />
            </View>
        </View>
    );
}

export function ScreenSkeleton({ tag = "app-shell" }: { tag?: ScreenSkeletonTag }) {
    switch (tag) {
        case "home":
        case "rooms":
            return <RoomsSkeleton />;
        case "chat":
        case "conversation":
            return <ConversationSkeleton />;
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

function AppShellSkeleton() {
    return (
        <Screen noSafeArea className="justify-center gap-6">
            <SkeletonDecor />
            <View className="gap-4">
                <SkeletonBlock className="bg-primary/24 h-8 w-28 rounded-full" />
                <SkeletonBlock className="bg-card h-12 w-56 rounded-2xl" />
                <SkeletonBlock className="bg-card h-4 w-full rounded-xl" />
                <SkeletonBlock className="bg-card h-4 w-9/12 rounded-xl" />
            </View>
            <Card variant="accent" className="gap-4">
                <SectionLabel className="bg-card h-4 w-24 rounded-full" />
                <SkeletonBlock className="bg-card h-28 w-full rounded-[28px]" />
                <SkeletonBlock className="bg-primary/50 h-14 w-full rounded-2xl" />
            </Card>
        </Screen>
    );
}

function AuthSkeleton({ compact = false }: { compact?: boolean }) {
    return (
        <Screen noSafeArea className="justify-center gap-8">
            <SkeletonDecor />
            <View className="gap-3">
                <SkeletonBlock className="bg-primary/24 h-8 w-32 rounded-full" />
                <SkeletonBlock className={`bg-card h-12 ${compact ? "w-48" : "w-56"} rounded-2xl`} />
                <SkeletonBlock className="bg-card h-4 w-full rounded-xl" />
                <SkeletonBlock className="bg-card h-4 w-8/12 rounded-xl" />
            </View>

            <Card className="gap-4">
                <SkeletonBlock className="bg-card h-14 w-full rounded-2xl" />
                <SkeletonBlock className="bg-card h-14 w-full rounded-2xl" />
                {!compact && (
                    <View className="gap-2">
                        <SkeletonBlock className="bg-card h-3 w-36 rounded-full" />
                        <SkeletonBlock className="bg-card h-4 w-full rounded-xl" />
                        <SkeletonBlock className="bg-card h-4 w-10/12 rounded-xl" />
                    </View>
                )}
                <SkeletonBlock className="bg-primary/55 h-14 w-full rounded-2xl" />
                <SkeletonBlock className="bg-card h-12 w-full rounded-2xl" />
            </Card>
        </Screen>
    );
}

function VerificationSkeleton() {
    return (
        <Screen noSafeArea className="justify-center">
            <SkeletonDecor />
            <Card className="gap-5">
                <SkeletonBlock className="bg-primary/24 h-8 w-40 rounded-full" />
                <View className="gap-2">
                    <SkeletonBlock className="bg-card h-10 w-44 rounded-2xl" />
                    <SkeletonBlock className="bg-card h-4 w-full rounded-xl" />
                    <SkeletonBlock className="bg-card h-4 w-10/12 rounded-xl" />
                </View>
                <SkeletonBlock className="bg-card h-14 w-full rounded-2xl" />
                <SkeletonBlock className="bg-primary/55 h-14 w-full rounded-2xl" />
                <SkeletonBlock className="bg-card h-12 w-full rounded-2xl" />
            </Card>
        </Screen>
    );
}

function OnboardingSkeleton() {
    return (
        <Screen noSafeArea className="justify-center gap-8">
            <SkeletonDecor />
            <View className="gap-4">
                <SkeletonBlock className="bg-primary/24 h-8 w-36 rounded-full" />
                <SkeletonBlock className="bg-card h-12 w-52 rounded-2xl" />
                <SkeletonBlock className="bg-card h-4 w-full rounded-xl" />
                <SkeletonBlock className="bg-card h-4 w-9/12 rounded-xl" />
            </View>
            <Card className="gap-4">
                <SkeletonBlock className="bg-primary/18 size-20 self-center rounded-full" />
                <SkeletonBlock className="bg-card h-14 w-full rounded-2xl" />
                <SkeletonBlock className="bg-card h-14 w-full rounded-2xl" />
                <SkeletonBlock className="bg-card h-28 w-full rounded-[28px]" />
                <SkeletonBlock className="bg-primary/55 h-14 w-full rounded-2xl" />
            </Card>
        </Screen>
    );
}

function RoomsSkeleton() {
    return (
        <Screen nonScrollable noSafeArea className="pb-0">
            <SkeletonDecor />
            <View className="bg-background/98 gap-4 px-4 pb-4">
                <View className="row items-center gap-3">
                    <SkeletonBlock className="bg-primary/20 size-11 rounded-2xl" />
                    <SkeletonBlock className="bg-card h-11 flex-1 rounded-full" />
                </View>
                <View className="row gap-4 px-12">
                    <SkeletonBlock className="bg-primary/50 h-10 flex-1 rounded-full" />
                    <SkeletonBlock className="bg-card h-10 flex-1 rounded-full" />
                    <SkeletonBlock className="bg-card h-10 flex-1 rounded-full" />
                </View>
            </View>

            <View className="flex-1 gap-6 px-4 pt-8">
                <Card variant="muted" className="gap-5">
                    <SectionLabel className="bg-card h-4 w-28 rounded-full" />
                    <ChatListRow />
                    <ChatListRow short />
                    <ChatListRow />
                    <ChatListRow short />
                </Card>
            </View>
        </Screen>
    );
}

function ConversationSkeleton() {
    return (
        <Screen nonScrollable noSafeArea className="p-0 pb-4">
            <SkeletonDecor />
            <View className="gap-3 px-4 pt-4">
                <SkeletonBlock className="bg-card h-11 w-full rounded-full" />
            </View>

            <View className="flex-1 px-4 pt-4">
                <Card variant="muted" className="flex-1 gap-4 p-4">
                    <View className="row items-center gap-3">
                        <SkeletonBlock className="bg-primary/18 size-12 rounded-full" />
                        <View className="flex-1 gap-2">
                            <SkeletonBlock className="bg-card h-5 w-32 rounded-xl" />
                            <SkeletonBlock className="bg-card h-4 w-24 rounded-xl" />
                        </View>
                    </View>

                    <View className="flex-1 justify-center gap-4">
                        <MessageBubble widthClass="w-48" />
                        <MessageBubble mine widthClass="w-56" />
                        <MessageBubble widthClass="w-40" />
                        <MessageBubble mine image />
                        <MessageBubble mine widthClass="w-44" />
                    </View>
                </Card>
            </View>

            <View className="px-4 pt-4">
                <View className="row items-end gap-3">
                    <SkeletonBlock className="bg-card h-14 flex-1 rounded-[28px]" />
                    <SkeletonBlock className="bg-primary/55 h-12 w-12 rounded-2xl" />
                </View>
            </View>
        </Screen>
    );
}

function NewGroupSkeleton() {
    return (
        <Screen noSafeArea className="gap-6 pt-4">
            <SkeletonDecor />
            <View className="gap-3">
                <SkeletonBlock className="bg-primary/24 h-8 w-36 rounded-full" />
                <SkeletonBlock className="bg-card h-4 w-10/12 rounded-xl" />
            </View>

            <Card className="gap-4">
                <SectionLabel className="bg-card h-3 w-20 rounded-full" />
                <SkeletonBlock className="bg-card h-14 w-full rounded-2xl" />
                <View className="row gap-3">
                    <SkeletonBlock className="bg-primary/18 h-10 w-24 rounded-full" />
                    <SkeletonBlock className="bg-card h-10 w-24 rounded-full" />
                    <SkeletonBlock className="bg-card h-10 w-24 rounded-full" />
                </View>
            </Card>

            <Card variant="muted" className="gap-5">
                <SectionLabel className="bg-card h-3 w-32 rounded-full" />
                <ContactRow />
                <ContactRow />
                <ContactRow />
                <ContactRow />
            </Card>

            <SkeletonBlock className="bg-primary/55 mt-auto h-14 w-full rounded-2xl" />
        </Screen>
    );
}

function DefaultSkeleton() {
    return (
        <Screen className="justify-center gap-6">
            <SkeletonDecor />
            <Card className="gap-4">
                <SkeletonBlock className="bg-primary/24 h-8 w-28 rounded-full" />
                <SkeletonBlock className="bg-card h-12 w-56 rounded-2xl" />
                <SkeletonBlock className="bg-card h-4 w-10/12 rounded-xl" />
                <SkeletonBlock className="bg-card h-4 w-full rounded-xl" />
            </Card>
            <Card className="gap-4">
                <SkeletonBlock className="bg-card h-6 w-40 rounded-xl" />
                <SkeletonBlock className="bg-card h-24 w-full rounded-2xl" />
                <SkeletonBlock className="bg-primary/55 h-14 w-full rounded-2xl" />
            </Card>
        </Screen>
    );
}
