import { validateCsrfToken } from "./csrf";

/**
 * Validates a CSRF token in Server Actions
 * @param token The CSRF token to validate
 * @returns True if the token is valid, false otherwise
 */
export const validateCsrf = (token: string | null | undefined): boolean => {
  return validateCsrfToken(token);
};
