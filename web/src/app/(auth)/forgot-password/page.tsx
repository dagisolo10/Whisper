import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import AuthPanel from "@/components/auth/auth-panel";
import ForgotPasswordForm from "@/components/auth/forgot-password";

export default function ForgotPasswordPage() {
    return (
        <AuthPanel title="Forgot your password?" description="Reset it with a secure email code, then we’ll sign you back in right away.">
            <div className="space-y-6">
                <ForgotPasswordForm />

                <div className="flex flex-col items-center gap-2">
                    <Link href="/sign-in" className="group flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-white">
                        <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-1" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </AuthPanel>
    );
}
