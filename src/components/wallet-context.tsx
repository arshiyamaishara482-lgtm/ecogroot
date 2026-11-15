"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { PublicSnapshot } from "@/lib/types";

type WalletContextValue = {
  snapshot: PublicSnapshot;
  setSnapshot: (next: PublicSnapshot) => void;
  mergeSnapshot: (partial: Partial<PublicSnapshot>) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({
  initial,
  children,
}: {
  initial: PublicSnapshot;
  children: ReactNode;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const mergeSnapshot = useCallback((partial: Partial<PublicSnapshot>) => {
    setSnapshot((prev) => ({ ...prev, ...partial }));
  }, []);
  return (
    <WalletContext.Provider value={{ snapshot, setSnapshot, mergeSnapshot }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
