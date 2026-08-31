import { INITIAL_SLOTS, SLOT_STORAGE_KEY, SLOTS_URL } from "../constants";

export const getSlotsRemaining = () => {
  try {
    const stored = localStorage.getItem(SLOT_STORAGE_KEY);
    if (stored === null) {
      localStorage.setItem(SLOT_STORAGE_KEY, String(INITIAL_SLOTS));
      return INITIAL_SLOTS;
    }
    const parsed = Number.parseInt(stored, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : INITIAL_SLOTS;
  } catch {
    return INITIAL_SLOTS;
  }
};

export const decrementSlot = () => {
  const current = getSlotsRemaining();
  const next = Math.max(0, current - 1);
  try {
    localStorage.setItem(SLOT_STORAGE_KEY, String(next));
  } catch {
    // Some private browsing modes block localStorage; the UI still proceeds.
  }
  return next;
};

export const fetchSlotsRemaining = async () => {
  try {
    const response = await fetch(SLOTS_URL, { method: "GET" });
    if (!response.ok) throw new Error(`Slot endpoint returned ${response.status}`);
    const data = await response.json();
    const slots = Number.parseInt(data.slots_remaining, 10);
    if (!Number.isFinite(slots)) throw new Error("Invalid slot count");
    localStorage.setItem(SLOT_STORAGE_KEY, String(Math.max(0, slots)));
    return Math.max(0, slots);
  } catch {
    return getSlotsRemaining();
  }
};

export const decrementRemoteSlot = async () => {
  try {
    const response = await fetch(`${SLOTS_URL}/decrement`, { method: "POST" });
    if (!response.ok) throw new Error(`Slot endpoint returned ${response.status}`);
    const data = await response.json();
    const slots = Number.parseInt(data.slots_remaining, 10);
    if (!Number.isFinite(slots)) throw new Error("Invalid slot count");
    localStorage.setItem(SLOT_STORAGE_KEY, String(Math.max(0, slots)));
    return Math.max(0, slots);
  } catch {
    return decrementSlot();
  }
};

// TO RESET SLOT COUNT: open browser console and run:
// localStorage.setItem('abraham_slots_remaining', '20'); location.reload();
