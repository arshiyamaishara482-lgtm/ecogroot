import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { WalletProvider } from "@/components/wallet-context";
import { getSessionUser, getSnapshot } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SignedInLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const snapshot = await getSnapshot(user);

  return (
    <WalletProvider initial={snapshot}>
      <AppShell>{children}</AppShell>
    </WalletProvider>
  );
}
