"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { getClerkErrorMessage } from "@/lib/clerk-errors";

type ResetStep = "email" | "code" | "password";
type ResetFactorConfig = {
    strategy: "reset_password_email_code";
    emailAddressId: string;
};

export default function ForgotPasswordForm() {
    const router = useRouter();
    const { isLoaded, signIn, setActive } = useSignIn();
    const [step, setStep] = useState<ResetStep>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [safeIdentifier, setSafeIdentifier] = useState<string | null>(null);
    const [resetFactorConfig, setResetFactorConfig] = useState<ResetFactorConfig | null>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stepTitle = useMemo(() => {
        if (step === "email") return "Send reset code";
        if (step === "code") return "Verify code";
        return "Choose a new password";
    }, [step]);

    const sendResetCode = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            setPending(true);
            setError(null);

            const result = await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });

            const resetFactor = result.supportedFirstFactors?.find((factor) => factor.strategy === "reset_password_email_code");

            if (!resetFactor) {
                setError("Password reset is not available for this account.");
                return;
            }

            await result.prepareFirstFactor(resetFactor);
            setSafeIdentifier("safeIdentifier" in resetFactor ? resetFactor.safeIdentifier : email);
            if ("emailAddressId" in resetFactor) {
                setResetFactorConfig({
                    strategy: "reset_password_email_code",
                    emailAddressId: resetFactor.emailAddressId,
                });
            }
            setStep("code");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't send a reset code to that email."));
        } finally {
            setPending(false);
        }
    };

    const verifyCode = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            setPending(true);
            setError(null);

            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
            });

            if (result.status === "needs_new_password") {
                setStep("password");
                return;
            }

            setError("That verification code was not accepted. Try again or request a fresh code.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't verify that code."));
        } finally {
            setPending(false);
        }
    };

    const updatePassword = async () => {
        if (!isLoaded) {
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setPending(true);
            setError(null);

            const result = await signIn.resetPassword({
                password,
                signOutOfOtherSessions: true,
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

            setError("Your password was updated, but the session could not be finalized automatically.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't update your password."));
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

            if (!resetFactorConfig) {
                setError("We need to restart the reset flow before resending a code.");
                return;
            }

            await signIn.prepareFirstFactor(resetFactorConfig);
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't resend the reset code."));
        } finally {
            setPending(false);
        }
    };

    const resetFlow = () => {
        setStep("email");
        setCode("");
        setPassword("");
        setConfirmPassword("");
        setSafeIdentifier(null);
        setResetFactorConfig(null);
        setError(null);
    };

    return (
        <div className="w-full space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <p className="text-sm font-semibold text-white">{stepTitle}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {step === "email" && "Enter the email on your Whisper account and we’ll send a secure reset code."}
                    {step === "code" && `Enter the code we sent to ${safeIdentifier || email}.`}
                    {step === "password" && "Set a fresh password and we’ll sign you back in immediately."}
                </p>
            </div>

            {step === "email" ? (
                <FieldGroup className="gap-4">
                    <Field>
                        <Label htmlFor="reset-email" className="text-sm font-semibold text-zinc-200">
                            Email address
                        </Label>
                        <Input
                            id="reset-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                    <Button type="button" className="h-11 w-full text-sm font-semibold" disabled={pending || !isLoaded || !email} onClick={sendResetCode}>
                        {pending ? "Sending code..." : "Send reset code"}
                        <ArrowRight className="size-4" />
                    </Button>
                </FieldGroup>
            ) : null}

            {step === "code" ? (
                <FieldGroup className="gap-4">
                    <Field>
                        <Label htmlFor="reset-code" className="text-sm font-semibold text-zinc-200">
                            Verification code
                        </Label>
                        <Input
                            id="reset-code"
                            type="text"
                            inputMode="numeric"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="123456"
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="h-11 flex-1 border-white/10 bg-white/5 text-sm text-white hover:bg-white/10" onClick={resendCode} disabled={pending || !isLoaded}>
                            Resend
                        </Button>
                        <Button type="button" className="h-11 flex-1 text-sm font-semibold" onClick={verifyCode} disabled={pending || !isLoaded || !code}>
                            {pending ? "Verifying..." : "Verify code"}
                        </Button>
                    </div>
                </FieldGroup>
            ) : null}

            {step === "password" ? (
                <FieldGroup className="gap-4">
                    <Field>
                        <Label htmlFor="new-password" className="text-sm font-semibold text-zinc-200">
                            New password
                        </Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Choose a strong password"
                            autoComplete="new-password"
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="confirm-password" className="text-sm font-semibold text-zinc-200">
                            Confirm password
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Repeat your new password"
                            autoComplete="new-password"
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                    <Button type="button" className="h-11 w-full text-sm font-semibold" onClick={updatePassword} disabled={pending || !isLoaded || !password || !confirmPassword}>
                        {pending ? "Updating password..." : "Update password"}
                    </Button>
                </FieldGroup>
            ) : null}

            {step !== "email" ? (
                <Button type="button" variant="ghost" className="w-full text-sm text-zinc-400 hover:text-white" onClick={resetFlow} disabled={pending}>
                    <RotateCcw className="size-4" />
                    Start over
                </Button>
            ) : null}
        </div>
    );
}
