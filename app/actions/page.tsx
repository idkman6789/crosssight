"use client";

import Link from "next/link";

import { humanAction, recordAction, useAudit } from "@/lib/store";
import { SEVERITY_RANK, type Finding } from "@/lib/types";

import { NeedsStep, SeverityBadge } from "../ui";

export default function ActionsPage() {
  const audit = useAudit();

  if (!audit.findings) {
    return (
      <>
        <h1>Action packets</h1>
        <NeedsStep text="No action packets yet. Findings come first." href="/findings" cta="Go to Findings" />
      </>
    );
  }

  const findings = [...audit.findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  return (
    <>
      <div className="spread">
        <div>
          <h1>Action packets</h1>
          <p className="lede">Every finding becomes a task and an RFI draft. A person decides what happens next.</p>
        </div>
        <Link className="btn" href="/verify">
          Verify a fix →
        </Link>
      </div>
      <div className="notice">
        CrossSight never approves, dismisses, or closes anything on its own. Every status change on this page is a
        human click, logged below each packet. This is not legal advice or a safety verdict.
      </div>
      {findings.map((f) => (
        <PacketCard key={f.finding_id} finding={f} />
      ))}
    </>
  );
}

function PacketCard({ finding: f }: { finding: Finding }) {
  const audit = useAudit();
  const act = humanAction(audit, f.finding_id);
  const id = f.finding_id;
  const safety = Boolean(f.sources.certificate);

  return (
    <div className={`card sev-bar-${f.severity}`}>
      <div className="spread">
        <div className="row">
          <span className="finding-id">{id}</span>
          <SeverityBadge severity={f.severity} />
          <strong>{f.title}</strong>
        </div>
        <span className={`badge status-${act.status.split(" ")[0]}`}>
          {act.status === "Assigned" ? `Assigned to ${act.assignee}` : act.status}
        </span>
      </div>

      <div className="section-label">Task</div>
      <p style={{ margin: 0 }}>{f.action_packet.task}</p>

      <div className="section-label">RFI draft</div>
      <p className="rfi">{f.action_packet.rfi_draft}</p>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="field">
          <label htmlFor={`assignee-${id}`}>Assignee</label>
          <input
            id={`assignee-${id}`}
            placeholder={safety ? "e.g. safety officer" : "e.g. Engineer of Record"}
            value={act.assignee}
            onChange={(e) => recordAction(id, { assignee: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor={`deadline-${id}`}>Deadline</label>
          <input
            id={`deadline-${id}`}
            type="date"
            value={act.deadline}
            onChange={(e) => recordAction(id, { deadline: e.target.value })}
          />
        </div>
      </div>
      <p className="small muted">Assignee and deadline are set by a person. CrossSight leaves both empty.</p>

      <div className="row" style={{ marginTop: 6 }}>
        <button
          className="btn approve"
          onClick={() => recordAction(id, { status: "Approved" }, "Approved by human reviewer")}
        >
          Approve
        </button>
        <button
          className="btn dismiss"
          onClick={() => recordAction(id, { status: "Dismissed" }, "Dismissed by human reviewer")}
        >
          Dismiss
        </button>
        <button
          className="btn assign"
          disabled={!act.assignee.trim()}
          title={act.assignee.trim() ? "" : "Enter an assignee first"}
          onClick={() =>
            recordAction(
              id,
              { status: "Assigned" },
              `Assigned to ${act.assignee.trim()}${act.deadline ? `, due ${act.deadline}` : ""}`,
            )
          }
        >
          Assign
        </button>
        {safety && <span className="small muted">Safety item — a human safety officer must approve.</span>}
      </div>

      {act.history.length > 0 && (
        <ul className="history">
          {act.history.map((h, i) => (
            <li key={i}>
              {new Date(h.at).toLocaleString()} — {h.event}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
