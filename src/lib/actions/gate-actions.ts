"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "slate_gate_unlocked";

/**
 * Validates provided passcode against APP_PASSCODE env var.
 * If valid, sets cookie and redirects to destination or /dashboard.
 */
export async function verifyPasscode(formData: FormData) {
  const passcode = formData.get("passcode")?.toString()?.trim();
  const returnTo = formData.get("returnTo")?.toString() || "/dashboard";

  const configuredPasscode = process.env.APP_PASSCODE?.trim();

  // If no passcode configured, allow directly
  if (!configuredPasscode) {
    redirect(returnTo);
  }

  if (passcode === configuredPasscode) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    redirect(returnTo);
  }

  return { error: "Invalid passcode. Please try again." };
}

/**
 * Checks if the passcode gate is currently required and unlocked.
 */
export async function isGateUnlocked(): Promise<boolean> {
  const configuredPasscode = process.env.APP_PASSCODE?.trim();
  if (!configuredPasscode) return true;

  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "true";
}
