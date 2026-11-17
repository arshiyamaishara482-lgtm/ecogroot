"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth-rules";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

/** Sign up / Log in card body. Used on /login and /open. */
export function AuthForm({
  initialMode = "login",
  compact = false,
}: {
  initialMode?: Mode;
  compact?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (mode === "signup") {
      if (!name.trim()) return setError("Please enter your name.");
      if (!email.trim()) return setError("Please enter an email.");
      if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        return setError(
          `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters long.`,
        );
      }
    } else if (!email.trim() || !password) {
      return setError("Please enter your email and password.");
    }

    setBusy(true);
    try {
      const res = await fetch(
        mode === "signup" ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "signup"
              ? { name, email, phone, password }
              : { email, password },
          ),
        },
      );
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Something went wrong.");
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const tab = (id: Mode, label: string) => (
    <button
      type="button"
      onClick={() => switchMode(id)}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition",
        mode === id
          ? "bg-emerald-700 text-white"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={submit} className="relative z-20 space-y-3">
      <div className="flex rounded-lg border border-foreground/10 p-0.5">
        {tab("login", "Log in")}
        {tab("signup", "Sign up")}
      </div>

      {!compact ? (
        <p className="text-sm text-muted-foreground">
          {mode === "signup"
            ? "Create a free account. Your email does not need to be a real address."
            : "Welcome back. Log in with your email and password."}
        </p>
      ) : null}

      {mode === "signup" ? (
        <div className="space-y-1.5">
          <Label htmlFor="auth-name">Name</Label>
          <Input
            id="auth-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={60}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="username"
          maxLength={120}
        />
      </div>

      {mode === "signup" ? (
        <div className="space-y-1.5">
          <Label htmlFor="auth-phone">Phone number (optional)</Label>
          <Input
            id="auth-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            maxLength={30}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="auth-password">
          Password{mode === "signup" ? ` (${PASSWORD_MIN}-${PASSWORD_MAX} characters)` : ""}
        </Label>
        <Input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          maxLength={mode === "signup" ? PASSWORD_MAX : 100}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy} className="h-10 w-full bg-emerald-800 text-emerald-50 hover:bg-emerald-700">
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  );
}
