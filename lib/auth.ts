import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";

import { defaultLocale, fromLocaleCode, isLocale } from "@/lib/i18n/config";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  turnstileToken: z.string()  // empty string is valid when Turnstile is not configured
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    // Credentials are the MVP entry point. Email magic links and SSO providers can be added later.
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Work email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials, req) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        // Extract client IP for rate limiting and Turnstile binding
        const ip =
          req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          req?.headers?.get("x-real-ip") ??
          "unknown";

        // Rate limit: 5 login attempts per IP per 15 minutes
        const rateCheck = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
        if (!rateCheck.allowed) {
          return null;
        }

        // Verify Cloudflare Turnstile token
        const turnstileOk = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
        if (!turnstileOk) {
          return null;
        }

        const email = parsed.data.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        });

        if (
          !user ||
          user.deletedAt ||
          user.status !== "ACTIVE" ||
          !verifyPassword(parsed.data.password, user.hashedPassword)
        ) {
          return null;
        }

        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            lastLoginAt: new Date()
          }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub;

      if (!userId) {
        return token;
      }

      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: {
            id: userId
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            status: true,
            preferredLocale: true
          }
        });

        if (!dbUser) {
          return token;
        }

        token.sub = dbUser.id;
        token.name = dbUser.name ?? token.name;
        token.email = dbUser.email ?? token.email;
        token.picture = dbUser.image ?? token.picture;
        token.userStatus = dbUser.status;
        token.preferredLocale = fromLocaleCode(dbUser.preferredLocale);
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub ?? "",
        name: typeof token.name === "string" ? token.name : session.user?.name,
        email: typeof token.email === "string" ? token.email : session.user?.email,
        image: typeof token.picture === "string" ? token.picture : session.user?.image,
        status: typeof token.userStatus === "string" ? token.userStatus : "ACTIVE",
        preferredLocale:
          typeof token.preferredLocale === "string" && isLocale(token.preferredLocale)
            ? token.preferredLocale
            : defaultLocale,
        needsOnboarding: false,
        currentWorkspaceId: null,
        currentWorkspaceName: null,
        currentWorkspaceSlug: null,
        tenantId: null,
        planType: null,
        planName: null,
        roleId: null,
        roleCode: null,
        roleName: null,
        permissions: []
      };

      return session;
    }
  }
});
