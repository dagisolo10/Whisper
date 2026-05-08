"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignUp as clerkUseSignUp, useSignIn as clerkUseSignIn } from "@clerk/nextjs";

import { getClerkErrorMessage } from "@/lib/clerk-errors";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function useSignInUp() {
    const { signUp } = clerkUseSignUp();
    const { signIn } = clerkUseSignIn();
    const { loaded: isLoaded } = useClerk();

    const router = useRouter();

    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSignUp = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) return;

        const formData = new FormData(event.currentTarget);
        const rawData = Object.fromEntries(formData);
        const result = signUpSchema.safeParse(rawData);

        if (!result.success) {
            const errorMsgs = result.error.errors;
            toast.error("Validation Error", {
                description: errorMsgs.map((err) => err.message).join(". "),
            });
            return;
        }

        const { email, password, firstName, lastName } = result.data;

        try {
            setPending(true);
            setError(null);

            await signUp.password({ firstName, lastName, emailAddress: email, password });

            if (signUp.status === "complete") {
                await signUp.finalize({
                    navigate: async ({ session, decorateUrl }) => {
                        if (session?.currentTask) return;
                        const url = decorateUrl("/");
                        if (url.startsWith("http")) {
                            window.location.href = url;
                        } else {
                            router.push(url);
                        }
                    },
                });
                return;
            }

            if (signUp.status === "missing_requirements") {
                await signUp.verifications.sendEmailCode();
                router.push("/verification?mode=sign-up");
                return;
            }

            setError(`Sign-up isn't complete yet (status: ${signUp.status ?? "unknown"}). Please try again.`);
        } catch (err) {
            setError(getClerkErrorMessage(err, "Unable to create your account."));
        } finally {
            setPending(false);
        }
    };

    const handleSignIn = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) return;

        const formData = new FormData(event.currentTarget);
        const rawData = Object.fromEntries(formData);
        const result = signInSchema.safeParse(rawData);

        if (!result.success) {
            const errorMsgs = result.error.errors;
            toast.error("Validation Error", {
                description: errorMsgs.map((err) => err.message).join(". "),
            });
            return;
        }

        const { email, password } = result.data;

        try {
            setPending(true);
            setError(null);

            await signIn.password({ emailAddress: email, password });

            if (signIn.status === "complete") {
                await signIn.finalize({
                    navigate: async ({ session, decorateUrl }) => {
                        if (session?.currentTask) return;
                        const url = decorateUrl("/");
                        if (url.startsWith("http")) {
                            window.location.href = url;
                        } else {
                            router.push(url);
                        }
                    },
                });
                return;
            }

            if (signIn.status === "needs_second_factor") {
                await signIn.mfa.sendEmailCode();
                router.push("/verification?mode=sign-in");
                return;
            }

            setError(`This sign-in attempt is not finished yet (status: ${signIn.status ?? "unknown"}). Please try again or use Google sign-in.`);
        } catch (err) {
            setError(getClerkErrorMessage(err, "Unable to sign in with email and password."));
        } finally {
            setPending(false);
        }
    };

    return {
        error,
        pending,
        isLoaded,
        handleSignIn,
        handleSignUp,
        passwordVisible,
        setPasswordVisible,
    };
}
