"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAudit } from "@/lib/store";

/** Project header shown on every page: project, audit scope, and audit status. On a phone it also opens the menu. */
export function TopBar({ mode }: { mode: string }) {
  const audit = useAudit();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The menu closes when you pick a page or press Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-open");
    };
  }, [open]);

  const findings = audit.findings ?? [];
  const high = findings.filter((f) => f.severity === "High" || f.severity === "Critical").length;
  const closed = findings.filter((f) => audit.findingState[f.finding_id] === "closed").length;

  const status = !audit.auditRunAt
    ? "Audit not run"
    : findings.length === 0
      ? `Audit run ${new Date(audit.auditRunAt).toLocaleString()} · cross-check pending`
      : `Audit run ${new Date(audit.auditRunAt).toLocaleString()} · ${findings.length} findings, ${high} High, ${closed} closed`;

  return (
    <>
      <header className="topbar">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
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
      <div className="nav-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
    </>
  );
}
