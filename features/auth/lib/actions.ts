"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import { validateCsrf } from "../../../lib/csrf-middleware";
import { logger } from "../../../lib/logger";
import { env } from "../../../lib/env";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  createPasswordResetToken,
  deleteSession,
  clearSessionCookie,
  clearNextAuthCookies,
  createEmailVerificationToken,
} from "../../../lib/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../../lib/email";
import {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  newPasswordSchema,
  type LoginFormData,
  type SignupFormData,
  type PasswordResetFormData,
  type NewPasswordFormData,
} from "../schemas";
import { User } from "next-auth";

const loginAction = async (formData: LoginFormData & { csrfToken: string }) => {
  try {
    // Validate CSRF token
    const isValidCsrf = validateCsrf(formData.csrfToken);
    if (!isValidCsrf) {
      return {
        error: "Invalid CSRF token. Please refresh the page and try again.",
      };
    }

    const validatedData = loginSchema.parse(formData);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) {
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

    // Check if email is verified
    if (!user.verified) {
      return {
        error: "Please verify your email before logging in. Check your inbox for the verification link.",
        unverified: true
      };
    }

    // Create session
    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    return { success: true };
  } catch (error) {
    logger.error({ err: error }, "Login error");
    return { error: "Authentication failed. Please try again." };
  }
};

const signupAction = async (
  formData: SignupFormData & { csrfToken: string }
) => {
  let user: User | null = null;

  try {
    // Validate CSRF token
    const isValidCsrf = validateCsrf(formData.csrfToken);
    if (!isValidCsrf) {
      return {
        error: "Invalid CSRF token. Please refresh the page and try again.",
      };
    }

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
        name: validatedData.name,
        password: hashedPassword,
      },
    });

    // Generate and send verification email
    if (user.email) {
      try {
        const verificationToken = await createEmailVerificationToken(user.email);
        await sendVerificationEmail(user.email, verificationToken, user.name);
        // logger.info({ email: user.email }, "Verification email sent");
        console.log("Verification email sent to:", user.email);
      } catch (emailError) {
        // logger.error({ err: emailError, email: user.email }, "Failed to send verification email");
        console.error("Failed to send verification email:", emailError);
        // Don't fail signup if email fails - user can request resend later
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Signup error");
    return { error: "Account creation failed. Please try again." };
  } finally {
    if (user) {
      redirect("/login?message=Account created successfully. Please check your email to verify your account.");
    }
  }
};

const passwordResetAction = async (
  formData: PasswordResetFormData & { csrfToken: string }
) => {
  try {
    // Validate CSRF token
    const isValidCsrf = validateCsrf(formData.csrfToken);
    if (!isValidCsrf) {
      return {
        error: "Invalid CSRF token. Please refresh the page and try again.",
      };
    }

    const validatedData = passwordResetSchema.parse(formData);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success message for security (don't reveal if email exists)
    if (user) {
      // Check if user has a password (not an OAuth-only user)
      if (!user.password) {
        // OAuth user - return specific error
        return {
          error:
            "This account uses Google or GitHub sign-in. Please use the social login buttons on the login page.",
          oauth: true,
        };
      }

      // Generate and store reset token
      const resetToken = await createPasswordResetToken(user.id);

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.name);
      } catch (emailError) {
        logger.error({ err: emailError }, "Failed to send password reset email");
        // Don't throw error - still return success to avoid revealing email existence
      }
    }

    return {
      success: true,
      message:
        "If an account with that email exists, you will receive a password reset link.",
    };
  } catch (error) {
    logger.error({ err: error }, "Password reset error");
    return { error: "Password reset failed. Please try again." };
  }
};

const resetPasswordWithTokenAction = async (
  formData: NewPasswordFormData & { csrfToken: string }
) => {
  try {
    // Validate CSRF token
    const isValidCsrf = validateCsrf(formData.csrfToken);
    if (!isValidCsrf) {
      return {
        error: "Invalid CSRF token. Please refresh the page and try again.",
      };
    }

    const validatedData = newPasswordSchema.parse(formData);

    // Find the reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    });

    // Validate token
    if (!resetToken) {
      return { error: "Invalid or expired reset link." };
    }

    if (resetToken.used) {
      return { error: "This reset link has already been used." };
    }

    if (new Date() > resetToken.expiresAt) {
      return {
        error: "This reset link has expired. Please request a new one.",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return {
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    };
  } catch (error) {
    logger.error({ err: error }, "Password reset with token error");
    return { error: "Password reset failed. Please try again." };
  }
};

const logoutAction = async () => {
  const cookieStore = await cookies();

  try {
    // Clear custom session cookie (email/password users)
    const sessionToken = cookieStore.get("session")?.value;
    if (sessionToken) {
      await deleteSession(sessionToken);
    }
    await clearSessionCookie();
  } catch (error) {
    logger.error({ err: error }, "Logout error - failed to clear custom session");
  }

  try {
    // Clear all NextAuth cookies (OAuth users) - server-side for security
    await clearNextAuthCookies();
  } catch (error) {
    logger.error({ err: error }, "Logout error - failed to clear NextAuth cookies");
  }

  // redirect() throws NEXT_REDIRECT - must be outside try-catch
  redirect("/login");
};

export {
  loginAction,
  signupAction,
  passwordResetAction,
  resetPasswordWithTokenAction,
  logoutAction,
};
