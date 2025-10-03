import { randomBytes, createHmac, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "default-csrf-secret-change-in-production";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a stateless CSRF token with HMAC signature and timestamp
 * Format: {randomValue}.{timestamp}.{signature}
 * @returns The CSRF token string
 */
export const generateCsrfToken = (): string => {
  const randomValue = randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", CSRF_SECRET)
    .update(`${randomValue}.${timestamp}`)
    .digest("hex");

  return `${randomValue}.${timestamp}.${signature}`;
};

/**
 * Validate a CSRF token's signature and expiration
 * @param token The token to validate
 * @returns True if valid and not expired, false otherwise
 */
export const validateCsrfToken = (token: string | null | undefined): boolean => {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [randomValue, timestamp, signature] = parts;

  // Verify signature using timing-safe comparison
  const expectedSignature = createHmac("sha256", CSRF_SECRET)
    .update(`${randomValue}.${timestamp}`)
    .digest("hex");

  const signaturesMatch = cryptoTimingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!signaturesMatch) {
    return false;
  }

  // Check if token is expired
  const tokenTime = parseInt(timestamp, 10);
  const now = Date.now();

  if (isNaN(tokenTime) || now - tokenTime > TOKEN_EXPIRY_MS) {
    return false;
  }

  return true;
};
