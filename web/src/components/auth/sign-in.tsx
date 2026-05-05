"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { getClerkErrorMessage } from "@/lib/clerk-errors";

export default function SignInForm() {
    const router = useRouter();
    const { isLoaded, signIn, setActive } = useSignIn();

    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) {
            return;
        }

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        try {
            setPending(true);
            setError(null);

            const result = await signIn.create({
                identifier: email,
                password,
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

            if (result.status === "needs_second_factor") {
                setError("This account needs an additional authentication factor. Finish that factor in Clerk to continue.");
                return;
            }

            setError("This sign-in attempt is not finished yet. Please try again or use Google sign-in.");
        } catch (err) {
            setError(getClerkErrorMessage(err, "Unable to sign in with email and password."));
        } finally {
            setPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <FieldGroup className="gap-4">
                <Field>
                    <Label htmlFor="email" className="text-sm font-semibold text-zinc-200">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                    />
                </Field>

                <Field>
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password" className="text-sm font-semibold text-zinc-200">
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
                            className="h-11 border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                        <Button
                            type="button"
                            onClick={() => setPasswordVisible((curr) => !curr)}
                            size={"icon"}
                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-transparent hover:bg-transparent"
                        >
                            {passwordVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                    </div>
                </Field>

                {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={pending || !isLoaded}>
                    {pending ? "Signing in..." : "Sign in"}
                    <ArrowRight className="size-4" />
                </Button>

                <div id="clerk-captcha" />
            </FieldGroup>
        </form>
    );
}
