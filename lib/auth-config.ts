import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import { prisma } from "./prisma";
import { env } from "./env";

const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (data: any) => {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || "",
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name || "",
        image: user.image,
      };
    },
  } as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/feed",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For Google OAuth, update the user name to use given_name + family_name
      if (account?.provider === "google" && profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firstName = (profile as any).given_name || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastName = (profile as any).family_name || "";
        user.name = `${firstName} ${lastName}`.trim();
      }

      // For GitHub OAuth, use the display name
      if (account?.provider === "github" && profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user.name = (profile as any).name || user.name;
      }

      return true;
    },
  },
  events: {
    async signIn() {
      // Optional: Add any post sign-in logic here
    },
  },
};

export { authOptions };
