"use client";

import { SyntheticEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useClerk, useSignIn } from "@clerk/nextjs";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { getClerkErrorMessage } from "@/lib/clerk-errors";
import Loader from "@/components/loader";

export default function SignInForm() {
    const { signIn } = useSignIn();
    const { loaded: isLoaded, setActive } = useClerk();

    const router = useRouter();

    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSignIn = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) {
            return;
        }

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        try {
            setPending(true);
            setError(null);

            await signIn.password({ emailAddress: email, password });

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

            setError(`This sign-in attempt is not finished yet (status: ${signIn.status ?? "unknown"}). Please try again or use Google sign-in.`);
        } catch (err) {
            setError(getClerkErrorMessage(err, "Unable to sign in with email and password."));
        } finally {
            setPending(false);
        }
    };

    return (
        <form onSubmit={handleSignIn} className="w-full">
            <div id="clerk-captcha" className="mx-auto flex justify-center" />

            <FieldGroup className="gap-4">
                <Field>
                    <Label htmlFor="email" className="font-semibold text-zinc-200">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        className="border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                    />
                </Field>

                <Field>
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password" className="font-semibold text-zinc-200">
                            Password
                        </Label>
                        <Link href="/forgot-password" className="text-xs font-medium text-sky-300 transition-colors hover:text-sky-200">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                        <Button
                            type="button"
                            size={"icon"}
                            onClick={() => setPasswordVisible((curr) => !curr)}
                            aria-label={passwordVisible ? "Hide password" : "Show password"}
                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-transparent hover:bg-transparent"
                        >
                            {passwordVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                    </div>
                </Field>

                {error ? <p className="text-destructive text-sm">{error}</p> : null}

                <Button className="h-10 w-full text-sm font-semibold" disabled={pending || !isLoaded}>
                    <Loader loading={pending} />
                    <p>{pending ? "Signing in..." : "Sign in"}</p>
                    <ArrowRight className="size-4" />
                </Button>
            </FieldGroup>
        </form>
    );
}
