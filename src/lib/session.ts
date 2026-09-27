"use client";

import { useSyncExternalStore } from "react";

/**
 * Demo session. The site is a static export with no server, so the login
 * "mode" (PLAN.md §1.1) lives in localStorage and is read through a store
 * hook. The server snapshot is "pending" so gated pages never flash the
 * locked state during hydration.
 */
export type Mode = "spectator" | "participant";
export type SessionState = Mode | null | "pending";

const KEY = "microwar.mode";
const EVT = "microwar:session";

function read(): SessionState {
  try {
    const v = localStorage.getItem(KEY);
    return v === "spectator" || v === "participant" ? v : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, read, () => "pending");
}

export function login(mode: Mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* private mode: the session simply does not persist */
  }
  window.dispatchEvent(new Event(EVT));
}

export function logout() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVT));
}

/** Participants can see everything spectators can. */
export function allows(state: SessionState, requires: Mode) {
  return state === "participant" || (requires === "spectator" && state === "spectator");
}
