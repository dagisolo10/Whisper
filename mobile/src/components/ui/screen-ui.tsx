import { Link, LinkProps } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Text, Screen } from "@/components/ui/display";
import { Button, NavLink } from "@/components/ui/interactive";

export function ErrorScreen({
    message = "Something went wrong",
    href = "/",
    button = "Go Home",
}: {
    message?: string;
    href?: LinkProps["href"];
    button?: string;
}) {
    return (
        <Screen className="items-center justify-center gap-4 px-6">
            <Text className="text-center text-3xl">{message}</Text>
            {href && (
                <Link href={href} asChild>
                    <Button className="h-14 rounded-2xl">{button}</Button>
                </Link>
            )}
        </Screen>
    );
}

export function LoadingScreen() {
    return (
        <Screen className="items-center justify-center gap-4">
            <Text className="text-3xl">Loading...</Text>
            <ActivityIndicator size="large" />
        </Screen>
    );
}

export function ErrorMessage({ message }: { message?: string | null }) {
    if (!message) return null;
    return <Text className="text-destructive mt-2 text-sm font-bold">{message}</Text>;
}

export function MisMatch({ error, loading, onPress }: { error: string | null; loading: boolean; onPress: () => void }) {
    return (
        <Screen onTab noSafeArea className="items-center justify-center gap-4 px-6">
            <Text className="h2 text-center">We could not finish loading your profile.</Text>
            <Text className="text-muted-foreground text-center">
                Retry syncing your account, or continue to onboarding if your profile has not been created yet.
            </Text>
            <ErrorMessage message={error || "Your Clerk session is active, but your app profile is missing."} />

            <View className="w-full gap-3">
                <Button onPress={onPress} disabled={loading}>
                    Retry sync
                </Button>
                <NavLink href="/(onboarding)/onboarding" variant="outline">
                    Complete profile
                </NavLink>
            </View>
        </Screen>
    );
}
