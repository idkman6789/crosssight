"use client";

import Link from "next/link";
import { useState } from "react";

import { CERT_EXPIRY, daysExpired } from "@/data/atlas";
import { humanAction, useAudit, type HumanAction } from "@/lib/store";
import { SEVERITY_RANK, type Finding, type MaskRef, type SamMask, type Source } from "@/lib/types";

import { ActionHistory, ConfidenceBadge, MaskView, MockTag, NeedsStep, SeverityBadge } from "../ui";

export default function FindingsPage() {
  const audit = useAudit();
  const [open, setOpen] = useState<string | null>("CS-001");

  if (!audit.findings) {
    return (
      <>
        <h1>Findings</h1>
        <NeedsStep text="No findings yet. Run the cross-check on the Masks step." href="/masks" cta="Go to Masks" />
      </>
    );
  }

  const findings = [...audit.findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  const runAt = audit.auditRunAt ? new Date(audit.auditRunAt) : new Date();
  const high = findings.filter((f) => f.severity === "High" || f.severity === "Critical").length;
  const medium = findings.filter((f) => f.severity === "Medium").length;
  const closed = findings.filter((f) => audit.findingState[f.finding_id] === "closed").length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            Findings <MockTag>Mock cross-check</MockTag>
          </h1>
          <p className="lede">
            Ranked by severity. Each finding states what the sources say and cites the exact clause, sheet region, or
            photo. CrossSight flags; a person decides.
          </p>
        </div>
        <Link className="btn" href="/change">
          Change spec
        </Link>
      </div>

      <div className="summary-bar">
        <span>
          Audit run <strong>{runAt.toLocaleString()}</strong>
        </span>
        <span>
          Findings <strong>{findings.length}</strong>
        </span>
        <span>
          High <strong>{high}</strong>
        </span>
        <span>
          Medium <strong>{medium}</strong>
        </span>
        <span>
          Closed <strong>{closed}</strong>
        </span>
      </div>

      {findings.map((f) => (
        <FindingCard
          key={f.finding_id}
          finding={f}
          masks={audit.masks ?? []}
          runAt={runAt}
          state={audit.findingState[f.finding_id] ?? "open"}
          action={humanAction(audit, f.finding_id)}
          open={open === f.finding_id}
          onToggle={() => setOpen(open === f.finding_id ? null : f.finding_id)}
        />
      ))}
    </>
  );
}

function FindingCard({
  finding: f,
  masks,
  runAt,
  state,
  action,
  open,
  onToggle,
}: {
  finding: Finding;
  masks: SamMask[];
  runAt: Date;
  state: string;
  action: HumanAction;
  open: boolean;
  onToggle: () => void;
}) {
  const sources: [string, Source | null | undefined][] = [
    ["Contract", f.sources.contract],
    ["Blueprint", f.sources.blueprint],
    ["Site photo", f.sources.site_photo],
    ["Certificate", f.sources.certificate],
  ];
  const isCert = Boolean(f.sources.certificate);
  const hasEvidence = Boolean(f.sam_masks.blueprint || f.sam_masks.site_photo);

  return (
    <div className={`card finding sev-bar-${f.severity}`}>
      <button className="finding-head" onClick={onToggle} aria-expanded={open}>
        <span className="finding-id">{f.finding_id}</span>
        <SeverityBadge severity={f.severity} />
        <span className="finding-title">{f.title}</span>
        <span className={`badge state-${state}`}>Finding {state}</span>
        <span className="toggle-text">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="finding-body">
          <div className="row" style={{ marginTop: 12 }}>
            <ConfidenceBadge confidence={f.confidence} />
            <span className={`badge status-${action.status.split(" ")[0]}`}>
              {action.status === "Awaiting human approval" ? "Awaiting human approval" : `Human decision: ${action.status}`}
            </span>
          </div>

          <div className={hasEvidence ? "finding-cols" : undefined}>
            <div>
              <div className="section-label">Citations</div>
              <table className="cite-table" style={{ border: "1px solid var(--border)" }}>
                <thead>
                  <tr>
                    <th className="doc">Source</th>
                    <th className="ref">Reference</th>
                    <th>Cited text</th>
                  </tr>
                </thead>
                <tbody>
                  {sources
                    .filter(([, s]) => s)
                    .map(([kind, s]) => (
                      <tr key={kind}>
                        <td className="doc">{s!.document}</td>
                        <td className="ref">{s!.ref}</td>
                        <td className="cell-quote">{s!.quote}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {isCert && (
                <p className="small" style={{ marginTop: 8 }}>
                  Expired <strong>{daysExpired(CERT_EXPIRY, runAt)} days</strong> before the audit run date (
                  {runAt.toLocaleDateString()}). Computed at render time from expiry {CERT_EXPIRY}.
                </p>
              )}

              <div className="section-label">Impact</div>
              <dl className="kv">
                <dt>Compliance</dt>
                <dd>{f.impact.compliance}</dd>
                <dt>Cost / schedule / safety</dt>
                <dd>{f.impact.cost_schedule_safety}</dd>
              </dl>

              <div className="section-label">Action packet</div>
              <p style={{ margin: 0 }}>{f.action_packet.task}</p>
              <p className="small muted" style={{ marginTop: 4 }}>
                Status from CrossSight: {f.action_packet.status}. <Link href="/actions">Open in Actions</Link>
              </p>
            </div>

            {hasEvidence && (
              <div className="evidence">
                <div className="section-label" style={{ margin: 0 }}>
                  Evidence (mock SAM regions)
                </div>
                <MaskThumb label="Blueprint" mref={f.sam_masks.blueprint} masks={masks} />
                <MaskThumb label="Site photo" mref={f.sam_masks.site_photo} masks={masks} />
              </div>
            )}
          </div>

          <div className="section-label">Action history</div>
          <ActionHistory history={action.history} />

          {f.sources.contract && (
            <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Spec change: see every pack item a change to {f.sources.contract.ref} touches in{" "}
              <Link href="/change">Change spec</Link>.
            </p>
          )}

          <details className="json">
            <summary>Structured finding JSON</summary>
            <pre>{JSON.stringify(f, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function MaskThumb({ label, mref, masks }: { label: string; mref: MaskRef | null; masks: SamMask[] }) {
  const mask = mref && masks.find((m) => m.image === mref.image);
  if (!mref || !mask) return null;
  return (
    <div>
      <MaskView mask={mask} highlight={mref.region_id} tone="bad" thumb />
      <p className="caption">
        {label} · <span className="mono">{mref.region_id}</span> · click to enlarge
      </p>
    </div>
  );
}
