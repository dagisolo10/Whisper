import Link from "next/link";
import SignUpForm from "@/components/auth/sign-up";
import AuthPanel from "@/components/auth/auth-panel";
import GoogleButton from "@/components/auth/google-button";

export default function SignUp() {
    return (
        <AuthPanel title="Create your account" description="Start with Google or set up an email login. New email accounts are verified before access." redirect={<Redirect />}>
            <div className="space-y-6">
                <GoogleButton mode="sign-up" />
                <SignUpForm />
            </div>
        </AuthPanel>
    );
}

function Redirect() {
    return (
        <div className="mt-4 flex items-center justify-center gap-2 text-center text-sm">
            <p className="text-zinc-400">Already have an account?</p>
            <Link href="/sign-in" className="font-semibold text-sky-300 transition-colors hover:text-sky-200">
                Sign in
            </Link>
        </div>
    );
}
