"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="dash-signout"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Sign out
    </button>
  );
}
