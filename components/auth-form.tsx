"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (formData: FormData) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [state, formAction, pending] = React.useActionState(
    async (_: { error?: string }, formData: FormData) => {
      try {
        await onSubmit(formData);
        return {};
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "An error occurred",
        };
      }
    },
    {}
  );

  const isLogin = mode === "login";
  const title = isLogin ? "Login" : "Sign Up";
  const buttonText = isLogin ? "Login" : "Create Account";
  const alternateLink = isLogin ? "/signup" : "/login";
  const alternateText = isLogin ? "Don't have an account? Sign up" : "Already have an account? Login";

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          Enter your email and password to {isLogin ? "login" : "create your account"}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            disabled={pending}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={pending}
          />
        </div>

        {isLogin && (
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" name="remember" disabled={pending} />
            <label htmlFor="remember" className="text-sm">
              Remember me
            </label>
          </div>
        )}

        {state.error && (
          <div className="text-sm text-destructive" role="alert" aria-live="polite">
            {state.error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (isLogin ? "Logging in..." : "Creating account...") : buttonText}
        </Button>
      </form>

      <div className="text-center">
        <Link href={alternateLink} className="text-sm text-primary hover:underline">
          {alternateText}
        </Link>
      </div>
    </div>
  );
}