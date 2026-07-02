"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateAdminRequestStatus } from "@/lib/pitchkit-admin";
import { type PitchKitStatus } from "@/lib/pitchkit";

export async function setRequestStatus(formData: FormData) {
  await auth.protect();

  const id = formData.get("id");
  const status = formData.get("status");

  if (typeof id !== "string" || typeof status !== "string") {
    throw new Error("Invalid status update.");
  }

  if (!isPitchKitStatus(status)) {
    throw new Error("Invalid request status.");
  }

  await updateAdminRequestStatus(id, status);
  revalidatePath("/admin");
}

function isPitchKitStatus(value: string): value is PitchKitStatus {
  return (
    value === "PENDING_PAYMENT" ||
    value === "PAID" ||
    value === "IN_PROGRESS" ||
    value === "DELIVERED" ||
    value === "REFUNDED" ||
    value === "CANCELED"
  );
}
