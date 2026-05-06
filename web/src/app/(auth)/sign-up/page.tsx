import AuthPanel from "@/components/auth/ui/auth-panel";
import SignUpForm from "@/components/auth/form/sign-up";
import GoogleButton from "@/components/auth/ui/google-button";
import FooterRedirect from "@/components/auth/ui/footer-redirect";

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
