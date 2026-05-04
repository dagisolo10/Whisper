import { Text } from "./display";

import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import useTheme from "@/store/theme-store";
import { Link, LinkProps } from "expo-router";
import { cva, VariantProps } from "class-variance-authority";
import { GestureResponderEvent, Pressable, TextInput, TextInputProps, Switch, SwitchProps, PressableProps } from "react-native";

export interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
    className?: string;
    textClassName?: string;
}

export const buttonVariants = cva("flex-row items-center justify-center rounded-2xl disabled:pointer-events-none disabled:opacity-60", {
    variants: {
        variant: {
            primary: "border border-primary/40 bg-primary/90 shadow-sm",
            success: "border border-success/30 bg-success",
            secondary: "border border-accent/40 bg-accent/90",
            destructive: "border border-destructive/30 bg-destructive",
            outline: "border border-border bg-transparent",
            ghost: "bg-transparent",
            link: "bg-transparent px-0 h-auto",
        },

        size: {
            default: "h-14 px-6",
            lg: "h-16 px-6",
            sm: "h-9 px-3 rounded-xl",
            icon: "size-12 px-0",
            content: "h-auto px-0",
        },
    },

    defaultVariants: {
        variant: "primary",
        size: "default",
    },
});

export const textVariants = {
    primary: "text-primary-foreground",
    success: "text-success-foreground",
    secondary: "text-primary-foreground",
    destructive: "text-destructive-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    link: "text-accent ",
};

export const Button = ({
    variant = "primary",
    size = "default",
    children,
    className,
    textClassName,
    onPress,
    component = false,
    ...props
}: ButtonProps & { component?: boolean }) => {
    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const renderContent = component ? (
        children
    ) : (
        <Text className={cn("font-semibold", variant && textVariants[variant], textClassName)}>{children}</Text>
    );

    return (
        <Pressable onPress={handlePress} className={cn(buttonVariants({ variant, size }), className)} {...props}>
            {renderContent}
        </Pressable>
    );
};

export const navLinkTextVariants = {
    primary: "text-primary-foreground",
    success: "text-success-foreground",
    secondary: "text-primary-foreground",
    destructive: "text-destructive-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    link: "text-accent",
};

export const NavLink = ({
    href,
    variant = "link",
    size = "default",
    children,
    className,
    textClassName,
    onPress,
    component = false,
    ...props
}: ButtonProps & { href: LinkProps["href"]; component?: boolean }) => {
    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };
    const renderContent = component ? (
        children
    ) : (
        <Text className={cn("font-sans-medium", variant && navLinkTextVariants[variant], textClassName)}>{children}</Text>
    );

    return (
        <Link href={href} asChild>
            <Button onPress={handlePress} variant={variant} size={size} className={className} {...props}>
                {renderContent}
            </Button>
        </Link>
    );
};

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => {
    const { isDark } = useTheme();
    const placeholderColor = isDark ? "#73738c" : "#334155";

    return (
        <TextInput
            placeholderTextColor={placeholderColor}
            className={cn("border-border bg-muted text-foreground caret-muted-foreground h-14 w-full rounded-2xl pr-4 pl-4", className)}
            {...props}
        />
    );
};

export const Toggle = ({
    value,
    onToggle,
    ...props
}: Omit<SwitchProps, "value" | "onValueChange"> & { value?: boolean; onToggle?: (val: boolean) => void }) => (
    <Switch
        value={value}
        onValueChange={(val) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle?.(val);
        }}
        trackColor={{ false: "#E2E8F0", true: "#ea7a53" }}
        thumbColor={"#FFFFFF"}
        ios_backgroundColor="#E2E8F0"
        {...props}
    />
);
