import { NextRequest, NextResponse } from "next/server";
import {
  verifyEmailVerificationToken,
  markEmailAsVerified,
} from "../../../../lib/auth";
import { logger } from "../../../../lib/logger";

export const POST = async (req: NextRequest) => {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const verificationRecord = await verifyEmailVerificationToken(token);

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Mark email as verified
    await markEmailAsVerified(verificationRecord.identifier);

    logger.info(
      { email: verificationRecord.identifier },
      "Email verified successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    logger.error({ err: error }, "Email verification error");
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
};
