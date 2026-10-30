"use client";

// Client-side audit state for the demo flow, kept in localStorage.
// AI output (masks, findings) is stored as returned. Every human decision
// is stored separately, so nothing the AI emits can approve or close itself.

import { useSyncExternalStore } from "react";

import { appendEntry, type LedgerEntry, type LedgerFields } from "./ledger";
import type { Finding, HumanStatus, SamMask, VerifyResult } from "./types";

export interface HumanAction {
  status: HumanStatus;
  assignee: string;
  deadline: string;
  history: { at: string; event: string; actor?: string }[];
}

export type FindingState = "open" | "closed" | "reopened";

export interface AuditState {
  uploadedFiles: string[];
  auditRunAt: string | null;
  masks: SamMask[] | null;
  findings: Finding[] | null;
  actions: Record<string, HumanAction>;
  verifications: Record<string, VerifyResult[]>;
  findingState: Record<string, FindingState>;
  /** Change-propagation teaser: the what-if spec change last applied. */
  specChange: { from: string; to: string; at: string } | null;
  /** Hash-linked trail of the demo's events (ledger teaser, mock data). */
  ledger: LedgerEntry[];
}

const KEY = "crosssight.audit.v1";

const EMPTY: AuditState = {
  uploadedFiles: [],
  auditRunAt: null,
  masks: null,
  findings: null,
  actions: {},
  verifications: {},
  findingState: {},
  specChange: null,
  ledger: [],
};

/** Returns the state with one more ledger entry linked to the previous one. */
export function addLedger(s: AuditState, f: LedgerFields): AuditState {
  return { ...s, ledger: appendEntry(s.ledger ?? [], f) };
}

let state: AuditState = typeof window === "undefined" ? EMPTY : load();
const listeners = new Set<() => void>();

function load(): AuditState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAudit(): AuditState {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export function updateAudit(fn: (s: AuditState) => AuditState) {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: state still lives for this tab
  }
  listeners.forEach((l) => l());
}

export function resetAudit() {
  updateAudit(() => EMPTY);
}

export function humanAction(s: AuditState, id: string): HumanAction {
  return s.actions[id] ?? { status: "Awaiting human approval", assignee: "", deadline: "", history: [] };
}

/**
 * Records a decision on an action packet. An `event` also lands in the ledger,
 * by a human reviewer unless `actor` says otherwise.
 */
export function recordAction(id: string, patch: Partial<HumanAction>, event?: string, actor = "Human reviewer") {
  updateAudit((s) => {
    const cur = humanAction(s, id);
    const at = new Date().toISOString();
    const history = event ? [...cur.history, { at, event, actor }] : cur.history;
    const next = { ...s, actions: { ...s.actions, [id]: { ...cur, ...patch, history } } };
    return event ? addLedger(next, { at, actor, action: event, finding_id: id }) : next;
  });
}
