import {
  BUILDING_PHASE,
  EARLY_ACCESS_CAP,
  FOUNDING_INVITE_CODE,
  PLAN_CREDITS,
} from "./constants";
import { newId, withStore } from "./store";
import type {
  InviteRecord,
  WaitlistEntry,
  WaitlistInterest,
  WaitlistStats,
} from "./types";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

function ensureFoundingInvite(invites: Record<string, InviteRecord>) {
  const code = FOUNDING_INVITE_CODE;
  if (!invites[code]) {
    invites[code] = {
      code,
      kind: "founding",
      label: "Founding canopy invite",
      maxUses: 500,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function getWaitlistStats(): Promise<WaitlistStats> {
  return withStore((store) => {
    ensureFoundingInvite(store.invites);
    const invited = store.waitlist.filter((w) => w.status !== "queued").length;
    return {
      total: store.waitlist.length,
      invited,
      remainingEarlySlots: Math.max(0, EARLY_ACCESS_CAP - invited),
      earlyAccessCap: EARLY_ACCESS_CAP,
      buildingPhase: BUILDING_PHASE,
    };
  }, true);
}

export async function joinWaitlist(input: {
  email: string;
  name: string;
  interest: WaitlistInterest;
  note?: string;
}): Promise<{
  entry: WaitlistEntry;
  created: boolean;
  stats: WaitlistStats;
}> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || "Canopy friend";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email.");
  }

  return withStore((store) => {
    ensureFoundingInvite(store.invites);
    const existing = store.waitlist.find((w) => w.email === email);
    if (existing) {
      const invited = store.waitlist.filter((w) => w.status !== "queued").length;
      return {
        entry: existing,
        created: false,
        stats: {
          total: store.waitlist.length,
          invited,
          remainingEarlySlots: Math.max(0, EARLY_ACCESS_CAP - invited),
          earlyAccessCap: EARLY_ACCESS_CAP,
          buildingPhase: BUILDING_PHASE,
        },
      };
    }

    const invitedSoFar = store.waitlist.filter((w) => w.status !== "queued").length;
    const grantInvite = invitedSoFar < EARLY_ACCESS_CAP;
    const position = store.waitlist.length + 1;
    const inviteCode = grantInvite
      ? `LEAF-${position.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      : null;

    const entry: WaitlistEntry = {
      id: newId("wait"),
      email,
      name,
      interest: input.interest,
      note: (input.note ?? "").trim().slice(0, 500),
      position,
      status: grantInvite ? "invited" : "queued",
      inviteCode,
      createdAt: new Date().toISOString(),
    };

    if (inviteCode) {
      store.invites[inviteCode] = {
        code: inviteCode,
        kind: "waitlist",
        label: `Early access for ${name}`,
        maxUses: 1,
        usedCount: 0,
        createdAt: entry.createdAt,
        waitlistId: entry.id,
      };
    }

    store.waitlist.push(entry);
    const invited = store.waitlist.filter((w) => w.status !== "queued").length;
    return {
      entry,
      created: true,
      stats: {
        total: store.waitlist.length,
        invited,
        remainingEarlySlots: Math.max(0, EARLY_ACCESS_CAP - invited),
        earlyAccessCap: EARLY_ACCESS_CAP,
        buildingPhase: BUILDING_PHASE,
      },
    };
  }, true);
}

export async function consumeInviteCode(rawCode: string): Promise<{
  code: string;
  kind: InviteRecord["kind"];
  label: string;
}> {
  const code = normalizeCode(rawCode);
  if (!code) throw new Error("Invite code required.");

  return withStore((store) => {
    ensureFoundingInvite(store.invites);
    const invite = store.invites[code];
    if (!invite) {
      throw new Error("Unknown invite code. Join the waitlist for limited early access.");
    }
    if (invite.usedCount >= invite.maxUses) {
      throw new Error("This invite code has already been fully used.");
    }
    invite.usedCount += 1;
    if (invite.waitlistId) {
      const entry = store.waitlist.find((w) => w.id === invite.waitlistId);
      if (entry) entry.status = "activated";
    }
    return { code: invite.code, kind: invite.kind, label: invite.label };
  }, true);
}

export function earlyWalletCredits(): number {
  return PLAN_CREDITS.free;
}
