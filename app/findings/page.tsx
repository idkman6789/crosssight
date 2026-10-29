"use client";

import Link from "next/link";
import { useState } from "react";

import { CERT_EXPIRY, daysExpired } from "@/data/atlas";
import { humanAction, useAudit } from "@/lib/store";
import { SEVERITY_RANK, type Finding, type MaskRef, type SamMask, type Source } from "@/lib/types";

import { ConfidenceBadge, MaskView, NeedsStep, SeverityBadge } from "../ui";

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

  return (
    <>
      <div className="spread">
        <div>
          <h1>Findings</h1>
          <p className="lede">
            {findings.length} findings, ranked by severity. Each one cites its exact sources. Audit run{" "}
            {runAt.toLocaleString()}.
          </p>
        </div>
        <Link className="btn" href="/change">
          Change spec →
        </Link>
      </div>

      {findings.map((f) => (
        <FindingCard
          key={f.finding_id}
          finding={f}
          masks={audit.masks ?? []}
          runAt={runAt}
          state={audit.findingState[f.finding_id] ?? "open"}
          actionStatus={humanAction(audit, f.finding_id).status}
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
  actionStatus,
  open,
  onToggle,
}: {
  finding: Finding;
  masks: SamMask[];
  runAt: Date;
  state: string;
  actionStatus: string;
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

  return (
    <div className={`card finding sev-bar-${f.severity}`}>
      <button className="finding-head" onClick={onToggle} aria-expanded={open}>
        <span className="finding-id">{f.finding_id}</span>
        <SeverityBadge severity={f.severity} />
        <span className="finding-title">{f.title}</span>
        <span className={`badge state-${state}`}>Finding {state}</span>
        <span className="muted">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="finding-body">
          <div className="row" style={{ marginTop: 12 }}>
            <ConfidenceBadge confidence={f.confidence} />
            <span className={`badge status-${actionStatus.split(" ")[0]}`}>Action: {actionStatus}</span>
          </div>

          <div className="section-label">Sources</div>
          {sources
            .filter(([, s]) => s)
            .map(([kind, s]) => (
              <div className="source" key={kind}>
                <span className="source-doc">{s!.document}</span> <span className="muted">· {s!.ref}</span>
                <p className="quote">{s!.quote}</p>
              </div>
            ))}

          {isCert && (
            <p className="small">
              Expired <strong>{daysExpired(CERT_EXPIRY, runAt)} days</strong> before the audit run date (
              {runAt.toLocaleDateString()}). Computed at render time from expiry {CERT_EXPIRY}.
            </p>
          )}

          {(f.sam_masks.blueprint || f.sam_masks.site_photo) && (
            <>
              <div className="section-label">SAM masks</div>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <MaskThumb label="Blueprint" mref={f.sam_masks.blueprint} masks={masks} />
                <MaskThumb label="Site photo" mref={f.sam_masks.site_photo} masks={masks} />
              </div>
            </>
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
          <p className="small muted">
            Status from CrossSight: {f.action_packet.status}. <Link href="/actions">Open in Actions →</Link>
          </p>

          {f.sources.contract && (
            <div className="notice" style={{ marginBottom: 0 }}>
              <div className="spread">
                <span>What if the spec changes? See every pack item a change to {f.sources.contract.ref} touches.</span>
                <Link className="btn small" href="/change">
                  Change spec
                </Link>
              </div>
            </div>
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
    <div style={{ flex: "1 1 220px", maxWidth: 260 }}>
      <MaskView mask={mask} highlight={mref.region_id} tone="bad" thumb />
      <p className="small muted" style={{ margin: "4px 0 0" }}>
        {label} · <span className="mono">{mref.region_id}</span>
      </p>
    </div>
  );
}
