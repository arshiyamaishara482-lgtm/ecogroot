import type { User } from "./types";

/**
 * Only the emails listed in ADMIN_EMAILS can open the Activity log.
 *
 *   ADMIN_EMAILS=you@example.com,other@example.com   (comma separated)
 *
 * Set it in .env.local when running on your computer, and in Netlify's
 * Environment variables when running online. If it is empty, NOBODY is an
 * admin - there is no "everyone is admin while developing" shortcut anymore.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}
