"use server";
import { auth } from "@/utils/auth.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    if (error instanceof Error)
      console.log(`error getting the session, ${error.message}`);
    return null;
  }
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
