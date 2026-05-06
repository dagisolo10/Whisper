import SignInForm from "@/components/auth/sign-in";
import AuthPanel from "@/components/auth/auth-panel";
import GoogleButton from "@/components/auth/google-button";
import FooterRedirect from "@/components/auth/footer-redirect";

export default function SignIn() {
    return (
        <AuthPanel
            title="Welcome back"
            description="Use your email and password or sign in with Google to get back to your active conversations."
            redirect={<FooterRedirect text="New to Whisper?" href="/sign-up" link="Create an account" />}
        >
            <div className="space-y-6">
                <GoogleButton mode="sign-in" />
                <SignInForm />
            </div>
        </AuthPanel>
    );
}
