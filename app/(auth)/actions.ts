"use server";

import { auth } from "@/utils/auth.server";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: email.split("@")[0], // Use email prefix as default name
      },
    });

    redirect("/");
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  if (!email || !password) throw new Error("Email and password are required");

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: remember,
      },
    });

    console.log("redirecting now.....");
    redirect("/");
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error("something went wrong please try again");
    }
    throw error;
  }
}

