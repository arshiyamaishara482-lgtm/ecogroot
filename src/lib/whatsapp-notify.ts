/**
 * Notify Eco AI ops on WhatsApp when someone joins the waiting list.
 * The phone number is set in src/lib/contact.ts
 *
 * Auto-send options (optional env):
 * - CALLMEBOT_APIKEY — https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * - TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM
 * - WHATSAPP_WEBHOOK_URL — POST JSON { phone, text }
 *
 * Always returns a wa.me link so the browser can open a prefilled chat
 * to that number (works without API keys when the submitter confirms send).
 */

import {
  WAITLIST_WHATSAPP_PHONE_E164,
  WAITLIST_WHATSAPP_PHONE_LOCAL,
} from "./contact";

export { WAITLIST_WHATSAPP_PHONE_E164, WAITLIST_WHATSAPP_PHONE_LOCAL };

export type WhatsAppNotifyResult = {
  sent: boolean;
  method: "callmebot" | "twilio" | "webhook" | "link-only";
  whatsappLink: string;
  error?: string;
};

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export function buildWaitlistWhatsAppText(details: {
  name: string;
  email: string;
  interest: string;
  note?: string;
  position: number;
}): string {
  const lines = [
    "Eco AI — Waiting list signup",
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Interest: ${details.interest}`,
    `Position: #${details.position}`,
  ];
  if (details.note?.trim()) lines.push(`Note: ${details.note.trim()}`);
  lines.push(`Time: ${new Date().toISOString()}`);
  return lines.join("\n");
}

export function buildWhatsAppLink(text: string): string {
  return `https://wa.me/${WAITLIST_WHATSAPP_PHONE_E164}?text=${encodeURIComponent(text)}`;
}

async function sendCallMeBot(text: string): Promise<boolean> {
  const key = env("CALLMEBOT_APIKEY");
  if (!key) return false;
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", WAITLIST_WHATSAPP_PHONE_E164);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", key);
  const res = await fetch(url.toString(), { method: "GET" });
  return res.ok;
}

async function sendTwilio(text: string): Promise<boolean> {
  const sid = env("TWILIO_ACCOUNT_SID");
  const token = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_WHATSAPP_FROM"); // e.g. whatsapp:+14155238886
  if (!sid || !token || !from) return false;
  const to = `whatsapp:+${WAITLIST_WHATSAPP_PHONE_E164}`;
  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: text,
  });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );
  return res.ok;
}

async function sendWebhook(text: string): Promise<boolean> {
  const url = env("WHATSAPP_WEBHOOK_URL");
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: WAITLIST_WHATSAPP_PHONE_E164,
      phoneLocal: WAITLIST_WHATSAPP_PHONE_LOCAL,
      text,
      source: "eco-ai-waiting-list",
    }),
  });
  return res.ok;
}

export async function notifyWaitlistWhatsApp(details: {
  name: string;
  email: string;
  interest: string;
  note?: string;
  position: number;
}): Promise<WhatsAppNotifyResult> {
  const text = buildWaitlistWhatsAppText(details);
  const whatsappLink = buildWhatsAppLink(text);

  try {
    if (await sendCallMeBot(text)) {
      return { sent: true, method: "callmebot", whatsappLink };
    }
    if (await sendTwilio(text)) {
      return { sent: true, method: "twilio", whatsappLink };
    }
    if (await sendWebhook(text)) {
      return { sent: true, method: "webhook", whatsappLink };
    }
  } catch (err) {
    return {
      sent: false,
      method: "link-only",
      whatsappLink,
      error: err instanceof Error ? err.message : "WhatsApp notify failed",
    };
  }

  return { sent: false, method: "link-only", whatsappLink };
}
