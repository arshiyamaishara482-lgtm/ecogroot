import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { LeafMark } from "@/components/leaf-mark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUILDING_PHASE } from "@/lib/constants";
import { describeFreeStack } from "@/lib/free-models";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
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
              <CardTitle>Eco Groot account</CardTitle>
              <p className="text-xs text-muted-foreground">{BUILDING_PHASE}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm initialMode={mode === "signup" ? "signup" : "login"} />
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
