"use client";

import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs";

import { getClerkErrorMessage } from "@/lib/clerk-errors";

export default function useContinue() {
    const { isSignedIn } = useAuth();
    const { signUp } = useSignUp();
    const { loaded: isLoaded, handleRedirectCallback } = useClerk();

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackStarted = useRef(false);

    const [lastName, setLastName] = useState("");
    const [pending, setPending] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [callbackPending, setCallbackPending] = useState(false);

    const isOAuthCallback = useMemo(() => searchParams.has("code") || searchParams.has("state"), [searchParams]);
    const needsNames =
        isLoaded && signUp?.status === "missing_requirements" && (signUp.missingFields.includes("first_name") || signUp.missingFields.includes("last_name"));

    useEffect(() => {
        if (isSignedIn) {
            router.replace("/");
        }
    }, [isSignedIn, router]);

    useEffect(() => {
        if (!isOAuthCallback || callbackStarted.current) {
            return;
        }

        callbackStarted.current = true;

        let active = true;

        const completeCallback = async () => {
            try {
                setCallbackPending(true);
                setError(null);

                await handleRedirectCallback(
                    {
                        signInUrl: "/sign-in",
                        signUpUrl: "/sign-up",
                        signInFallbackRedirectUrl: "/",
                        signInForceRedirectUrl: "/",
                        signUpFallbackRedirectUrl: "/sign-in/continue",
                        signUpForceRedirectUrl: "/sign-in/continue",
                    },
                    async (to) => {
                        if (active) {
                            router.replace(to);
                        }
                    },
                );
            } catch (err) {
                if (active) {
                    setError(getClerkErrorMessage(err, "We couldn't finish the Google authentication flow."));
                }
            } finally {
                if (active) {
                    setCallbackPending(false);
                }
            }
        };

        void completeCallback();

        return () => {
            active = false;
        };
    }, [handleRedirectCallback, isOAuthCallback, router]);

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) return;

        setPending(true);
        setError(null);

        try {
            await signUp.update({ firstName: firstName.trim(), lastName: lastName.trim() });

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

            setError("Your Google account is connected, but we still need a little more information to finish setup.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't finish your profile setup."));
        } finally {
            setPending(false);
        }
    };

    return {
        error,
        pending,
        isLoaded,
        lastName,
        firstName,
        needsNames,
        setLastName,
        setFirstName,
        handleSubmit,
        callbackPending,
    };
}
