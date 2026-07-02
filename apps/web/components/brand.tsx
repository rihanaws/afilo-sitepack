import Link from "next/link";
import { AuthControls } from "@/components/auth-controls";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-ink no-underline">
      <span className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-primary-hot via-primary-soft to-primary text-[11px] font-bold text-white">
        A
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.2px]">
        Afilo <span className="font-medium text-ink-subtle">{compact ? "" : "PitchKit"}</span>
      </span>
    </Link>
  );
}

export function MarketingNav() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY);

  return (
    <nav className="sticky top-0 z-50 border-b border-line-muted bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Brand />
        <div className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
          <MarketingLinks />
        </div>
        <div className="flex items-center gap-2">
          {clerkConfigured ? <AuthControls /> : <ClerkSetupState />}
          <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-[#8d4bff]" href="/start">
            Get PitchKit
          </Link>
        </div>
      </div>
    </nav>
  );
}

function MarketingLinks() {
  return (
    <>
      <Link className="transition hover:text-ink" href="/#inside">
        What&apos;s inside
      </Link>
      <Link className="transition hover:text-ink" href="/#process">
        Process
      </Link>
      <Link className="transition hover:text-ink" href="/#faq">
        FAQ
      </Link>
    </>
  );
}

function ClerkSetupState() {
  return (
    <span className="hidden rounded-full border border-line bg-surface-1 px-3 py-1.5 text-xs text-ink-faint sm:inline-flex">
      Clerk env needed
    </span>
  );
}
