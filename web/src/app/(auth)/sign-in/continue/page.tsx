"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs/legacy";

import AuthPanel from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClerkErrorMessage } from "@/lib/clerk-errors";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const clerk = useClerk();
    const { isSignedIn } = useAuth();
    const { isLoaded, signUp, setActive } = useSignUp();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pending, setPending] = useState(false);
    const [callbackPending, setCallbackPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isOAuthCallback = useMemo(() => searchParams.has("code") || searchParams.has("state"), [searchParams]);
    const needsNames = isLoaded && signUp?.status === "missing_requirements" && signUp.missingFields.includes("first_name") && signUp.missingFields.includes("last_name");

    useEffect(() => {
        if (isSignedIn) {
            router.replace("/");
        }
    }, [isSignedIn, router]);

    useEffect(() => {
        if (!isOAuthCallback || callbackPending) {
            return;
        }

        let active = true;

        const completeCallback = async () => {
            try {
                setCallbackPending(true);
                setError(null);

                await clerk.handleRedirectCallback(
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
    }, [callbackPending, clerk, isOAuthCallback, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) {
            return;
        }

        try {
            setPending(true);
            setError(null);

            const result = await signUp.update({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            if (result.status === "complete" && result.createdSessionId) {
                await setActive({
                    session: result.createdSessionId,
                    navigate: async () => {
                        router.replace("/");
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

    if (callbackPending) {
        return (
            <AuthPanel title="Finishing Google sign-in" description="We’re securely completing the OAuth callback and checking whether your account needs anything else.">
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <Loader2 className="size-8 animate-spin text-sky-300" />
                    <p className="text-sm text-zinc-400">Finalizing your session...</p>
                </div>
            </AuthPanel>
        );
    }

    if (needsNames) {
        return (
            <AuthPanel title="Complete your profile" description="Your Google account is connected. Add the missing profile details below and we’ll finish account creation.">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FieldGroup className="gap-4">
                        <Field>
                            <Label htmlFor="firstName" className="text-sm font-semibold text-zinc-200">
                                First name
                            </Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                placeholder="Jane"
                                autoComplete="given-name"
                                className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="lastName" className="text-sm font-semibold text-zinc-200">
                                Last name
                            </Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                placeholder="Doe"
                                autoComplete="family-name"
                                className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                            />
                        </Field>

                        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                        <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={pending || !isLoaded}>
                            {pending ? "Saving profile..." : "Finish account setup"}
                            <ArrowRight className="size-4" />
                        </Button>

                        <div id="clerk-captcha" />
                    </FieldGroup>
                </form>
            </AuthPanel>
        );
    }

    return (
        <AuthPanel
            title="Authentication complete"
            description="If we didn’t redirect automatically, use the button below to continue."
            redirect={
                <>
                    Need a different account?{" "}
                    <Link href="/sign-in" className="font-semibold text-sky-300 transition-colors hover:text-sky-200">
                        Back to sign in
                    </Link>
                </>
            }
        >
            <div className="space-y-4">
                {error ? <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</p> : null}
                <Button type="button" className="h-11 w-full text-sm font-semibold" onClick={() => router.replace("/")}>
                    Go to the app
                    <ArrowRight className="size-4" />
                </Button>
            </div>
        </AuthPanel>
    );
}
