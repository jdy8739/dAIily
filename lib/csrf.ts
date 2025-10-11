import {
  randomBytes,
  createHmac,
  timingSafeEqual as cryptoTimingSafeEqual,
} from "crypto";
import { env } from "./env";

const CSRF_SECRET = env.CSRF_SECRET;
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a stateless CSRF token with HMAC signature and timestamp
 * Format: {randomValue}.{timestamp}.{signature}
 * @returns The CSRF token string
 */
const generateCsrfToken = (): string => {
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
const validateCsrfToken = (token: string | null | undefined): boolean => {
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

  // Check lengths match before timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  try {
    const signaturesMatch = cryptoTimingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!signaturesMatch) {
      return false;
    }
  } catch {
    // Buffer length mismatch or other error
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

export { generateCsrfToken, validateCsrfToken };
