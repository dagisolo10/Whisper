"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn } from "@clerk/nextjs";

import { getClerkErrorMessage } from "@/lib/clerk-errors";

export type ResetStep = "email" | "code" | "password";
export interface BaseProp {
    step: ResetStep;
    error: string | null;
}

export default function useForgotPassword() {
    const router = useRouter();
    const { signIn } = useSignIn();
    const { loaded: isLoaded } = useClerk();

    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const [step, setStep] = useState<ResetStep>("email");
    const [error, setError] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");

    const stepTitle = useMemo(() => {
        if (step === "email") return "Send reset code";
        if (step === "code") return "Verify code";
        return "Choose a new password";
    }, [step]);

    const verifyCode = async () => {
        if (!isLoaded) return;

        setVerifying(true);
        setError(null);

        try {
            const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });

            if (error) {
                setError(getClerkErrorMessage(error, "We couldn't verify code."));
                return;
            }

            if (signIn.status === "needs_new_password") {
                setStep("password");
                return;
            }

            setError(`Code was accepted but the flow can't continue automatically (status: ${signIn.status ?? "unknown"}).`);
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't verify that code."));
        } finally {
            setVerifying(false);
        }
    };

    const updatePassword = async () => {
        if (!isLoaded) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setUpdatingPassword(true);
        setError(null);

        try {
            const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true });

            if (error) {
                setError(getClerkErrorMessage(error, "We couldn't update your password."));
                return;
            }

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
                router.push("/verification?mode=forgot-password");
                return;
            }

            console.warn("Unhandled signIn.status after submitPassword:", signIn.status);
            setError("Your password was updated, but we couldn't sign you in automatically. Please sign in again.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't update your password."));
        } finally {
            setUpdatingPassword(false);
        }
    };

    const requestResetCode = async (setBusy: (v: boolean) => void, advance: boolean) => {
        if (!isLoaded) return;

        setBusy(true);
        setError(null);

        try {
            const { error: createError } = await signIn.create({ identifier: email });

            if (createError) {
                setError(getClerkErrorMessage(createError, "We couldn't start the password reset."));
                return;
            }

            const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();

            if (sendCodeError) {
                setError(getClerkErrorMessage(sendCodeError, "We couldn't send the reset code."));
                return;
            }

            if (advance) setStep("code");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't send a reset code to that email."));
        } finally {
            setResending(false);
            setBusy(false);
        }
    };

    const sendResetCode = () => requestResetCode(setSending, true);
    const resendCode = () => requestResetCode(setResending, false);

    const resetFlow = () => {
        setCode("");
        setError(null);
        setPassword("");
        setStep("email");
        setConfirmPassword("");
    };

    return {
        code,
        step,
        email,
        error,
        sending,
        setCode,
        setEmail,
        password,
        isLoaded,
        resending,
        stepTitle,
        resetFlow,
        verifying,
        resendCode,
        verifyCode,
        setPassword,
        sendResetCode,
        updatePassword,
        confirmPassword,
        updatingPassword,
        setConfirmPassword,
    };
}
