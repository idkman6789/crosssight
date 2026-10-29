// Ledger teaser: a hash-linked audit trail of the demo's events.
//
// This only illustrates the idea of a tamper-evident log. The hash is a small
// non-cryptographic function, so this is NOT a real proof system and gives no
// legal or evidentiary guarantee.

export interface LedgerEntry {
  seq: number;
  at: string;
  actor: string;
  action: string;
  /** Finding the entry refers to, or "—" for pack-level events. */
  finding_id: string;
  prev_hash: string;
  hash: string;
}

export type LedgerFields = Pick<LedgerEntry, "actor" | "action" | "finding_id"> & { at?: string };

export const GENESIS_HASH = "0".repeat(14);

export const LEDGER_PLACEHOLDER = "Ledger placeholder — live entries will be recorded when the live audit runs.";

// cyrb53: a tiny, fast, non-cryptographic string hash.
function cyrb53(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function entryHash(prev: string, e: Omit<LedgerEntry, "prev_hash" | "hash">): string {
  return cyrb53(JSON.stringify([prev, e.seq, e.at, e.actor, e.action, e.finding_id])).toString(16).padStart(14, "0");
}

/** Appends one entry, linking it to the hash of the entry before it. */
export function appendEntry(entries: LedgerEntry[], f: LedgerFields): LedgerEntry[] {
  const prev = entries.at(-1)?.hash ?? GENESIS_HASH;
  const base = {
    seq: entries.length + 1,
    at: f.at ?? new Date().toISOString(),
    actor: f.actor,
    action: f.action,
    finding_id: f.finding_id,
  };
  return [...entries, { ...base, prev_hash: prev, hash: entryHash(prev, base) }];
}

/** Recomputes every link. Returns the first entry whose content or link no longer matches. */
export function checkChain(entries: LedgerEntry[]): { ok: boolean; brokenAt: number | null } {
  let prev = GENESIS_HASH;
  for (const e of entries) {
    if (e.prev_hash !== prev || e.hash !== entryHash(prev, e)) return { ok: false, brokenAt: e.seq };
    prev = e.hash;
  }
  return { ok: true, brokenAt: null };
}

export function shortHash(h: string): string {
  return `${h.slice(0, 8)}…`;
}

export function buildExport(entries: LedgerEntry[]) {
  return {
    label: "Fictional sample pack for demo only.",
    notice: LEDGER_PLACEHOLDER,
    hash_note:
      "Demo of the idea only: each entry's hash is a small non-cryptographic function of its content and the previous entry's hash. It is not a cryptographic proof system.",
    exported_at: new Date().toISOString(),
    chain_intact: checkChain(entries).ok,
    entries,
  };
}
