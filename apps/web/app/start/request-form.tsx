"use client";

import { useState, useTransition } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { createPitchKitRequest, pitchKitRequestSchema, type PitchKitRequestInput } from "@/lib/pitchkit";

const initialForm: PitchKitRequestInput = {
  customerName: "",
  customerEmail: "",
  companyName: "",
  websiteUrl: "",
  targetAudience: "",
  goal: "",
  notes: "",
};

export function RequestForm() {
  const [form, setForm] = useState<PitchKitRequestInput>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof PitchKitRequestInput>(field: K, value: PitchKitRequestInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const parsed = pitchKitRequestSchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
        return;
      }

      try {
        const request = await createPitchKitRequest(parsed.data);
        const paddle = await loadPaddle();
        const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PITCHKIT_AUDIT;
        if (!priceId) {
          throw new Error("NEXT_PUBLIC_PADDLE_PRICE_ID_PITCHKIT_AUDIT is not configured.");
        }

        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customer: { email: parsed.data.customerEmail },
          customData: {
            pitchkit_request_id: request.id,
            website_url: parsed.data.websiteUrl,
          },
          settings: {
            successUrl: `${window.location.origin}/success?requestId=${request.id}`,
          },
        });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to start checkout.");
      }
    });
  }

  return (
    <div className="rounded-card border border-line bg-surface-1 p-5 sm:p-7">
      <div className="grid gap-4">
        <Field label="Your name" value={form.customerName} onChange={(value) => updateField("customerName", value)} autoComplete="name" />
        <Field label="Email" type="email" value={form.customerEmail} onChange={(value) => updateField("customerEmail", value)} autoComplete="email" />
        <Field label="Company" value={form.companyName ?? ""} onChange={(value) => updateField("companyName", value)} autoComplete="organization" />
        <Field label="Website URL" type="url" value={form.websiteUrl} onChange={(value) => updateField("websiteUrl", value)} placeholder="https://example.com" />
        <Field label="Target audience" value={form.targetAudience ?? ""} onChange={(value) => updateField("targetAudience", value)} placeholder="Who needs to be convinced?" />
        <Label text="Growth or pitch goal">
          <textarea
            className="min-h-28 w-full resize-y rounded-lg border border-line bg-canvas-raised px-3 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-primary"
            value={form.goal}
            onChange={(event) => updateField("goal", event.target.value)}
            placeholder="What should this page make buyers believe or do?"
          />
        </Label>
        <Label text="Context notes">
          <textarea
            className="min-h-24 w-full resize-y rounded-lg border border-line bg-canvas-raised px-3 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-primary"
            value={form.notes ?? ""}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Known objections, competitors, recent changes, or anything we should ignore."
          />
        </Label>
      </div>

      {error ? <div className="mt-5 rounded-lg border border-primary-hot/35 bg-primary-hot/10 px-4 py-3 text-sm leading-6 text-[#ff9ed4]">{error}</div> : null}

      <button
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-[15px] font-medium text-white transition hover:bg-[#8d4bff] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={submit}
        type="button"
      >
        {isPending ? "Opening checkout..." : "Continue to $149 checkout"}
      </button>
      <p className="mb-0 mt-3 text-center text-xs text-ink-faint">Secure one-time payment via Paddle.</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <Label text={label}>
      <input
        autoComplete={autoComplete}
        className="h-[42px] w-full rounded-lg border border-line bg-canvas-raised px-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-primary"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </Label>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] font-medium text-ink-muted">{text}</span>
      {children}
    </label>
  );
}

async function loadPaddle(): Promise<Paddle> {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";

  if (!token) {
    throw new Error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured.");
  }

  const paddle = await initializePaddle({
    token,
    environment,
  });

  if (!paddle) {
    throw new Error("Paddle.js did not initialize.");
  }

  return paddle;
}
