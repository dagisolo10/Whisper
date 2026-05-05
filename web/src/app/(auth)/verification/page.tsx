"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs/legacy";

import AuthPanel from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClerkErrorMessage } from "@/lib/clerk-errors";

export default function Verification() {
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const { isLoaded, signUp, setActive } = useSignUp();
    const [code, setCode] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isSignedIn) {
            router.replace("/");
        }
    }, [isSignedIn, router]);

    const verifyEmail = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            setPending(true);
            setError(null);

            const result = await signUp.attemptEmailAddressVerification({ code });

            if (result.status === "complete" && result.createdSessionId) {
                await setActive({
                    session: result.createdSessionId,
                    navigate: async () => {
                        router.replace("/");
                    },
                });
                return;
            }

            setError("That verification code wasn’t accepted. Double-check it and try again.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't verify your email code."));
        } finally {
            setPending(false);
        }
    };

    const resendCode = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            setPending(true);
            setError(null);
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't resend the verification code."));
        } finally {
            setPending(false);
        }
    };

    return (
        <AuthPanel
            title="Verify your email"
            description="Enter the code we sent to finish creating your account and unlock the app."
            redirect={
                <>
                    Need to start again?{" "}
                    <Link href="/sign-up" className="font-semibold text-sky-300 transition-colors hover:text-sky-200">
                        Go back to sign up
                    </Link>
                </>
            }
        >
            <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-full bg-sky-400/15 text-sky-300">
                            <Mail className="size-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Verification code sent</p>
                            <p className="text-sm text-zinc-400">{signUp?.emailAddress || "Check your inbox for a 6-digit code."}</p>
                        </div>
                    </div>
                </div>

                <FieldGroup className="gap-4">
                    <Field>
                        <Label htmlFor="verification-code" className="text-sm font-semibold text-zinc-200">
                            Email code
                        </Label>
                        <Input
                            id="verification-code"
                            type="text"
                            inputMode="numeric"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="123456"
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                    <Button type="button" className="h-11 w-full text-sm font-semibold" onClick={verifyEmail} disabled={pending || !isLoaded || !code}>
                        {pending ? "Verifying..." : "Verify email"}
                        <ArrowRight className="size-4" />
                    </Button>

                    <Button type="button" variant="ghost" className="w-full text-sm text-zinc-400 hover:text-white" onClick={resendCode} disabled={pending || !isLoaded}>
                        Resend code
                    </Button>
                </FieldGroup>
            </div>
        </AuthPanel>
    );
}
