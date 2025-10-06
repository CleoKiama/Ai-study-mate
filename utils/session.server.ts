"use server";
import { auth } from "@/utils/auth.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tryCatch } from "./misc";

export async function getServerSession() {
  const sessionPromise = auth.api.getSession({
    headers: await headers(),
  });

  const { data: session, error } = await tryCatch(sessionPromise);

  if (error) {
    console.error("Error getting the user session");
    return null;
  }

  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
}
