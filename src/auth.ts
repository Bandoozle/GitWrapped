import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export function isGitHubAuthConfigured() {
  return Boolean(
    process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim(),
  );
}

const providers = isGitHubAuthConfigured()
  ? [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        authorization: {
          params: {
            scope: "read:user user:email repo",
          },
        },
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile && "login" in profile && typeof profile.login === "string") {
        token.login = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.login = typeof token.login === "string" ? token.login : undefined;
      }
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.hasGitHub = Boolean(token.accessToken);
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
