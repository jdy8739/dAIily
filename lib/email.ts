import { Resend } from "resend";
import { env } from "./env";
import { logger } from "./logger";

const resend = new Resend(env.RESEND_API_KEY);

const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName?: string | null
) => {
  const resetUrl = `${env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  const { data, error } = await resend.emails.send({
    from: "dAIily <onboarding@resend.dev>",
    to: email,
    subject: "Reset Your Password - dAIily",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${userName || "there"},</h2>
        <p>You requested to reset your password for your dAIily account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    logger.error({ err: error, email }, "Failed to send password reset email");
    throw new Error("Failed to send password reset email");
  }

  return data;
};

export { sendPasswordResetEmail };
