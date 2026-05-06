import SignUpForm from "@/components/auth/sign-up";
import AuthPanel from "@/components/auth/auth-panel";
import GoogleButton from "@/components/auth/google-button";
import FooterRedirect from "@/components/auth/footer-redirect";

export default function SignUp() {
    return (
        <AuthPanel
            title="Create your account"
            description="Start with Google or set up an email login. New email accounts are verified before access."
            redirect={<FooterRedirect text="Already have an account?" href="/sign-in" link="Sign in" />}
        >
            <div className="space-y-6">
                <GoogleButton mode="sign-up" />
                <SignUpForm />
            </div>
        </AuthPanel>
    );
}
