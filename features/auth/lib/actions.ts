"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  createPasswordResetToken,
  deleteSession,
  clearSessionCookie,
} from "../../../lib/auth";
import {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  type LoginFormData,
  type SignupFormData,
  type PasswordResetFormData,
} from "../schemas";
import { User } from "next-auth";

export const loginAction = async (formData: LoginFormData) => {
  try {
    const validatedData = loginSchema.parse(formData);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    );
    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Create session
    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Authentication failed. Please try again." };
  }
};

export const signupAction = async (formData: SignupFormData) => {
  let user: User | null = null;

  try {
    const validatedData = signupSchema.parse(formData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    user = await prisma.user.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: hashedPassword,
      },
    });

    // TODO: Send verification email
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Account creation failed. Please try again." };
  } finally {
    if (user) {
      redirect("/login?message=Account created successfully. Please log in.");
    }
  }
};

export const passwordResetAction = async (formData: PasswordResetFormData) => {
  try {
    const validatedData = passwordResetSchema.parse(formData);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success message for security (don't reveal if email exists)
    if (user) {
      // Generate and store reset token
      const resetToken = await createPasswordResetToken(user.id);

      // TODO: Send password reset email with resetToken
      console.log("Password reset token for", user.email, ":", resetToken);
    }

    return {
      success: true,
      message:
        "If an account with that email exists, you will receive a password reset link.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Password reset failed. Please try again." };
  }
};

export const logoutAction = async () => {
  try {
    // Clear custom session (for email/password users)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      await deleteSession(sessionToken);
      await clearSessionCookie();
    }

    // Clear NextAuth cookies (for OAuth users)
    const nextAuthCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
    ];

    for (const cookieName of nextAuthCookies) {
      cookieStore.delete(cookieName);
    }

    redirect("/login");
  } catch (error) {
    console.error("Logout error:", error);
    redirect("/login");
  }
};
