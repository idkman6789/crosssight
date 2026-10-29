"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resetAudit, useAudit, type AuditState } from "@/lib/store";

const STEPS: { href: string; label: string; hint: string; done: (s: AuditState) => boolean }[] = [
  { href: "/", label: "Upload", hint: "Project pack", done: (s) => s.auditRunAt !== null },
  { href: "/masks", label: "Masks", hint: "SAM 3.1 regions", done: (s) => s.masks !== null },
  { href: "/findings", label: "Findings", hint: "Muse Spark cross-check", done: (s) => s.findings !== null },
  { href: "/change", label: "Change spec", hint: "Propagation · teaser", done: (s) => s.specChange !== null },
  {
    href: "/actions",
    label: "Actions",
    hint: "Human approval",
    done: (s) => Object.values(s.actions).some((a) => a.status !== "Awaiting human approval"),
  },
  { href: "/verify", label: "Verify", hint: "Fix photo check", done: (s) => Object.keys(s.verifications).length > 0 },
  { href: "/diagram", label: "Corrected detail", hint: "Muse Image · placeholder", done: (s) => s.findingState["CS-001"] === "closed" },
  { href: "/ledger", label: "Ledger", hint: "Proof trail · placeholder", done: (s) => (s.ledger ?? []).some((e) => e.action.startsWith("Finding closed")) },
];

export function StepNav() {
  const pathname = usePathname();
  const audit = useAudit();

  return (
    <nav className="steps">
      <ol>
        {STEPS.map((step, i) => {
          const active = pathname === step.href;
          const done = step.done(audit);
          return (
            <li key={step.href}>
              <Link href={step.href} className={`step${active ? " active" : ""}`}>
                <span className={`step-num${done ? " done" : ""}`}>{done ? "✓" : i + 1}</span>
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
        <span className="step-num">▦</span>
        <span>
          <span className="step-label">Portfolio</span>
          <span className="step-hint">4 fictional projects</span>
        </span>
      </Link>
      <button className="btn ghost small reset" onClick={resetAudit}>
        Reset demo
      </button>
    </nav>
  );
}
