import { MetadataRoute } from "next";
import { env } from "@/lib/env";

const robots = (): MetadataRoute.Robots => {
  const baseUrl = env.NEXTAUTH_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/feed", "/story"],
        disallow: [
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/resend-verification",
          "/drafts",
          "/write",
          "/api",
          "/profile",
          "*/edit",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
};

export default robots;
