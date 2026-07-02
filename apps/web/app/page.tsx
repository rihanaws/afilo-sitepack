import Link from "next/link";
import { MarketingNav } from "@/components/brand";

const reportItems = [
  ["01", "Positioning diagnosis", "Where your homepage blurs into competitors and what to sharpen."],
  ["02", "Headline & subheading improvements", "Sharper promise and outcome language for your best buyer."],
  ["03", "Conversion gaps", "The doubts your page creates and where clarity or proof is missing."],
  ["04", "Lead magnet ideas", "Offer concepts to capture demand you're currently losing."],
  ["05", "Outreach angle", "A message to test with your target audience, grounded in the report's findings."],
  ["06", "LinkedIn content idea", "A post concept built on the same findings, ready to adapt."],
  ["07", "SEO/content brief", "A starting point for content that supports the positioning fix."],
  ["08", "Recommended next actions", "A short, ranked list of what to do first."],
] as const;

const processSteps = [
  ["01", "2 min", "Submit the URL", "Drop the page, buyer, and goal so the report has a precise target."],
  ["02", "1 min", "Pay once", "Secure the $149 report through Paddle checkout."],
  ["03", "48h", "Report generated", "Afilo PitchKit runs your public pages through its workflow and a quality pass."],
  ["04", "Inbox", "Growth Report lands", "You receive your digital Growth Report by email within 48 hours."],
] as const;

const faqs = [
  ["Is this automated?", "Afilo PitchKit Growth Report is a software-assisted report product. It runs your public pages through our workflow with a quality-assurance pass before delivery."],
  ["What do I get?", "A digital report covering positioning, headline and subheading improvements, conversion gaps, lead magnet ideas, an outreach angle, a LinkedIn content idea, an SEO/content brief, and recommended next actions."],
  ["Can you cover a small or new site?", "Yes, as long as there is a public page and a clear buyer or growth goal."],
  ["What happens after payment?", "You get a confirmation email and your Growth Report within 48 hours. Recommendations aren't guaranteed results — no specific traffic, conversion, or revenue outcome is promised."],
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <MarketingNav />
      <main>
        <section className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
          <div className="max-w-[680px]">
            <div className="mb-5 text-[13px] font-medium tracking-[0.4px] text-primary-soft">Afilo PitchKit Growth Report · $149</div>
            <h1 className="m-0 text-[clamp(44px,7.2vw,86px)] font-semibold leading-[0.98] tracking-[-0.055em]">
              Your growth page is probably leaking trust.
            </h1>
            <p className="mt-6 max-w-[560px] text-lg leading-8 tracking-[-0.1px] text-ink-muted">
              Submit your URL and within 48 hours Afilo PitchKit turns your growth page into a positioning diagnosis, ranked
              fixes, and an SEO/content brief — delivered as a digital report.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-[15px] font-medium text-white transition hover:bg-[#8d4bff]" href="/start">
                Generate My Growth Report
              </Link>
              <a className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-surface-1 px-6 text-[15px] font-medium text-ink transition hover:bg-surface-2" href="/sample">
                View Sample Report
              </a>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-ink-subtle">
              <span>$149 one-time</span>
              <span className="size-1 rounded-full bg-ink-faint" />
              <span>Paddle checkout</span>
              <span className="size-1 rounded-full bg-ink-faint" />
              <span>Delivered in 48 hours</span>
            </div>
          </div>

          <div className="rounded-card border border-line bg-surface-1 p-4 shadow-2xl shadow-black/30">
            <div className="rounded-[10px] border border-line-muted bg-canvas-raised p-4">
              <div className="flex items-center justify-between border-b border-line-muted pb-4">
                <div>
                  <div className="text-sm font-medium text-ink">Pitch scan</div>
                  <div className="mt-1 text-xs text-ink-faint">northbeamgrowth.com</div>
                </div>
                <span className="rounded-full border border-primary-hot/35 bg-primary-hot/15 px-2 py-1 text-[11px] text-[#ff9ed4]">Critical</span>
              </div>
              <div className="grid gap-3 py-4">
                {[
                  ["Clarity", "4 / 10", "40%"],
                  ["Differentiation", "3 / 10", "30%"],
                  ["Proof", "5 / 10", "50%"],
                ].map(([label, score, width]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-xs text-ink-subtle">
                      <span>{label}</span>
                      <span className="font-mono">{score}</span>
                    </div>
                    <div className="h-1 rounded-full bg-surface-3">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-hot to-primary" style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 border-t border-line-muted pt-4 text-[13px]">
                {["Too many offers competing for attention", "No proof near CTA", "Objection left unanswered"].map((item) => (
                  <div key={item} className="rounded-lg border border-line-muted bg-surface-1 px-3 py-2 text-ink-subtle">
                    <span className="text-[#ff9ed4]">&quot;{item}&quot;</span> <span className="text-ink-faint">needs a sharper answer</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="inside" className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="mb-10 max-w-[650px]">
            <div className="mb-3 text-[13px] font-medium tracking-[0.4px] text-primary-soft">What's inside</div>
            <h2 className="m-0 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em]">A practical pitch repair kit, not a generic report.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportItems.map(([n, title, body]) => (
              <article key={n} className="rounded-card border border-line bg-surface-1 p-6">
                <div className="mb-4 font-mono text-[13px] text-ink-subtle">{n}</div>
                <h3 className="m-0 text-xl font-medium tracking-[-0.3px]">{title}</h3>
                <p className="mb-0 mt-3 text-sm leading-6 text-ink-subtle">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="mb-10 max-w-[640px]">
            <div className="mb-3 text-[13px] font-medium tracking-[0.4px] text-primary-soft">How it works</div>
            <h2 className="m-0 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em]">Submit the URL, pay once, get your Growth Report within 48 hours.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map(([n, time, title, body]) => (
              <article key={n} className="rounded-card border border-line bg-surface-1 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[13px] text-[#c9a8ff]">{n}</span>
                  <span className="font-mono text-xs text-ink-faint">{time}</span>
                </div>
                <h3 className="m-0 text-[17px] font-medium tracking-[-0.2px]">{title}</h3>
                <p className="mb-0 mt-3 text-sm leading-6 text-ink-subtle">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="rounded-card border border-line bg-surface-1 p-[clamp(32px,6vw,64px)]">
            <div className="mb-3 text-[13px] font-medium tracking-[0.4px] text-primary-soft">Trust &amp; transparency</div>
            <h2 className="m-0 max-w-[650px] text-[clamp(28px,4vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em]">What the Growth Report is — and isn't.</h2>
            <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-ink-subtle">
              Afilo PitchKit Growth Report is a software-assisted report product. We analyze information from your public pages
              — no logins, no private data harvested. A quality-assurance pass runs before delivery, and our support team is
              available if anything is unclear.
            </p>
            <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-ink-subtle">
              Recommendations are actionable, not guarantees — we don't promise specific traffic, conversion, or revenue
              results.
            </p>
            <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-ink-subtle">
              Questions or refund requests: <a className="text-ink underline decoration-line-muted underline-offset-4 hover:text-primary-soft" href="mailto:support@afilo.io">support@afilo.io</a>. Payments are processed by Paddle.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="rounded-card border border-line bg-surface-1 p-[clamp(32px,6vw,64px)]">
            <h2 className="m-0 max-w-[650px] text-[clamp(28px,4vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em]">Ready to find the pitch leaks?</h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-ink-subtle">$149, one time. Delivered as a digital report within 48 hours of payment.</p>
            <Link className="mt-7 inline-flex h-[46px] items-center justify-center rounded-lg bg-gradient-to-r from-primary-hot via-primary-soft to-primary px-7 text-[15px] font-medium text-white" href="/start">
              Generate My Growth Report
            </Link>
          </div>
        </section>

        <section id="faq" className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-3 text-[13px] font-medium tracking-[0.4px] text-primary-soft">FAQ</div>
            <h2 className="m-0 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.12] tracking-[-0.025em]">Questions, answered plainly.</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-card border border-line bg-surface-1 p-5">
                <summary className="cursor-pointer text-[15px] font-medium">{question}</summary>
                <p className="mb-0 mt-3 max-w-[620px] text-sm leading-6 text-ink-subtle">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8">
          <div className="border-t border-line-muted pt-6 text-[13px] text-ink-faint">
            Afilo PitchKit Growth Report is a TechSci Inc. product. Payments processed by Paddle. Uses publicly available page
            information only. Support: support@afilo.io · Refund Policy · © 2026 TechSci Inc.
          </div>
        </footer>
      </main>
    </div>
  );
}
