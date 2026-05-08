"use client";

import { ArrowRight, Mail, Star } from "lucide-react";

import AuthPanel from "@/components/auth/ui/auth-panel";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FooterRedirect from "@/components/auth/ui/footer-redirect";
import Loader from "@/components/loader";
import useVerification from "@/hooks/use-verification";

export default function Verification() {
    const { mode, code, error, signUp, signIn, resent, setCode, verifying, resending, resendCode, clerkLoaded, getBackHref, handleVerify } = useVerification();
    return (
        <AuthPanel
            title="Verify your identity"
            description={
                mode === "sign-up"
                    ? "Enter the code we sent to create your account."
                    : mode === "forgot-password"
                      ? "Enter the verification code to continue resetting your password."
                      : "Enter the verification code to sign in."
            }
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
                            <p className="text-sm text-zinc-400">{mode === "sign-up" ? signUp?.emailAddress : signIn?.identifier || "Check your inbox."}</p>
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

                    <Button type="button" className="h-11 w-full text-sm font-semibold" onClick={handleVerify} disabled={verifying || !code || !clerkLoaded}>
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
