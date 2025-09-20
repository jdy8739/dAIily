"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  createPasswordResetToken,
} from "../../../lib/auth";
import {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  type LoginFormData,
  type SignupFormData,
  type PasswordResetFormData,
} from "../schemas";

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

    redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Authentication failed. Please try again." };
  }
};

export const signupAction = async (formData: SignupFormData) => {
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
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: hashedPassword,
      },
    });

    // TODO: Send verification email

    redirect("/login?message=Account created successfully. Please log in.");
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Account creation failed. Please try again." };
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
