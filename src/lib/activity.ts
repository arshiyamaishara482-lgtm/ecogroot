import { newId } from "./store";
import type { ActivityEvent, StoreFile } from "./types";

/** Keep the log (and the store file) from growing forever. */
const MAX_EVENTS = 1000;

/**
 * Append one event to the activity log. Call this INSIDE a withStore(..., true)
 * callback so the event is saved in the same write as the change it describes.
 */
export function pushActivity(
  store: StoreFile,
  event: Omit<ActivityEvent, "id" | "at">
): ActivityEvent {
  const full: ActivityEvent = {
    id: newId("act"),
    at: new Date().toISOString(),
    ...event,
  };
  store.activity.push(full);
  if (store.activity.length > MAX_EVENTS) {
    store.activity.splice(0, store.activity.length - MAX_EVENTS);
  }
  return full;
}
