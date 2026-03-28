// note: run `bun db:auth` to regenerate `users/tables.ts`
// after making breaking changes to this file

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { UserDbType } from "~/lib/auth-types";

import { SYSTEM_CONFIG } from "~/app";
import { db } from "~/db";
import {
  accountTable,
  sessionTable,
  userTable,
  verificationTable,
} from "~/db/schema";

interface GoogleProfile {
  [key: string]: unknown; // index signature required by better-auth
  email?: string;
  family_name?: string;
  given_name?: string;
}

export const auth = betterAuth({
  account: {
    accountLinking: {
      allowDifferentEmails: false,
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  baseURL: process.env.NEXT_SERVER_APP_URL,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account: accountTable,
      session: sessionTable,
      user: userTable,
      verification: verificationTable,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  oauth: {
    defaultCallbackUrl: SYSTEM_CONFIG.redirectAfterSignIn,
    errorCallbackUrl: "/auth/sign-in",
    linkAccountsByEmail: true,
  },

  secret: process.env.AUTH_SECRET,

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapProfileToUser: (profile: any) => ({
        age: null,
        firstName: profile.given_name ?? "",
        lastName: profile.family_name ?? "",
      }),
      scope: ["openid", "email", "profile"],
    },
  },

  user: {
    additionalFields: {
      age: {
        input: true,
        required: false,
        type: "number",
      },
      firstName: {
        input: true,
        required: false,
        type: "string",
      },
      lastName: {
        input: true,
        required: false,
        type: "string",
      },
      phone: {
        input: true,
        required: false,
        type: "string",
      },
    },
  },
});

export const getCurrentUser = async (): Promise<null | UserDbType> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  return session.user as UserDbType;
};

export const getCurrentUserOrRedirect = async (
  forbiddenUrl = "/auth/sign-in",
  okUrl = "",
  ignoreForbidden = false,
): Promise<null | UserDbType> => {
  const user = await getCurrentUser();
  if (!user) {
    if (!ignoreForbidden) redirect(forbiddenUrl);
    return user;
  }
  if (okUrl) redirect(okUrl);
  return user;
};
