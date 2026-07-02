import "server-only";

import type { PitchKitRequest, PitchKitStatus } from "@/lib/pitchkit";

type AdminListResponse = {
  requests: PitchKitRequest[];
};

const apiBaseUrl = getServerApiBaseUrl();

export async function fetchAdminRequests(): Promise<PitchKitRequest[]> {
  const token = getAdminAccessToken("admin queue");
  const response = await fetch(`${apiBaseUrl}/api/admin/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await readError(response);
    throw new Error(message);
  }

  const body = (await response.json()) as AdminListResponse;
  return body.requests;
}

export async function updateAdminRequestStatus(id: string, status: PitchKitStatus): Promise<void> {
  const token = getAdminAccessToken("status updates");
  const response = await fetch(`${apiBaseUrl}/api/admin/requests/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const message = await readError(response);
    throw new Error(message);
  }
}

function getAdminAccessToken(context: string): string {
  const token = process.env.ADMIN_ACCESS_TOKEN;
  if (!token) {
    throw new Error(`ADMIN_ACCESS_TOKEN is required for ${context}.`);
  }

  return token;
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

function getServerApiBaseUrl(): string {
  return normalizeHttpUrl(
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
    "API_BASE_URL",
  );
}

function normalizeHttpUrl(value: string, label: string): string {
  const url = new URL(value);
  if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname || url.username || url.password) {
    throw new Error(`${label} must be an HTTP(S) URL without credentials.`);
  }

  return url.toString().replace(/\/$/, "");
}
