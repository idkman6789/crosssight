// The audit flow in one place. The sidebar, the page eyebrow and the previous/next
// footer all read this list, so the order can only be changed here.

import type { AuditState } from "@/lib/store";

export interface Step {
  href: string;
  label: string;
  hint: string;
  group: "Audit" | "Resolve" | "Records";
  /** Whether the step has been completed in this session. Steps without one show no check. */
  done?: (s: AuditState) => boolean;
}

export const STEPS: Step[] = [
  { href: "/", label: "Upload", hint: "Project pack", group: "Audit", done: (s) => s.auditRunAt !== null },
  { href: "/masks", label: "Masks", hint: "SAM regions (mock)", group: "Audit", done: (s) => s.masks !== null },
  { href: "/findings", label: "Findings", hint: "Cross-check (mock)", group: "Audit", done: (s) => s.findings !== null },
  { href: "/change", label: "Change spec", hint: "Propagation", group: "Audit", done: (s) => s.specChange !== null },
  {
    href: "/actions",
    label: "Actions",
    hint: "Human approval",
    group: "Resolve",
    done: (s) => Object.values(s.actions).some((a) => a.status !== "Awaiting human approval"),
  },
  { href: "/verify", label: "Verify", hint: "Fix photo check (mock)", group: "Resolve", done: (s) => Object.keys(s.verifications).length > 0 },
  { href: "/diagram", label: "Corrected detail", hint: "Placeholder drawing", group: "Resolve", done: (s) => s.findingState["CS-001"] === "closed" },
  {
    href: "/ledger",
    label: "Ledger",
    hint: "Audit trail",
    group: "Records",
    done: (s) => (s.ledger ?? []).some((e) => e.action.startsWith("Finding closed")),
  },
  { href: "/packet", label: "Audit packet", hint: "Printable export", group: "Records" },
];

export const GROUPS: Step["group"][] = ["Audit", "Resolve", "Records"];

export const TEASERS = [
  { href: "/portfolio", label: "Portfolio", hint: "4 fictional projects", mark: "P" },
  { href: "/twin", label: "Living twin", hint: "Timeline placeholder", mark: "T" },
];

export function stepIndex(pathname: string): number {
  return STEPS.findIndex((s) => s.href === pathname);
}
