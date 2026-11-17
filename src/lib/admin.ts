import type { User } from "./types";

/**
 * Who may open the Activity log?
 *  - Set ADMIN_EMAILS="you@example.com,other@example.com" (comma separated).
 *  - While developing locally (npm run dev) with ADMIN_EMAILS unset, every
 *    logged-in user is treated as admin so you can try it out.
 *  - In production with ADMIN_EMAILS unset, nobody is admin (safe default).
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return process.env.NODE_ENV !== "production";
  return Boolean(user.email) && list.includes(user.email!.toLowerCase());
}
