"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <span className="hidden h-10 w-[170px] rounded-lg border border-line bg-surface-1 sm:inline-flex" aria-hidden="true" />;
  }

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <SignInButton mode="modal">
        <button className="inline-flex h-10 items-center justify-center rounded-lg border border-line bg-surface-1 px-4 text-sm font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink" type="button">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="inline-flex h-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 px-4 text-sm font-medium text-[#c9a8ff] transition hover:bg-primary/25 hover:text-ink" type="button">
          Sign up
        </button>
      </SignUpButton>
    </div>
  );
}
