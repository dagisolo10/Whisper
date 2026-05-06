"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Star } from "lucide-react";
import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs";

import AuthPanel from "@/components/auth/ui/auth-panel";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClerkErrorMessage } from "@/lib/clerk-errors";
import FooterRedirect from "@/components/auth/ui/footer-redirect";
import Loader from "@/components/loader";

export default function Verification() {
    const { signUp } = useSignUp();
    const { signIn } = useSignIn();
    const { isSignedIn } = useAuth();
    const { loaded: clerkLoaded, setActive } = useClerk();

    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "sign-up";

    const [code, setCode] = useState("");
    const [resent, setResent] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isSignedIn) router.replace("/");
    }, [isSignedIn, router]);

    const handleVerify = async () => {
        if (!clerkLoaded) return;
        setVerifying(true);
        setError(null);

        try {
            if (mode === "sign-up" && signUp) {
                await signUp.verifications.verifyEmailCode({ code });

                if (signUp.status === "complete") {
                    await setActive({
                        session: signUp.createdSessionId,
                        navigate: () => router.replace("/"),
                    });
                    return;
                }
            } else if ((mode === "sign-in" || mode === "forgot-password") && signIn) {
                await signIn.mfa.verifyEmailCode({ code });

                if (signIn.status === "complete") {
                    await setActive({
                        session: signIn.createdSessionId,
                        navigate: () => router.replace("/"),
                    });
                    return;
                }
            }

            setError("That verification code wasn’t accepted. Double-check it and try again.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "Verification failed. Please check the code."));
        } finally {
            setVerifying(false);
        }
    };

    const resendCode = async () => {
        if (!clerkLoaded) return;
        setResending(true);
        setError(null);

        try {
            if (mode === "sign-up" && signUp) {
                await signUp.verifications.sendEmailCode();
            } else if ((mode === "sign-in" || mode === "forgot-password") && signIn) {
                await signIn.mfa.sendEmailCode();
            }

            setResent(true);
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't resend the verification code."));
        } finally {
            setResending(false);
        }
    };

    const getBackHref = () => {
        if (mode === "sign-up") return "/sign-up";
        if (mode === "forgot-password") return "/forgot-password";
        return "/sign-in";
    };

    return (
        <AuthPanel
            title="Verify your identity"
            description={mode === "sign-up" ? "Enter the code we sent to create your account." : "Enter the verification code to sign in."}
            redirect={<FooterRedirect text="Need to start again?" href={getBackHref()} link="Go back" />}
        >
            <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-sky-400/15 text-sky-300">
                            <Mail className="size-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Verification code sent</p>
                            <p className="text-sm text-zinc-400">
                                {mode === "sign-up" ? signUp?.emailAddress : signIn?.identifier || "Check your inbox."}
                            </p>
                        </div>
                    </div>
                </div>

                {resent && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3">
                        <Star className="size-4 fill-emerald-500 text-emerald-500" />
                        <p className="text-sm text-emerald-400">A new code has been sent to your inbox.</p>
                    </div>
                )}

                <FieldGroup className="gap-4">
                    <Field>
                        <Label htmlFor="code" className="text-sm font-semibold text-zinc-200">
                            Verification Code
                        </Label>
                        <Input
                            id="code"
                            inputMode="numeric"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="123456"
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                    <Button
                        type="button"
                        className="h-11 w-full text-sm font-semibold"
                        onClick={handleVerify}
                        disabled={verifying || !code || !clerkLoaded}
                    >
                        <Loader loading={verifying} />
                        <p>{verifying ? "Verifying..." : "Verify"}</p>
                        <ArrowRight className="size-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm text-zinc-400 hover:text-white"
                        onClick={resendCode}
                        disabled={resending || !clerkLoaded}
                    >
                        <Loader loading={resending} />
                        <p>Resend code</p>
                    </Button>
                </FieldGroup>
            </div>
        </AuthPanel>
    );
}
