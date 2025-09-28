import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async data => {
      // Extract first and last name from the name field
      const nameParts = data.name?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName,
          lastName,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image: user.image,
      };
    },
  } as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For Google OAuth, update the user name to use given_name + family_name
      if (account?.provider === "google" && profile) {
        const firstName = profile.given_name || "";
        const lastName = profile.family_name || "";
        user.name = `${firstName} ${lastName}`.trim();
      }

      // For GitHub OAuth, GitHub doesn't provide separate first/last names
      // We'll extract from the display name in the adapter
      if (account?.provider === "github" && profile) {
        user.name = profile.name || user.name;
      }

      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Optional: Add any post sign-in logic here
    },
  },
};
