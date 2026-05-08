import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getClerkErrorMessage } from "@/lib/clerk-errors";
import { useSignUp, useSignIn, useAuth, useClerk } from "@clerk/nextjs";

export default function useVerification() {
    const { signUp } = useSignUp();
    const { signIn } = useSignIn();
    const { isSignedIn } = useAuth();
    const { loaded: clerkLoaded } = useClerk();

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
        setResent(false);

        try {
            if (mode === "sign-up" && signUp) {
                await signUp.verifications.verifyEmailCode({ code });

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
            } else if ((mode === "sign-in" || mode === "forgot-password") && signIn) {
                await signIn.mfa.verifyEmailCode({ code });

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
            let didResend = false;

            if (mode === "sign-up" && signUp) {
                await signUp.verifications.sendEmailCode();
                didResend = true;
            } else if ((mode === "sign-in" || mode === "forgot-password") && signIn) {
                await signIn.mfa.sendEmailCode();
                didResend = true;
            }

            if (!didResend) {
                setError("Invalid verification mode. Please restart the flow.");
                return;
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

    return {
        mode,
        code,
        error,
        signUp,
        signIn,
        resent,
        setCode,
        verifying,
        resending,
        resendCode,
        clerkLoaded,
        getBackHref,
        handleVerify,
    };
}
