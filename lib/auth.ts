import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_SECRET = process.env.SESSION_SECRET!;

if (!JWT_SECRET || !SESSION_SECRET) {
  throw new Error(
    "Missing required environment variables: JWT_SECRET, SESSION_SECRET"
  );
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT utilities
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): object | null => {
  try {
    const result = jwt.verify(token, JWT_SECRET);
    return typeof result === 'object' ? result : null;
  } catch {
    return null;
  }
};

// Session management
export const createSession = async (userId: string): Promise<string> => {
  const token = generateToken({ userId });
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: {
      userId,
      sessionToken: token,
      expires,
    },
  });

  return token;
};

export const getSessionFromToken = async (token: string) => {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export const deleteSession = async (token: string): Promise<void> => {
  try {
    await prisma.session.delete({ where: { sessionToken: token } });
  } catch {
    // Session might not exist, ignore error
  }
};

// Cookie utilities
export const setSessionCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
};

export const getSessionFromCookie = async () => {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    return getSessionFromToken(sessionToken);
  } catch {
    return null;
  }
};

export const clearSessionCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
};

// Current user helper
export const getCurrentUser = async () => {
  // First check NextAuth session (for OAuth users)
  const nextAuthSession = await getServerSession(authOptions);

  if (nextAuthSession?.user) {
    // If NextAuth session exists, get user from database using the email
    const user = await prisma.user.findUnique({
      where: { email: nextAuthSession.user.email! },
    });
    return user;
  }

  // Fallback to custom session (for email/password users)
  const customSession = await getSessionFromCookie();
  return customSession?.user ?? null;
};

// Password reset utilities
export const generatePasswordResetToken = (): string => {
  return jwt.sign(
    { type: "password_reset", timestamp: Date.now() },
    SESSION_SECRET,
    { expiresIn: "1h" }
  );
};

export const createPasswordResetToken = async (
  userId: string
): Promise<string> => {
  const token = generatePasswordResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate existing tokens
  await prisma.passwordReset.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
};

export const verifyPasswordResetToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as { type: string; timestamp: number; iat: number; exp: number; };
    if (decoded.type !== "password_reset") {
      return null;
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.expiresAt < new Date()
    ) {
      return null;
    }

    return resetRecord;
  } catch {
    return null;
  }
};

export const usePasswordResetToken = async (token: string): Promise<void> => {
  await prisma.passwordReset.updateMany({
    where: { token },
    data: { used: true },
  });
};
