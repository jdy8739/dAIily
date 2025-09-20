import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if user exists, if not create
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            let firstName = "";
            let lastName = "";

            if (account.provider === "google") {
              // Extract first and last name from Google profile
              firstName = profile?.given_name || user.name?.split(" ")[0] || "";
              lastName = profile?.family_name || user.name?.split(" ").slice(1).join(" ") || "";
            } else if (account.provider === "github") {
              // GitHub doesn't provide separate first/last names, extract from display name
              const nameParts = user.name?.split(" ") || [];
              firstName = nameParts[0] || "";
              lastName = nameParts.slice(1).join(" ") || "";
            }

            await prisma.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                image: user.image,
                emailVerified: new Date(),
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("User signed in:", { user: user.email, account: account?.provider, isNewUser });
    },
  },
};