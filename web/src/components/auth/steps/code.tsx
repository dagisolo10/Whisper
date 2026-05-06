"use client";

import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import type { BaseProp } from "@/components/auth/form/forgot-password";

interface CodeProp extends BaseProp {
    code: string;
    resending: boolean;
    disabledVerify: boolean;
    disabledResend: boolean;
    verifying: boolean;
    onVerify: () => void;
    onResend: () => void;
    setCode: Dispatch<SetStateAction<string>>;
}

export default function CodeStep({ code, setCode, error, resending, verifying, disabledVerify, disabledResend, onVerify, onResend, step }: CodeProp) {
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
                    disabled={disabledResend}
                >
                    <Loader loading={resending} />
                    <p>Resend</p>
                </Button>

                <Button type="button" className="h-11 flex-1 text-sm font-semibold" onClick={onVerify} disabled={disabledVerify}>
                    <Loader loading={verifying} />
                    <p>{verifying ? "Verifying..." : "Verify code"}</p>
                </Button>
            </div>
        </FieldGroup>
    );
}
