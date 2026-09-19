import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials sign-in (used for the reviewer demo account) only works
  // with JWT sessions — database sessions aren't created for it. GitHub
  // OAuth works fine either way; the adapter still persists User/Account.
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      authorization: {
        params: {
          // `repo` is required to read commit/PR data on private repos the
          // user chooses to track. Public-only usage still works without it.
          scope: "read:user user:email repo",
        },
      },
    }),
    // Reviewer/demo access only (e.g. for payment-provider KYC verification).
    // GitPulse's real users always sign in via GitHub OAuth.
    Credentials({
      id: "demo",
      name: "Demo account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          email !== process.env.DEMO_ACCOUNT_EMAIL ||
          password !== process.env.DEMO_ACCOUNT_PASSWORD
        ) {
          return null;
        }
        return prisma.user.findUnique({ where: { email } });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user, profile }) {
      const login = (profile as { login?: unknown } | undefined)?.login;
      const githubLogin = typeof login === "string" ? login : undefined;
      if (githubLogin) {
        await prisma.user.update({
          where: { id: user.id },
          data: { githubLogin },
        });
      }
    },
  },
  pages: {
    signIn: "/",
  },
});
