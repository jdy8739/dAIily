"use server";

import { generateCsrfToken } from "./csrf";

/**
 * Server action to generate a CSRF token
 * This is called from the client to get a fresh token
 * @returns The CSRF token string
 */
const getNewCsrfToken = async (): Promise<string> => {
  return generateCsrfToken();
};

export { getNewCsrfToken };
