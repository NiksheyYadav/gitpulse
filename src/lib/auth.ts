import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
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
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
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
