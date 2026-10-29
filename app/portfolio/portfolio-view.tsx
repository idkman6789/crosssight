"use client";

import { useState } from "react";

import {
  ISSUE_LABEL,
  SEVERITIES,
  countBySeverity,
  mostCommonIssues,
  sortBySeverity,
  statusFromCounts,
  type PortfolioData,
  type ProjectStatus,
} from "@/lib/portfolio";
import type { Severity } from "@/lib/types";

import { ConfidenceBadge, SeverityBadge } from "../ui";

const STATUS_CLASS: Record<ProjectStatus, string> = {
  "On track": "pstatus-ok",
  "Needs attention": "pstatus-warn",
  "At risk": "pstatus-bad",
};

export function PortfolioView({ data }: { data: PortfolioData }) {
  const [project, setProject] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const totals = countBySeverity(data.entries);
  const common = mostCommonIssues(data.entries);
  const nameOf = (id: string) => data.projects.find((p) => p.id === id)?.name ?? id;

  const shown = sortBySeverity(
    data.entries.filter(
      (e) => (!project || e.project_id === project) && (!severity || e.finding.severity === severity),
    ),
  );
  const filtered = project !== null || severity !== null;

  return (
    <>
      <div className="spread">
        <div>
          <h1>
            Portfolio (Teaser) <span className="badge conf">Teaser</span>
          </h1>
          <p className="lede">
            {data.projects.length} fictional projects, {data.entries.length} findings. Click a project or a severity to
            filter.
          </p>
        </div>
        {filtered && (
          <button
            className="btn ghost"
            onClick={() => {
              setProject(null);
              setSeverity(null);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="notice">
        Mock data: these projects and findings are invented. Status comes from severity counts only — At risk: any
        Critical or two or more High; Needs attention: one High or any Medium; On track: Low only. No dollar figures,
        safety verdicts, or legal advice.
      </div>

      <div className="tile-grid">
        {SEVERITIES.map((s) => (
          <button
            key={s}
            className={`tile sev-bar-${s}${severity === s ? " active" : ""}`}
            aria-pressed={severity === s}
            onClick={() => setSeverity(severity === s ? null : s)}
          >
            <strong>{totals[s]}</strong>
            <span>{s}</span>
          </button>
        ))}
        <div className="tile static">
          <strong>{data.entries.length}</strong>
          <span>All findings</span>
        </div>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginTop: 0 }}>Most common issue type</div>
        <p style={{ margin: 0 }}>
          <strong>{common.types.map((t) => ISSUE_LABEL[t]).join(" · ")}</strong>
          <span className="muted">
            {" "}
            — {common.count} of {data.entries.length} findings{common.types.length > 1 ? " (tie)" : ""}
          </span>
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="proj-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              {SEVERITIES.map((s) => (
                <th key={s} className="num">{s}</th>
              ))}
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.projects.map((p) => {
              const mine = data.entries.filter((e) => e.project_id === p.id);
              const counts = countBySeverity(mine);
              const status = statusFromCounts(counts);
              const active = project === p.id;
              return (
                <tr key={p.id} className={active ? "active" : ""} onClick={() => setProject(active ? null : p.id)}>
                  <td>
                    <button
                      className="link-btn"
                      aria-pressed={active}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProject(active ? null : p.id);
                      }}
                    >
                      {p.name}
                    </button>
                    <span className="block small muted">{p.kind}</span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[status]}`}>{status}</span>
                  </td>
                  {SEVERITIES.map((s) => (
                    <td key={s} className={`num${counts[s] === 0 ? " zero" : ""}`}>{counts[s]}</td>
                  ))}
                  <td className="num"><strong>{mine.length}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="spread" style={{ margin: "20px 0 10px" }}>
        <h2 style={{ margin: 0 }}>
          Findings <span className="muted small">— showing {shown.length} of {data.entries.length}</span>
        </h2>
        <div className="row">
          {project && (
            <button className="badge status-Assigned chip" onClick={() => setProject(null)}>
              Project: {nameOf(project)} ✕
            </button>
          )}
          {severity && (
            <button className="badge conf chip" onClick={() => setSeverity(null)}>
              Severity: {severity} ✕
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 && <p className="muted">No findings match these filters.</p>}

      {shown.map(({ project_id, issue_type, finding: f }) => {
        const isOpen = open === f.finding_id;
        const cites = [f.sources.contract, f.sources.blueprint, f.sources.site_photo, f.sources.certificate].filter(
          (s): s is NonNullable<typeof s> => Boolean(s),
        );
        return (
          <div key={f.finding_id} className={`card finding sev-bar-${f.severity}`}>
            <button className="finding-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : f.finding_id)}>
              <span className="finding-id">{f.finding_id}</span>
              <SeverityBadge severity={f.severity} />
              <span className="finding-title">{f.title}</span>
              <span className="badge conf">{nameOf(project_id)}</span>
              <span className="muted">{isOpen ? "▾" : "▸"}</span>
            </button>
            {isOpen && (
              <div className="finding-body">
                <div className="row" style={{ marginTop: 12 }}>
                  <ConfidenceBadge confidence={f.confidence} />
                  <span className="badge conf">{ISSUE_LABEL[issue_type]}</span>
                  <span className="badge status-Awaiting">Action: {f.action_packet.status}</span>
                </div>
                <div className="section-label">Sources</div>
                {cites.map((s) => (
                  <div className="source" key={s.document + s.ref}>
                    <span className="source-doc">{s.document}</span> <span className="muted">· {s.ref}</span>
                    <p className="quote">{s.quote}</p>
                  </div>
                ))}
                <div className="section-label">Impact</div>
                <dl className="kv">
                  <dt>Compliance</dt>
                  <dd>{f.impact.compliance}</dd>
                  <dt>Cost / schedule / safety</dt>
                  <dd>{f.impact.cost_schedule_safety}</dd>
                </dl>
                <details className="json">
                  <summary>Structured finding JSON</summary>
                  <pre>{JSON.stringify(f, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
