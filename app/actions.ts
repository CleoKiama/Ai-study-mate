"use server";

import { authClient } from "@/utils/auth.client";
import { redirect } from "next/navigation";

export async function logoutAction() {
  try {
    await authClient.signOut();
    redirect("/");
  } catch (error) {
    throw error;
  }
}