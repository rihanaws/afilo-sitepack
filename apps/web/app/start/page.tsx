import Link from "next/link";
import { Brand } from "@/components/brand";
import { RequestForm } from "./request-form";

export const metadata = {
  title: "Start · Afilo PitchKit Growth Report",
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="border-b border-line-muted bg-canvas-raised">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-5 sm:px-8">
          <Brand />
          <Link className="text-sm text-ink-subtle transition hover:text-ink" href="/">
            Back
          </Link>
        </div>
      </nav>
      <main className="mx-auto grid max-w-[1100px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <section>
          <div className="text-[13px] font-medium tracking-[0.4px] text-primary-soft">Afilo PitchKit Growth Report · $149</div>
          <h1 className="mt-4 text-[clamp(34px,5vw,56px)] font-semibold leading-[1.04] tracking-[-0.045em]">Tell us where to point the report.</h1>
          <p className="mt-5 max-w-[520px] text-[17px] leading-8 text-ink-muted">
            Two minutes of context makes your Growth Report dramatically sharper. Everything stays confidential.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-ink-subtle">
            {["Submit this form", "Pay $149 via Paddle checkout", "Growth Report in your inbox within 48 hours"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-line bg-surface-1 px-4 py-3">
                <span className="font-mono text-xs text-[#c9a8ff]">0{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-faint">
            Questions first?{" "}
            <a className="text-ink-muted underline decoration-line underline-offset-4 hover:text-ink" href="mailto:pitchkit@afilo.io">
              pitchkit@afilo.io
            </a>
          </p>
        </section>
        <RequestForm />
      </main>
    </div>
  );
}
