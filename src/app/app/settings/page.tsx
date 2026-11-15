"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type KeyStatus = {
  groq: boolean;
  gemini: boolean;
  openrouter: boolean;
  cerebras: boolean;
  huggingface: boolean;
  nvidia: boolean;
  github: boolean;
  sambanova: boolean;
  cohere: boolean;
  stack: string[];
};

const FIELDS = [
  { id: "groq", label: "Groq", placeholder: "gsk_…", hint: "console.groq.com" },
  {
    id: "gemini",
    label: "Google Gemini",
    placeholder: "AIza…",
    hint: "aistudio.google.com",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    placeholder: "sk-or-…",
    hint: "openrouter.ai/keys — use :free models",
  },
  {
    id: "cerebras",
    label: "Cerebras",
    placeholder: "csk_…",
    hint: "cloud.cerebras.ai",
  },
  {
    id: "huggingface",
    label: "Hugging Face",
    placeholder: "hf_…",
    hint: "huggingface.co/settings/tokens",
  },
  {
    id: "nvidia",
    label: "NVIDIA NIM",
    placeholder: "nvapi-…",
    hint: "build.nvidia.com",
  },
  {
    id: "github",
    label: "GitHub Models",
    placeholder: "ghp_…",
    hint: "GitHub PAT with models access",
  },
  {
    id: "sambanova",
    label: "SambaNova",
    placeholder: "…",
    hint: "cloud.sambanova.ai",
  },
  {
    id: "cohere",
    label: "Cohere",
    placeholder: "…",
    hint: "dashboard.cohere.com",
  },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<FieldId, string>>({
    groq: "",
    gemini: "",
    openrouter: "",
    cerebras: "",
    huggingface: "",
    nvidia: "",
    github: "",
    sambanova: "",
    cohere: "",
  });
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/settings");
    const json = (await res.json()) as {
      keys?: KeyStatus;
      notice?: string;
      error?: string;
    };
    if (!res.ok) {
      setError(json.error ?? "Could not load settings");
      return;
    }
    setStatus(json.keys ?? null);
    setNotice(json.notice ?? null);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as {
        keys?: KeyStatus;
        notice?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setStatus(json.keys ?? null);
      setNotice(json.notice ?? "Saved");
      setValues({
        groq: "",
        gemini: "",
        openrouter: "",
        cerebras: "",
        huggingface: "",
        nvidia: "",
        github: "",
        sambanova: "",
        cohere: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function clearKeys() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      const json = (await res.json()) as { keys?: KeyStatus; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Clear failed");
      setStatus(json.keys ?? null);
      setNotice("Cleared personal keys. Keyless providers still work.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Free model keys</h1>
        <p className="text-sm text-muted-foreground">
          Chat already races keyless open models (Kilo, LLM7, OVH) like Cursor Auto. Paste
          official free-tier keys only if you want more models and higher limits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active free stack</CardTitle>
          <CardDescription>
            Small free model first → Judgy scores the answer → large free model only on fail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(status?.stack ?? ["Loading…"]).map((row) => (
              <li key={row}>· {row}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {FIELDS.map((field) => (
              <span key={field.id} className="rounded-md bg-muted px-2 py-1">
                {field.label} {status?.[field.id] ? "saved" : "not set"}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add official free API keys</CardTitle>
          <CardDescription>
            All of these have free tiers. Leave blank to keep using keyless providers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            {FIELDS.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.id}>
                  {field.label}{" "}
                  <span className="font-normal text-muted-foreground">({field.hint})</span>
                </Label>
                <Input
                  id={field.id}
                  type="password"
                  autoComplete="off"
                  value={values[field.id]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                  placeholder={
                    status?.[field.id]
                      ? "•••• saved — paste to replace"
                      : field.placeholder
                  }
                />
              </div>
            ))}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save free keys"}
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={clearKeys}>
                Clear saved keys
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
