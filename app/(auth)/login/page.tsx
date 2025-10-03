import { AuthForm } from "@/components/auth-form";
import { loginAction } from "../actions";
import { redirectIfAuthenticated } from "@/utils/session.server";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <AuthForm
        mode="login"
        onSubmit={loginAction}
      />
    </div>
  );
}