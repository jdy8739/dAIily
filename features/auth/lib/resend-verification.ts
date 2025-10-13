"use server";

import { prisma } from "../../../lib/prisma";
import { createEmailVerificationToken } from "../../../lib/auth";
import { sendVerificationEmail } from "../../../lib/email";
import { logger } from "../../../lib/logger";

const resendVerificationEmail = async (
  email: string
): Promise<{ success: true; message: string } | { success: false; error: string }> => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, don't reveal if user exists or is already verified
    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists and is unverified, you will receive a verification link.",
      };
    }

    // Check if user is already verified
    if (user.verified) {
      return {
        success: false,
        error: "This email is already verified. You can log in now.",
      };
    }

    // Check if user is an OAuth user (no password)
    if (!user.password) {
      return {
        success: false,
        error: "This account uses OAuth sign-in and doesn't require email verification.",
      };
    }

    // Generate and send new verification email
    const verificationToken = await createEmailVerificationToken(user.email);
    await sendVerificationEmail(user.email, verificationToken, user.name);

    logger.info({ email: user.email }, "Verification email resent");

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    logger.error({ err: error, email }, "Failed to resend verification email");
    return {
      success: false,
      error: "Failed to send verification email. Please try again later.",
    };
  }
};

export { resendVerificationEmail };
