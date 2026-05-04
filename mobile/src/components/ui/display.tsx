import * as React from "react";
import { cn } from "@/lib/utils";
import { styled } from "nativewind";
import { cva, VariantProps } from "class-variance-authority";
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform, Text as RNText, View as RNView, ScrollView, TextProps, ViewProps } from "react-native";

interface ThemedViewProps extends ViewProps {
    className?: string;
}

interface TypographyProps extends TextProps {
    className?: string;
}

interface ScreenProps extends ThemedViewProps {
    nonScrollable?: boolean;
    noSafeArea?: boolean;
    onTab?: boolean;
    disableKeyboardAvoiding?: boolean;
    keyboardVerticalOffset?: number;
}

const SafeAreaView = styled(RNSafeAreaView);

export const Screen = ({ className, children, nonScrollable = false, onTab = false, noSafeArea = false, disableKeyboardAvoiding = false, keyboardVerticalOffset = 0, ...props }: ScreenProps) => {
    const insets = useSafeAreaInsets();
    const behavior = Platform.OS === "ios" ? "padding" : "height";
    const baseStyle = cn("bg-background flex-1 px-6 py-8", className);

    const Container = noSafeArea ? RNView : SafeAreaView;
    const topInset = onTab && noSafeArea ? { height: insets.top } : {};

    const content = (
        <>
            {onTab && <RNView style={topInset} className="bg-dead-zone" />}
            <RNView className={baseStyle} {...props}>
                {children}
            </RNView>
        </>
    );

    if (nonScrollable) {
        return (
            <Container className="bg-background flex-1">
                {disableKeyboardAvoiding ? content : <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }} keyboardVerticalOffset={keyboardVerticalOffset}>{content}</KeyboardAvoidingView>}
            </Container>
        );
    }

    return (
        <Container className="bg-background flex-1">
            {disableKeyboardAvoiding ? (
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                    {content}
                </ScrollView>
            ) : (
                <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }} keyboardVerticalOffset={keyboardVerticalOffset}>
                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                        {content}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </Container>
    );
};

export const Separator = ({ vertical = false, size = 16 }: { vertical?: boolean; size?: number }) => <View style={{ height: vertical ? size : 0, width: vertical ? 0 : size }} />;
export const View = ({ className, ...props }: ThemedViewProps) => <RNView className={cn("border-border", className)} {...props} />;

const cardVariants = cva("", {
    variants: {
        variant: {
            default: "rounded-3xl border border-border bg-card p-5",
            primary: "rounded-3xl border border-primary/30 bg-primary/20 p-5",
            accent: "rounded-3xl border border-accent/30 bg-accent/12 p-6",
            muted: "rounded-3xl border border-border bg-muted/90 p-6",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface CardProps extends ThemedViewProps, VariantProps<typeof cardVariants> {}

export const Card = ({ variant = "default", className, ...props }: CardProps) => <View className={cn(cardVariants({ variant, className }))} {...props} />;

export const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
    <View className={cn(className)}>
        <RNText className="text-muted-foreground mb-2 text-sm font-bold tracking-[2px] uppercase">{label}</RNText>
        {children}
    </View>
);

export const Text = ({ className, ...props }: TypographyProps) => <RNText className={cn("text-foreground text-base font-semibold", className)} {...props} />;

const badgeVariants = cva("flex-row items-center justify-center rounded-full px-2.5 py-0.5 border", {
    variants: {
        variant: {
            primary: "bg-primary border-transparent",
            success: "bg-success/10 border-transparent",
            secondary: "bg-accent border-transparent",
            destructive: "bg-destructive border-transparent",
            outline: "border-border bg-transparent",
            muted: "bg-muted border-transparent",
            glass: "bg-white/20 border-white/10",
        },
    },
    defaultVariants: {
        variant: "primary",
    },
});

const badgeTextVariants = {
    primary: "text-white",
    success: "text-success",
    secondary: "text-white",
    destructive: "text-white",
    outline: "text-foreground",
    muted: "text-gray",
    glass: "text-white",
};

interface BadgeProps extends ThemedViewProps, VariantProps<typeof badgeVariants> {
    textClassName?: string;
}

export const Badge = ({ variant = "primary", children, className, textClassName, ...props }: BadgeProps) => {
    return (
        <View className={cn(badgeVariants({ variant, className }))} {...props}>
            <Text className={cn("text-sm font-bold tracking-wider uppercase", badgeTextVariants[variant || "primary"], textClassName)}>{children}</Text>
        </View>
    );
};
