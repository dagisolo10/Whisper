"use client";

import { Dispatch, SetStateAction } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import type { BaseProp } from "@/components/auth/form/forgot-password";

interface EmailProp extends BaseProp {
    email: string;
    sending: boolean;
    disabled: boolean;
    onSendResetCode: () => void;
    setEmail: Dispatch<SetStateAction<string>>;
}

export default function EmailStep({ email, setEmail, error, disabled, sending, onSendResetCode, step }: EmailProp) {
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

            <Button type="button" className="h-11 w-full text-sm font-semibold" disabled={disabled} onClick={onSendResetCode}>
                <Loader loading={sending} />
                <p>{sending ? "Sending code..." : "Send reset code"}</p>
                <ArrowRight className="size-4" />
            </Button>
        </FieldGroup>
    );
}
