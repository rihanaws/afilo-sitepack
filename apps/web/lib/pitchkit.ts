import { z } from "zod";

export const pitchKitRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  companyName: z.string().trim().max(120).optional(),
  websiteUrl: z.string().trim().url().refine(isSafeHttpUrl, "Website URL must use HTTP or HTTPS without credentials."),
  targetAudience: z.string().trim().max(240).optional(),
  goal: z.string().trim().min(8).max(600),
  notes: z.string().trim().max(1200).optional(),
});

export type PitchKitRequestInput = z.infer<typeof pitchKitRequestSchema>;

export type PitchKitStatus = "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "DELIVERED" | "REFUNDED" | "CANCELED";

export type PitchKitRequest = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: PitchKitStatus;
  customerEmail: string;
  customerName: string;
  companyName: string | null;
  websiteUrl: string;
  targetAudience: string | null;
  goal: string;
  notes: string | null;
  paddleTransactionId: string | null;
  paddleCustomerId: string | null;
  paddlePriceId: string | null;
  amount: number | null;
  currency: string | null;
  deliveredAt: string | null;
  internalNotes: string | null;
};

type ApiCreateResponse = {
  request: PitchKitRequest;
};

const apiBaseUrl = getPublicApiBaseUrl();

export async function createPitchKitRequest(input: PitchKitRequestInput): Promise<PitchKitRequest> {
  const parsed = pitchKitRequestSchema.parse(input);
  const response = await fetch(`${apiBaseUrl}/api/pitchkit/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed),
  });

  if (!response.ok) {
    const message = await readError(response);
    throw new Error(message);
  }

  const body = (await response.json()) as ApiCreateResponse;
  return body.request;
}

async function readError(response: Response): Promise<string> {
  const fallback = `PitchKit API request failed ${response.status}`;
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

function getPublicApiBaseUrl(): string {
  return normalizeHttpUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000", "NEXT_PUBLIC_API_BASE_URL");
}

function isSafeHttpUrl(value: string): boolean {
  try {
    normalizeHttpUrl(value, "websiteUrl");
    return true;
  } catch {
    return false;
  }
}

function normalizeHttpUrl(value: string, label: string): string {
  const url = new URL(value);
  if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname || url.username || url.password) {
    throw new Error(`${label} must be an HTTP(S) URL without credentials.`);
  }

  return url.toString().replace(/\/$/, "");
}
