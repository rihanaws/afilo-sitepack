import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { fetchAdminRequests } from "@/lib/pitchkit-admin";
import { type PitchKitRequest, type PitchKitStatus } from "@/lib/pitchkit";
import { setRequestStatus } from "./actions";

export const metadata = {
  title: "Fulfillment queue · Afilo PitchKit",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await auth.protect();

  let requests: PitchKitRequest[] = [];
  let loadError: string | null = null;

  try {
    requests = await fetchAdminRequests();
  } catch (caught) {
    loadError = caught instanceof Error ? caught.message : "Unable to load requests.";
  }

  const openCount = requests.filter(
    (request) => request.status === "PENDING_PAYMENT" || request.status === "PAID" || request.status === "IN_PROGRESS",
  ).length;
  const deliveredCount = requests.filter((request) => request.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="border-b border-line-muted bg-canvas-raised">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Brand compact />
            <span className="h-5 w-px bg-line" />
            <span className="text-[13px] text-ink-subtle">Internal · Fulfillment</span>
          </div>
          <UserButton />
        </div>
      </nav>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-9 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-[26px] font-semibold tracking-[-0.5px]">Request queue</h1>
            <p className="mb-0 mt-2 text-[13px] text-ink-subtle">Paid requests move from Paddle webhook to fulfillment here.</p>
          </div>
          <div className="flex gap-3">
            <Stat label="Open" value={openCount} />
            <Stat label="Delivered" value={deliveredCount} tone="success" />
          </div>
        </div>

        {loadError ? (
          <div className="rounded-card border border-primary-hot/35 bg-primary-hot/10 p-5 text-sm leading-6 text-[#ff9ed4]">
            {loadError}
            <p className="mb-0 mt-2 text-ink-subtle">Admin API access currently uses a temporary `ADMIN_ACCESS_TOKEN` guard in v0.1.</p>
          </div>
        ) : (
          <QueueTable requests={requests} />
        )}

        <p className="m-0 text-xs text-ink-faint">
          Route protected by Clerk middleware. Backend admin endpoints are additionally guarded by `ADMIN_ACCESS_TOKEN` until Clerk JWT verification replaces the temporary v0.1 guard.
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" }) {
  return (
    <div className="min-w-24 rounded-[10px] border border-line bg-surface-1 px-4 py-3">
      <div className={tone === "success" ? "text-[22px] font-semibold tracking-[-0.5px] text-success" : "text-[22px] font-semibold tracking-[-0.5px] text-ink"}>{value}</div>
      <div className="text-xs text-ink-subtle">{label}</div>
    </div>
  );
}

function QueueTable({ requests }: { requests: PitchKitRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface-1 px-5 py-14 text-center">
        <div className="text-[15px] font-medium">No requests yet</div>
        <p className="mb-0 mt-2 text-sm text-ink-subtle">New paid requests appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface-1">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[150px_1.4fr_1.2fr_120px_140px_220px] gap-4 border-b border-line-muted px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.4px] text-ink-faint">
            <span>Status</span>
            <span>Customer</span>
            <span>Website</span>
            <span>Payment</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>
          {requests.map((request) => (
            <div key={request.id} className="grid grid-cols-[150px_1.4fr_1.2fr_120px_140px_220px] items-center gap-4 border-b border-line-muted px-5 py-4 last:border-b-0">
              <StatusBadge status={request.status} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{request.customerName}</div>
                <div className="truncate text-xs text-ink-subtle">{request.companyName ?? request.customerEmail}</div>
              </div>
              <Link className="truncate font-mono text-[12.5px] text-ink-muted hover:text-ink" href={request.websiteUrl} target="_blank">
                {request.websiteUrl}
              </Link>
              <span className={request.paddleTransactionId ? "text-sm text-success" : "text-sm text-[#ff9ed4]"}>{request.paddleTransactionId ? "Paid" : "Pending"}</span>
              <span className="font-mono text-[12.5px] text-ink-subtle">{new Date(request.createdAt).toLocaleDateString()}</span>
              <div className="flex justify-end gap-2">
                {nextActions(request.status).map((action) => (
                  <StatusButton key={action.status} id={request.id} status={action.status} label={action.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function nextActions(status: PitchKitStatus): { status: PitchKitStatus; label: string }[] {
  switch (status) {
    case "PENDING_PAYMENT":
      return [{ status: "CANCELED", label: "Cancel" }];
    case "PAID":
      return [
        { status: "IN_PROGRESS", label: "Start" },
        { status: "REFUNDED", label: "Refund" },
      ];
    case "IN_PROGRESS":
      return [
        { status: "DELIVERED", label: "Deliver" },
        { status: "REFUNDED", label: "Refund" },
      ];
    case "DELIVERED":
      return [{ status: "REFUNDED", label: "Refund" }];
    case "REFUNDED":
    case "CANCELED":
      return [];
  }
}

function StatusButton({ id, status, label }: { id: string; status: PitchKitStatus; label: string }) {
  return (
    <form action={setRequestStatus}>
      <input name="id" type="hidden" value={id} />
      <input name="status" type="hidden" value={status} />
      <button className="h-8 rounded-md border border-line bg-surface-2 px-3 text-xs font-medium text-ink-muted transition hover:bg-surface-3 hover:text-ink" type="submit">
        {label}
      </button>
    </form>
  );
}

function StatusBadge({ status }: { status: PitchKitStatus }) {
  const styles: Record<PitchKitStatus, string> = {
    PENDING_PAYMENT: "border-primary-hot/35 bg-primary-hot/10 text-[#ff9ed4]",
    PAID: "border-primary/40 bg-primary/15 text-[#a8c5ff]",
    IN_PROGRESS: "border-primary/40 bg-primary/15 text-[#c9a8ff]",
    DELIVERED: "border-success/35 bg-success/10 text-success",
    REFUNDED: "border-ink-faint/40 bg-surface-2 text-ink-subtle",
    CANCELED: "border-ink-faint/40 bg-surface-2 text-ink-subtle",
  };

  const labels: Record<PitchKitStatus, string> = {
    PENDING_PAYMENT: "Pending pay",
    PAID: "Paid",
    IN_PROGRESS: "In progress",
    DELIVERED: "Delivered",
    REFUNDED: "Refunded",
    CANCELED: "Canceled",
  };

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
