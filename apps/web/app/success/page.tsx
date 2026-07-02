import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Order Confirmed · Afilo PitchKit Growth Report",
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="border-b border-line-muted bg-canvas-raised">
        <div className="mx-auto flex h-[60px] max-w-[960px] items-center justify-between px-5 sm:px-8">
          <Brand />
          <Link className="text-sm text-ink-subtle transition hover:text-ink" href="/">
            Home
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-[760px] px-5 py-20 sm:px-8">
        <div className="rounded-card border border-line bg-surface-1 p-[clamp(28px,6vw,56px)]">
          <div className="mb-6 flex size-11 items-center justify-center rounded-full border border-success/40 bg-success/15 text-success">✓</div>
          <h1 className="m-0 text-[clamp(34px,5vw,58px)] font-semibold leading-[1.02] tracking-[-0.05em]">Payment received. Your Growth Report is in the queue.</h1>
          <p className="mt-5 text-lg leading-8 text-ink-muted">
            A confirmation email is on its way. Your complete Growth Report will arrive by email within <strong className="font-medium text-ink">48 hours</strong>.
          </p>
          <div className="mt-8 rounded-lg border border-line-muted bg-canvas-raised p-4">
            <div className="text-sm font-medium text-ink">Need anything in the meantime?</div>
            <p className="mb-0 mt-2 text-sm leading-6 text-ink-subtle">We reply within one business day.</p>
            <a className="mt-4 inline-flex text-sm text-ink-muted underline decoration-line underline-offset-4 hover:text-ink" href="mailto:pitchkit@afilo.io">
              pitchkit@afilo.io
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
