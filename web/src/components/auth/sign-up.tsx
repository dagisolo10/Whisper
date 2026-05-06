"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useSignUp } from "@clerk/nextjs/legacy";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { getClerkErrorMessage } from "@/lib/clerk-errors";

export default function SignUpForm() {
    const router = useRouter();
    const { isLoaded, signUp, setActive } = useSignUp();

    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLoaded) {
            return;
        }

        const formData = new FormData(event.currentTarget);
        const firstName = String(formData.get("firstName") || "").trim();
        const lastName = String(formData.get("lastName") || "").trim();
        const emailAddress = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        try {
            setPending(true);
            setError(null);

            const result = await signUp.create({
                firstName,
                lastName,
                emailAddress,
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

            await result.prepareEmailAddressVerification({ strategy: "email_code" });
            router.push("/verification");
        } catch (err) {
            setError(getClerkErrorMessage(err, "Unable to create your account."));
        } finally {
            setPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <FieldGroup className="gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <Label htmlFor="firstName" className="font-semibold text-zinc-200">
                            First name
                        </Label>
                        <Input
                            id="firstName"
                            type="text"
                            name="firstName"
                            placeholder="Jane"
                            autoComplete="given-name"
                            className="border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="lastName" className="font-semibold text-zinc-200">
                            Last name
                        </Label>
                        <Input
                            id="lastName"
                            type="text"
                            name="lastName"
                            placeholder="Doe"
                            autoComplete="family-name"
                            className="border-white/10 bg-white/5 text-sm text-white placeholder:text-zinc-500"
                        />
                    </Field>
                </div>

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
                    <Label htmlFor="password" className="font-semibold text-zinc-200">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
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
                    {pending ? "Creating account..." : "Create account"}
                    <ArrowRight className="size-4" />
                </Button>

                <div id="clerk-captcha" />
            </FieldGroup>
        </form>
    );
}
