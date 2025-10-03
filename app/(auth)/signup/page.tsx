import { AuthForm } from "@/components/auth-form";
import { signupAction } from "../actions";
import { redirectIfAuthenticated } from "@/utils/session.server";

export default async function SignUpPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <AuthForm
        mode="signup"
        onSubmit={signupAction}
      />
    </div>
  );
}