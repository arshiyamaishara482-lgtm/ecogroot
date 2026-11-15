"use client";

import { OpenAccessForm } from "@/components/open-access-form";

/** Legacy name — Limited product is open to everyone. */
export function EarlyAccessForm({ compact = false }: { compact?: boolean }) {
  return <OpenAccessForm compact={compact} />;
}
