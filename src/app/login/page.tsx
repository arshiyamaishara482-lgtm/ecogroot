import Link from "next/link";
import { OpenAccessForm } from "@/components/open-access-form";
import { LeafMark } from "@/components/leaf-mark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUILDING_PHASE } from "@/lib/constants";
import { describeFreeStack } from "@/lib/free-models";

export default function LoginPage() {
  const stack = describeFreeStack();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 canopy-gradient opacity-95" />
      <div className="pointer-events-none absolute inset-0 leaf-haze opacity-50" />
      <Card className="relative w-full max-w-md border-emerald-200/30 bg-white/95 shadow-2xl">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <LeafMark className="size-8" />
            <div>
              <CardTitle>Open Limited free</CardTitle>
              <p className="text-xs text-muted-foreground">{BUILDING_PHASE}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The limited product is open to everyone. Cascade-Verify uses free model APIs
            (small first → judge → large only if needed) so you get more chats from the same free
            budget than general always-large usage.
          </p>
          <OpenAccessForm />
          <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900/80">
            <div className="font-medium">Free model stack</div>
            <ul className="mt-1 space-y-0.5">
              {stack.map((row) => (
                <li key={row}>· {row}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            Prefer early access notes? Join the{" "}
            <Link href="/waiting-list" className="underline underline-offset-3">
              waiting list
            </Link>
            .{" "}
            <Link href="/" className="underline underline-offset-3">
              Back home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
