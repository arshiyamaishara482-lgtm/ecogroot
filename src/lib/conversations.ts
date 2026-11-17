import type { ChatMessage } from "./types";

/** Messages saved before "New chat" existed have no id - they form one old chat. */
export const LEGACY_ID = "legacy";
/** Id used for the very first chat of an account that has no chats yet. */
export const FIRST_CHAT_ID = "conv_start";

export type ConversationRow = {
  id: string;
  title: string;
  count: number;
  lastAt: string;
  /** tokens (in + out) spent in this chat */
  tokens: number;
};

export function convoOf(m: ChatMessage): string {
  return m.conversationId ?? LEGACY_ID;
}

export function newConversationId(): string {
  return `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Group saved messages into chats, newest first. Title = first question. */
export function buildConversations(chats: ChatMessage[]): ConversationRow[] {
  const map = new Map<string, ConversationRow>();
  for (const m of chats) {
    const id = convoOf(m);
    const row = map.get(id) ?? { id, title: "", count: 0, lastAt: m.createdAt, tokens: 0 };
    if (m.role === "user") {
      row.count += 1;
      if (!row.title) row.title = m.content;
    }
    if (m.cascade) row.tokens += m.cascade.impact.tokensIn + m.cascade.impact.tokensOut;
    row.lastAt = m.createdAt;
    map.set(id, row);
  }
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
