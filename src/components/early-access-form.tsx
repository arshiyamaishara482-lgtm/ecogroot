"use client";

import { AuthForm } from "@/components/auth-form";

/** Legacy name — Limited product is open to everyone. */
export function EarlyAccessForm({ compact = false }: { compact?: boolean }) {
  return <AuthForm initialMode="signup" compact={compact} />;
}
