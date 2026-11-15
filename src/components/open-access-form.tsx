import { Label } from "@/components/ui/label";

/**
 * Zero-JS enter form: native POST → cookie + redirect to /app.
 * Works even if client hydration or event handlers fail.
 */
export function OpenAccessForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <form
      action="/api/session/enter"
      method="post"
      className="relative z-20 space-y-3"
    >
      {!compact ? (
        <div>
          <div className="text-xs tracking-[0.18em] text-emerald-700 uppercase">
            Open Limited product
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            No invite. Everyone can enter. Cascade-Verify runs free-tier models small-first so
            easy chats burn less usage than always calling a large model.
          </p>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="display-name">Display name (optional)</Label>
        <input
          id="display-name"
          name="displayName"
          type="text"
          placeholder="Free gardener"
          autoComplete="nickname"
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-emerald-800 px-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-700"
      >
        Enter Limited free
      </button>
    </form>
  );
}
