"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resetAudit, useAudit, type AuditState } from "@/lib/store";

const STEPS: { href: string; label: string; hint: string; done: (s: AuditState) => boolean }[] = [
  { href: "/", label: "Upload", hint: "Project pack", done: (s) => s.auditRunAt !== null },
  { href: "/masks", label: "Masks", hint: "SAM regions (mock)", done: (s) => s.masks !== null },
  { href: "/findings", label: "Findings", hint: "Cross-check (mock)", done: (s) => s.findings !== null },
  { href: "/change", label: "Change spec", hint: "Propagation", done: (s) => s.specChange !== null },
  {
    href: "/actions",
    label: "Actions",
    hint: "Human approval",
    done: (s) => Object.values(s.actions).some((a) => a.status !== "Awaiting human approval"),
  },
  { href: "/verify", label: "Verify", hint: "Fix photo check (mock)", done: (s) => Object.keys(s.verifications).length > 0 },
  { href: "/diagram", label: "Corrected detail", hint: "Placeholder drawing", done: (s) => s.findingState["CS-001"] === "closed" },
  { href: "/ledger", label: "Ledger", hint: "Audit trail", done: (s) => (s.ledger ?? []).some((e) => e.action.startsWith("Finding closed")) },
];

export function StepNav({ mode }: { mode: string }) {
  const pathname = usePathname();
  const audit = useAudit();

  return (
    <nav className="steps" aria-label="Audit steps">
      <div className="nav-section">Audit</div>
      <ol>
        {STEPS.map((step, i) => {
          const active = pathname === step.href;
          const done = step.done(audit);
          return (
            <li key={step.href}>
              <Link href={step.href} className={`step${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
                <span className={`step-num${done ? " done" : ""}`} title={done ? "Done" : undefined}>
                  {i + 1}
                </span>
                <span>
                  <span className="step-label">{step.label}</span>
                  <span className="step-hint">{step.hint}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="nav-section">Teasers</div>
      <Link href="/portfolio" className={`step${pathname === "/portfolio" ? " active" : ""}`}>
        <span className="step-num">P</span>
        <span>
          <span className="step-label">Portfolio</span>
          <span className="step-hint">4 fictional projects</span>
        </span>
      </Link>
      <Link href="/twin" className={`step${pathname === "/twin" ? " active" : ""}`}>
        <span className="step-num">T</span>
        <span>
          <span className="step-label">Living twin</span>
          <span className="step-hint">Timeline placeholder</span>
        </span>
      </Link>
      <div className="sidebar-foot">
        <button className="btn ghost small" onClick={resetAudit}>
          Reset demo
        </button>
        <span className="mode">{mode === "mock" ? "Mock mode — no live Meta calls" : "Live mode"}</span>
      </div>
    </nav>
  );
}
