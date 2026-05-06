"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useClerk, useSignIn } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { getClerkErrorMessage } from "@/lib/clerk-errors";

type ResetStep = "email" | "code" | "password";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const { signIn } = useSignIn();
    const { loaded: isLoaded, setActive } = useClerk();

    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [step, setStep] = useState<ResetStep>("email");
    const [error, setError] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [safeIdentifier, setSafeIdentifier] = useState<string | null>(null);

    const stepTitle = useMemo(() => {
        if (step === "email") return "Send reset code";
        if (step === "code") return "Verify code";
        return "Choose a new password";
    }, [step]);

    const sendResetCode = async () => {
        if (!isLoaded) return;

        setPending(true);
        setError(null);

        try {
            const { error: createError } = await signIn.create({ identifier: email });

            if (createError) {
                console.error(JSON.stringify(createError, null, 2));
                return;
            }

            const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();

            if (sendCodeError) {
                console.error(JSON.stringify(sendCodeError, null, 2));
                return;
            }

            setStep("code");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't send a reset code to that email."));
        } finally {
            setPending(false);
        }
    };

    const verifyCode = async () => {
        if (!isLoaded) return;

        setPending(true);
        setError(null);

        try {
            const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });

            if (error) {
                console.error(JSON.stringify(error, null, 2));
                return;
            }

            if (signIn.status === "needs_new_password") {
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
        if (!isLoaded) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setPending(true);
        setError(null);

        try {
            const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true });

            if (error) {
                console.error(JSON.stringify(error, null, 2));
                return;
            }

            if (signIn.status === "complete") {
                await setActive({
                    session: signIn.createdSessionId,
                    navigate: () => router.replace("/"),
                });
                return;
            }

            if (signIn.status === "needs_second_factor") {
                await signIn.mfa.sendEmailCode();
                router.push("/verification?mode=sign-in");
                return;
            }

            setError(`Sign-in attempt not complete: ${signIn}`);
            setError("Your password was updated, but the session could not be finalized automatically.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "We couldn't update your password."));
        } finally {
            setPending(false);
        }
    };

    const resendCode = async () => {
        if (!isLoaded) return;

        setPending(true);
        setError(null);

        try {
            const { error: createError } = await signIn.create({ identifier: email });

            if (createError) {
                console.error(JSON.stringify(createError, null, 2));
                return;
            }

            const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();

            if (sendCodeError) {
                console.error(JSON.stringify(sendCodeError, null, 2));
                return;
            }

            setStep("code");
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
        setError(null);
    };

    const baseProps = { step, error, pending, isLoaded };

    return (
        <div className="w-full space-y-5">
            <Header step={step} stepTitle={stepTitle} safeIdentifier={safeIdentifier} email={email} />

            <EmailStep {...baseProps} email={email} setEmail={setEmail} onSendResetCode={sendResetCode} />

            <CodeStep {...baseProps} code={code} setCode={setCode} onVerify={verifyCode} onResend={resendCode} />

            <PasswordStep
                {...baseProps}
                password={password}
                setPassword={setPassword}
                onUpdatePassword={updatePassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
            />

            <StartOver onResetFlow={resetFlow} pending={pending} />
        </div>
    );
}

interface BaseProp {
    step: ResetStep;
    pending: boolean;
    isLoaded: boolean;
    error: string | null;
}

interface EmailProp extends BaseProp {
    email: string;
    onSendResetCode: () => void;
    setEmail: Dispatch<SetStateAction<string>>;
}

interface CodeProp extends BaseProp {
    code: string;
    onVerify: () => void;
    onResend: () => void;
    setCode: Dispatch<SetStateAction<string>>;
}

interface PasswordProp extends BaseProp {
    password: string;
    confirmPassword: string;
    onUpdatePassword: () => void;
    setPassword: Dispatch<SetStateAction<string>>;
    setConfirmPassword: Dispatch<SetStateAction<string>>;
}

interface HeaderProp {
    email: string;
    step: ResetStep;
    stepTitle: string;
    safeIdentifier: string | null;
}

function Header({ step, stepTitle, safeIdentifier, email }: HeaderProp) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-sm font-semibold text-white">{stepTitle}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
                {step === "email" && "Enter the email on your Whisper account and we’ll send a secure reset code."}
                {step === "code" && `Enter the code we sent to ${safeIdentifier || email}.`}
                {step === "password" && "Set a fresh password and we’ll sign you back in immediately."}
            </p>
        </div>
    );
}

function EmailStep({ email, setEmail, error, pending, isLoaded, onSendResetCode, step }: EmailProp) {
    if (step !== "email") return null;

    return (
        <FieldGroup className="gap-4">
            <Field>
                <Label htmlFor="reset-email" className="text-sm font-semibold text-zinc-200">
                    Email address
                </Label>
                <Input
                    type="email"
                    value={email}
                    id="reset-email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                />
            </Field>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <Button type="button" className="h-11 w-full text-sm font-semibold" disabled={pending || !isLoaded || !email} onClick={onSendResetCode}>
                {pending ? "Sending code..." : "Send reset code"}
                <ArrowRight className="size-4" />
            </Button>
        </FieldGroup>
    );
}

function CodeStep({ code, setCode, error, pending, isLoaded, onVerify, onResend, step }: CodeProp) {
    if (step !== "code") return null;

    return (
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
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                />
            </Field>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 border-white/10 bg-white/5 text-sm text-white hover:bg-white/10"
                    onClick={onResend}
                    disabled={pending || !isLoaded}
                >
                    Resend
                </Button>
                <Button type="button" className="h-11 flex-1 text-sm font-semibold" onClick={onVerify} disabled={pending || !isLoaded || !code}>
                    {pending ? "Verifying..." : "Verify code"}
                </Button>
            </div>
        </FieldGroup>
    );
}

function PasswordStep({
    step,
    error,
    pending,
    password,
    isLoaded,
    setPassword,
    confirmPassword,
    onUpdatePassword,
    setConfirmPassword,
}: PasswordProp) {
    if (step !== "password") return null;

    return (
        <FieldGroup className="gap-4">
            <Field>
                <Label htmlFor="new-password" className="text-sm font-semibold text-zinc-200">
                    New password
                </Label>
                <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                />
            </Field>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <Button
                type="button"
                className="h-11 w-full text-sm font-semibold"
                onClick={onUpdatePassword}
                disabled={pending || !isLoaded || !password || !confirmPassword}
            >
                {pending ? "Updating password..." : "Update password"}
            </Button>
        </FieldGroup>
    );
}

function StartOver({ onResetFlow, pending }: { onResetFlow: () => void; pending: boolean }) {
    return (
        <Button type="button" variant="ghost" className="w-full text-sm text-zinc-400 hover:text-white" onClick={onResetFlow} disabled={pending}>
            <RotateCcw className="size-4" />
            Start over
        </Button>
    );
}
