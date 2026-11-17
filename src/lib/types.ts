import type { FreeModelSource, UserApiKeys } from "./free-models";

export type PlanId = "free" | "pro" | "master";

export type User = {
  id: string;
  displayName: string;
  plan: PlanId;
  credits: number;
  chatsTotal: number;
  cheapPathCount: number;
  createdAt: string;
  inviteCode?: string;
  accessTier?: "early" | "founding";
  /** Sign-up details (the password is NOT here - see Account). */
  email?: string;
  phone?: string;
  /** Running total of tokens (in + out) this user has spent on questions. */
  tokensUsed?: number;
};

/** Private login data. Kept apart from User so it is never sent to the browser. */
export type Account = {
  userId: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

export type ActivityType =
  | "signup"
  | "login"
  | "login_failed"
  | "logout"
  | "question";

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  at: string;
  userId: string | null;
  name: string;
  email: string;
  phone?: string;
  /** question events only */
  question?: string;
  tokensIn?: number;
  tokensOut?: number;
  tokensTotal?: number;
  /** this user's running token total AFTER this question */
  userTokensTotal?: number;
  creditsDebited?: number;
  creditsLeft?: number;
  path?: "cheap" | "escalated";
  model?: string;
};

export type MemoryNote = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  source: "manual" | "answer";
  createdAt: string;
};

export type CascadeStage = "hint" | "small" | "judge" | "large";

export type CascadeStep = {
  stage: CascadeStage;
  label: string;
  output: string;
  verdict?: "pass" | "fail";
  reason?: string;
  skipped?: boolean;
  score?: number;
};

export type ImpactEstimate = {
  tokensIn: number;
  tokensOut: number;
  costUsdEstimate: number;
  energyKwhEstimate: number;
  co2gEstimate: number;
  waterMlEstimate: number;
  note: string;
};

export type CascadeResult = {
  usedCheapPath: boolean;
  escalated: boolean;
  ecoSkill: boolean;
  /** Ultra Eco = cascade + honey; Eco-Cascade = cascade only */
  mode?: "ultra-eco" | "eco-cascade";
  creditsDebited: number;
  creditCostBeforeEco: number;
  modelSource: FreeModelSource;
  difficulty?: "easy" | "medium" | "hard";
  steps: CascadeStep[];
  impact: ImpactEstimate;
  finalAnswer: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  cascade?: CascadeResult;
  /** Which conversation (chat thread) this message belongs to. Old messages have none. */
  conversationId?: string;
};

export type VideoTier = "eco" | "premium";

export type VideoJob = {
  id: string;
  prompt: string;
  tier: VideoTier;
  status: "ready";
  renderer: "placeholder-stub";
  resolution: string;
  durationSec: number;
  creditsDebited: number;
  createdAt: string;
};

export type WaitlistInterest =
  | "creator"
  | "developer"
  | "researcher"
  | "team"
  | "curious";

export type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  interest: WaitlistInterest;
  note: string;
  position: number;
  status: "queued" | "invited" | "activated";
  inviteCode: string | null;
  createdAt: string;
};

export type InviteRecord = {
  code: string;
  kind: "founding" | "waitlist" | "press";
  label: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
  waitlistId?: string;
};

export type StoreFile = {
  users: Record<string, User>;
  accounts: Record<string, Account>;
  sessions: Record<string, string>;
  memories: Record<string, MemoryNote[]>;
  chats: Record<string, ChatMessage[]>;
  videos: Record<string, VideoJob[]>;
  waitlist: WaitlistEntry[];
  invites: Record<string, InviteRecord>;
  /** Per-user optional free-tier API keys (settings page). */
  apiKeys: Record<string, UserApiKeys>;
  /** Sign-ups, log-ins and questions, newest last. Capped in lib/activity.ts. */
  activity: ActivityEvent[];
};

export type PublicSnapshot = {
  user: User;
  cascadeSaveRate: number | null;
  memories: MemoryNote[];
  chats: ChatMessage[];
  videos: VideoJob[];
  isAdmin?: boolean;
};

export type WaitlistStats = {
  total: number;
  invited: number;
  remainingEarlySlots: number;
  earlyAccessCap: number;
  buildingPhase: string;
};
