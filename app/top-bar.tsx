"use client";

import { useAudit } from "@/lib/store";

/** Project header shown on every page: project, audit scope, and audit status. */
export function TopBar({ mode }: { mode: string }) {
  const audit = useAudit();
  const findings = audit.findings ?? [];
  const high = findings.filter((f) => f.severity === "High" || f.severity === "Critical").length;
  const closed = findings.filter((f) => audit.findingState[f.finding_id] === "closed").length;

  const status = !audit.auditRunAt
    ? "Audit not run"
    : findings.length === 0
      ? `Audit run ${new Date(audit.auditRunAt).toLocaleString()} · cross-check pending`
      : `Audit run ${new Date(audit.auditRunAt).toLocaleString()} · ${findings.length} findings, ${high} High, ${closed} closed`;

  return (
    <header className="topbar">
      <span className="wordmark">CrossSight</span>
      <span className="crumb-sep" aria-hidden="true" />
      <span>
        <span className="project-name">Project Atlas</span>
        <span className="project-meta"> · Fictional data center build · Contract vs. Blueprint vs. Site Photo</span>
      </span>
      <span className="topbar-right">
        <span>{status}</span>
        <span className="badge mock-tag">{mode === "mock" ? "Mock data" : "Live"}</span>
      </span>
    </header>
  );
}
