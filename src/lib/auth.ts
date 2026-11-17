import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PASSWORD_MAX, PASSWORD_MIN } from "./auth-rules";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export type SignupInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

/** Returns an error message, or null when everything is fine. */
export function validateSignup(input: SignupInput): string | null {
  if (!input.name) return "Please enter your name.";
  if (input.name.length > 60) return "Name is too long (60 characters max).";
  // The email does NOT have to be a real address - it only has to be filled in.
  if (!input.email) return "Please enter an email.";
  if (input.email.length > 120) return "Email is too long (120 characters max).";
  if (input.phone.length > 30) return "Phone number is too long.";
  if (input.password.length < PASSWORD_MIN || input.password.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters long.`;
  }
  return null;
}
