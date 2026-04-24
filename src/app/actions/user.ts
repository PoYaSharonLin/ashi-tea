"use server";

import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { db } from "~/db";
import { userTable } from "~/db/schema";
import { eq } from "drizzle-orm";

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { ok: false, error: "not_authenticated" };

  try {
    if (input.name) {
      await auth.api.updateUser({
        body: { name: input.name },
        headers: await headers(),
      });
    }

    if (input.phone !== undefined) {
      await db
        .update(userTable)
        .set({ phone: input.phone || null })
        .where(eq(userTable.id, session.user.id));
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "update_failed" };
  }
}
