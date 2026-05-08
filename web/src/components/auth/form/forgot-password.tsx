"use client";

import CodeStep from "@/components/auth/steps/code";
import EmailStep from "@/components/auth/steps/email";
import PasswordStep from "@/components/auth/steps/password";
import StartOver from "@/components/auth/steps/start-over";
import useForgotPassword, { ResetStep } from "@/hooks/use-forgot-password";

export default function ForgotPasswordForm() {
    const {
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
    } = useForgotPassword();

    return (
        <div className="w-full space-y-5">
            <Header step={step} stepTitle={stepTitle} email={email} />

            <EmailStep
                step={step}
                error={error}
                email={email}
                sending={sending}
                setEmail={setEmail}
                onSendResetCode={sendResetCode}
                disabled={sending || !isLoaded || !email}
            />

            <CodeStep
                step={step}
                code={code}
                error={error}
                setCode={setCode}
                resending={resending}
                verifying={verifying}
                onVerify={verifyCode}
                onResend={resendCode}
                disabledResend={resending || verifying || !isLoaded}
                disabledVerify={resending || verifying || !isLoaded || !code}
            />

            <PasswordStep
                step={step}
                error={error}
                password={password}
                setPassword={setPassword}
                onUpdatePassword={updatePassword}
                confirmPassword={confirmPassword}
                updatingPassword={updatingPassword}
                setConfirmPassword={setConfirmPassword}
                disabled={updatingPassword || !isLoaded || !password || !confirmPassword}
            />

            <StartOver onResetFlow={resetFlow} disabled={sending || verifying || updatingPassword || resending} />
        </div>
    );
}

function Header({ step, stepTitle, email }: { email: string; step: ResetStep; stepTitle: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-sm font-semibold text-white">{stepTitle}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
                {step === "email" && "Enter the email on your Whisper account and we’ll send a secure reset code."}
                {step === "code" && `Enter the code we sent to ${email}.`}
                {step === "password" && "Set a fresh password and we’ll sign you back in immediately."}
            </p>
        </div>
    );
}
