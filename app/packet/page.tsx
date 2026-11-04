"use client";

import Link from "next/link";

import { shortHash } from "@/lib/ledger";
import { PACKET_LABEL, PACKET_PLACEHOLDER, buildPacket } from "@/lib/packet";
import { useAudit } from "@/lib/store";

import { EvidenceCrop, MaskFigure, NeedsStep, SeverityBadge } from "../ui";

export default function PacketPage() {
  const audit = useAudit();

  if (!audit.findings || audit.findings.length === 0) {
    return (
      <>
        <h1>Audit packet</h1>
        <NeedsStep
          text="The packet is built from the audit. Run the audit and the cross-check first."
          href="/"
          cta="Go to Upload"
        />
      </>
    );
  }

  const packet = buildPacket(audit);
  const masks = audit.masks ?? [];
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "not run");

  return (
    <>
      <div className="page-head no-print">
        <div>
          <h1>
            Audit packet <span className="badge conf">Placeholder</span>
          </h1>
          <p className="lede">
            The same content as the JSON export, laid out for print. Use Print, then choose Save as PDF.
          </p>
        </div>
        <div className="row">
          <Link className="btn ghost" href="/ledger">
            Ledger
          </Link>
          <button className="btn" onClick={() => window.print()}>
            Print or save as PDF
          </button>
        </div>
      </div>

      <article className="paper">
        <header className="doc-head">
          <div className="doc-kicker">CrossSight audit packet</div>
          <h1>Project Atlas — Contract vs. Blueprint vs. Site Photo</h1>
          <p className="doc-label">{PACKET_LABEL}</p>
          <p className="small muted" style={{ margin: 0 }}>
            {PACKET_PLACEHOLDER}
          </p>
          <dl className="kv doc-meta">
            <dt>Audit run</dt>
            <dd>{fmt(packet.audit_run_at)}</dd>
            <dt>Packet generated</dt>
            <dd>{fmt(packet.exported_at)}</dd>
            <dt>Findings</dt>
            <dd>{packet.findings.length}</dd>
          </dl>
        </header>

        <section className="doc-section">
          <h2>1. Summary</h2>
          <table className="cite-table" style={{ border: "1px solid var(--border)" }}>
            <thead>
              <tr>
                <th className="doc">Finding</th>
                <th>Title</th>
                <th>Severity</th>
                <th>State</th>
                <th>Human decision</th>
              </tr>
            </thead>
            <tbody>
              {packet.findings.map((f) => (
                <tr key={f.finding_id}>
                  <td className="doc mono">{f.finding_id}</td>
                  <td>{f.title}</td>
                  <td>
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td>{f.current.finding_state}</td>
                  <td>{f.current.human_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {packet.findings.map((f, i) => {
          const refs = [
            { label: "Blueprint", ref: f.sam_mask_refs.blueprint },
            { label: "Site photo", ref: f.sam_mask_refs.site_photo },
          ].filter((r) => r.ref);
          return (
            <section className="doc-section" key={f.finding_id}>
              <h2>
                {i + 2}. {f.finding_id} · {f.severity} · {f.title}
              </h2>
              <p className="small muted">
                Compared: {f.compared_sources}. Confidence: {f.confidence}.
              </p>

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
                  {f.citations.map((c) => (
                    <tr key={c.role}>
                      <td className="doc">{c.document}</td>
                      <td className="ref">{c.ref}</td>
                      <td className="cell-quote">{c.quote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {refs.length > 0 && (
                <>
                  <div className="section-label">Evidence — mock SAM regions</div>
                  <div className="doc-evidence">
                    {refs.map(({ label, ref }) => {
                      const mask = masks.find((m) => m.image === ref!.image);
                      if (!mask) return null;
                      return (
                        <figure key={label} className="doc-figure">
                          <MaskFigure mask={mask} highlight={ref!.region_id} tone="bad" />
                          <figcaption className="caption">
                            {label} · <span className="mono">{ref!.region_id}</span>
                          </figcaption>
                        </figure>
                      );
                    })}
                    {refs.flatMap(({ label, ref }) => {
                      const mask = masks.find((m) => m.image === ref!.image);
                      return mask
                        ? mask.regions
                            .filter((r) => r.id !== ref!.region_id)
                            .map((r) => <EvidenceCrop key={r.id} mask={mask} region={r} tone="bad" caption={label} />)
                        : [];
                    })}
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
              <p style={{ margin: "0 0 6px" }}>{f.action_packet.task}</p>
              <p className="rfi">{f.action_packet.rfi_draft}</p>
              <p className="small muted" style={{ marginTop: 6 }}>
                Current: {f.current.human_status}; finding {f.current.finding_state}. Assignee:{" "}
                {f.current.assignee ?? "not assigned"}. Deadline: {f.current.deadline ?? "not set"}.
              </p>

              <div className="section-label">Approval history</div>
              {f.approval_history.length === 0 ? (
                <p className="empty-line">No human decisions recorded.</p>
              ) : (
                <table className="cite-table" style={{ border: "1px solid var(--border)" }}>
                  <thead>
                    <tr>
                      <th className="doc">Time</th>
                      <th className="ref">Actor</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.approval_history.map((h, k) => (
                      <tr key={k}>
                        <td className="doc">{new Date(h.at).toLocaleString()}</td>
                        <td className="ref">{h.actor}</td>
                        <td>
                          <strong>{h.decision}</strong> — {h.event}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}

        <section className="doc-section">
          <h2>{packet.findings.length + 2}. Change spec</h2>
          <p>{packet.change_spec.note}</p>
          <table className="cite-table" style={{ border: "1px solid var(--border)" }}>
            <thead>
              <tr>
                <th className="doc">Impact group</th>
                <th>Proven in the pack</th>
                <th>Expected</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(packet.change_spec.by_group).map(([group, n]) => (
                <tr key={group}>
                  <td className="doc">{group}</td>
                  <td>{n.proven}</td>
                  <td>{n.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="doc-section">
          <h2>{packet.findings.length + 3}. Ledger</h2>
          <p className="small muted">
            {packet.ledger.notice} {packet.ledger.hash_note}
          </p>
          <p className="small">
            Chain check: <strong>{packet.ledger.chain_intact ? "intact" : "broken"}</strong> · {packet.ledger.entry_count}{" "}
            entries.
          </p>
          <table className="cite-table" style={{ border: "1px solid var(--border)" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Action</th>
                <th>Finding</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {packet.ledger.entries.map((e) => (
                <tr key={e.seq}>
                  <td>{e.seq}</td>
                  <td className="small">{new Date(e.at).toLocaleString()}</td>
                  <td>
                    {e.action}
                    <span className="block small muted">{e.actor}</span>
                  </td>
                  <td className="mono">{e.finding_id}</td>
                  <td className="mono">{shortHash(e.hash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="doc-foot small muted">
          {PACKET_LABEL} {packet.guardrails}
        </footer>
      </article>
    </>
  );
}
