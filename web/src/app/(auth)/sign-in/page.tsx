import Link from "next/link";
import SignInForm from "@/components/auth/sign-in";
import AuthPanel from "@/components/auth/auth-panel";
import GoogleButton from "@/components/auth/google-button";

export default function SignIn() {
    return (
        <AuthPanel title="Welcome back" description="Use your email and password or sign in with Google to get back to your active conversations." redirect={<Redirect />}>
            <div className="space-y-6">
                <GoogleButton mode="sign-in" />
                <SignInForm />
            </div>
        </AuthPanel>
    );
}

function Redirect() {
    return (
        <div className="mt-4 flex items-center justify-center gap-2 text-center text-sm">
            <p className="text-zinc-400">New to Whisper?</p>
            <Link href="/sign-up" className="font-semibold text-sky-300 transition-colors hover:text-sky-200">
                Create an account
            </Link>
        </div>
    );
}
