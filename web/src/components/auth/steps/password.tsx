"use client";

import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import { BaseProp } from "@/hooks/use-forgot-password";

interface PasswordProp extends BaseProp {
    password: string;
    disabled: boolean;
    confirmPassword: string;
    updatingPassword: boolean;
    onUpdatePassword: () => void;
    setPassword: Dispatch<SetStateAction<string>>;
    setConfirmPassword: Dispatch<SetStateAction<string>>;
}

export default function PasswordStep({ step, error, disabled, password, setPassword, confirmPassword, updatingPassword, onUpdatePassword, setConfirmPassword }: PasswordProp) {
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

            <Button type="button" className="h-11 w-full text-sm font-semibold" onClick={onUpdatePassword} disabled={disabled}>
                <Loader loading={updatingPassword} />
                <p>{updatingPassword ? "Updating password..." : "Update password"}</p>
            </Button>
        </FieldGroup>
    );
}
