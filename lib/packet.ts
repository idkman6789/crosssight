// Audit packet export (ledger teaser, mock data). Pure function over the audit
// state the demo has recorded so far — no Meta call, no invented facts, no
// dollar figures. Everything in it is a placeholder for the live export.

import { IMAGES } from "@/data/atlas";

import { LEDGER_PLACEHOLDER, checkChain } from "./ledger";
import { EXPECTED, IMPACT_GROUPS, propagate } from "./propagation";
import type { AuditState } from "./store";
import type { Finding, SamMask } from "./types";

export const PACKET_LABEL = "Fictional sample pack for demo only.";
export const PACKET_PLACEHOLDER =
  "Export placeholder — this packet is built from mock data recorded in this demo session. The live export will be produced when the live audit runs.";

const MASK_TITLES: Record<string, string> = {
  [IMAGES.sheet7]: "Blueprint Sheet 7",
  [IMAGES.photo12]: "Site Photo 12",
};

type DecisionKind = "Approve" | "Dismiss" | "Assign" | "Close";

/** Only these four are human decisions; anything else in a history is not listed as one. */
function decisionKind(event: string): DecisionKind | null {
  if (event.startsWith("Approved")) return "Approve";
  if (event.startsWith("Dismissed")) return "Dismiss";
  if (event.startsWith("Assigned")) return "Assign";
  if (event.startsWith("Finding closed by human")) return "Close";
  return null;
}

function findingEntry(f: Finding, s: AuditState) {
  const act = s.actions[f.finding_id];
  const citations = Object.entries(f.sources)
    .filter(([, src]) => src)
    .map(([role, src]) => ({ role, ...src! }));

  return {
    finding_id: f.finding_id,
    title: f.title,
    severity: f.severity,
    confidence: f.confidence,
    compared_sources: citations.map((c) => c.document).join(" vs "),
    citations,
    sam_mask_refs: f.sam_masks,
    impact: f.impact,
    action_packet: f.action_packet,
    current: {
      human_status: act?.status ?? "Awaiting human approval",
      finding_state: s.findingState[f.finding_id] ?? "open",
      assignee: act?.assignee || null,
      deadline: act?.deadline || null,
    },
    approval_history: (act?.history ?? []).flatMap((h) => {
      const decision = decisionKind(h.event);
      return decision ? [{ at: h.at, actor: "Human reviewer", decision, event: h.event }] : [];
    }),
  };
}

function samRegions(masks: SamMask[] | null) {
  return (masks ?? [])
    .filter((m) => m.image in MASK_TITLES)
    .map((m) => ({
      image: MASK_TITLES[m.image],
      file: m.image,
      bbox_format: "[x, y, w, h] in 0–1000 image coordinates",
      source: "Mock SAM regions — placeholder, not a live SAM 3.1 result",
      regions: m.regions,
    }));
}

function changeSpec(s: AuditState) {
  // The pack proves the same items whichever new type is chosen, so Type B is
  // used for the count when no change was applied in this session.
  const result = propagate("A", (s.specChange?.to as "B" | "C" | undefined) ?? "B");
  const expected = Object.values(EXPECTED).reduce((a, b) => a + b, 0);
  return {
    note: `Showing proven impacts only: the pack proves ${result.impacts.length} of ${expected} expected impacts. Nothing is listed that the pack does not contain.`,
    proven: result.impacts.length,
    expected,
    by_group: Object.fromEntries(IMPACT_GROUPS.map((g) => [g, { proven: result.proven[g], expected: EXPECTED[g] }])),
    applied_in_this_session: s.specChange,
  };
}

export function buildPacket(s: AuditState) {
  const findings = s.findings ?? [];
  const ledger = s.ledger ?? [];
  return {
    label: PACKET_LABEL,
    notice: PACKET_PLACEHOLDER,
    project: "Project Atlas (fictional)",
    exported_at: new Date().toISOString(),
    audit_run_at: s.auditRunAt,
    guardrails:
      "CrossSight flags risks for an engineer, lawyer, or safety officer to review. It states no cost figures, safety verdicts or legal conclusions, and it never approves or closes anything itself.",
    findings_note: findings.length ? null : "The cross-check has not been run in this session, so there are no findings to export yet.",
    findings: findings.map((f) => findingEntry(f, s)),
    sam_masks: samRegions(s.masks),
    change_spec: changeSpec(s),
    ledger: {
      notice: LEDGER_PLACEHOLDER,
      hash_note:
        "Demo of the idea only: each entry's hash is a small non-cryptographic function of its content and the previous entry's hash. It is not a cryptographic proof system.",
      chain_intact: checkChain(ledger).ok,
      entry_count: ledger.length,
      entries: ledger,
    },
  };
}
