"use client";

import Link from "next/link";

import { IMAGES } from "@/data/atlas";
import { useAudit } from "@/lib/store";

const PLACEHOLDER_LABEL = "Living-twin placeholder — mock timeline, no live video.";

type Tone = "done" | "flag" | "wait";

interface Stage {
  n: number;
  title: string;
  source: string;
  image: string;
  alt: string;
  status: string;
  tone: Tone;
  badge: string;
}

export default function TwinPage() {
  const audit = useAudit();

  const flagged = audit.findings?.some((f) => f.finding_id === "CS-001") ?? false;
  const verified = (audit.verifications["CS-001"] ?? []).some((v) => v.verdict === "matches_spec");
  const state = audit.findingState["CS-001"] ?? "open";
  const closed = state === "closed";

  const stages: Stage[] = [
    {
      n: 1,
      title: "Blueprint",
      source: "Sheet 7",
      image: IMAGES.sheet7,
      alt: "Fictional Blueprint Sheet 7, riser run R-1",
      status: "Riser run R-1 is drawn with cable TYPE B. Contract §4.2 names Type A.",
      tone: "done",
      badge: "R-1 TYPE B",
    },
    {
      n: 2,
      title: "Site photo",
      source: "Photo 12",
      image: IMAGES.photo12,
      alt: "Fictional Site Photo 12, riser room",
      status: flagged
        ? "Cable TYPE C is installed in R-1. CS-001 flagged (High) for a person to review."
        : "Cable TYPE C is installed in R-1. CS-001 appears once the cross-check has run.",
      tone: flagged ? "flag" : "wait",
      badge: flagged ? "TYPE C · CS-001 flagged" : "TYPE C installed",
    },
    {
      n: 3,
      title: "Fix photo",
      source: "Sample fix photo",
      image: IMAGES.fixPhoto,
      alt: "Fictional fix photo, riser run R-1 after the fix",
      status: closed
        ? "Cable TYPE A, fix verified. CS-001 closed by a human reviewer."
        : verified
          ? "Cable TYPE A, fix verified. CS-001 stays open until a human clicks Close finding."
          : "Cable TYPE A is the sample fix. Not verified yet — run the fix check on the Verify step. A finding is closed only by a human click.",
      tone: closed ? "done" : verified ? "flag" : "wait",
      badge: closed ? "TYPE A · closed by human" : verified ? "TYPE A · fix verified" : "TYPE A · not yet verified",
    },
  ];

  return (
    <>
      <div className="spread">
        <div>
          <h1>
            Living twin <span className="badge conf">Teaser</span>
          </h1>
          <p className="lede">Project Atlas, riser run R-1, over time: from the drawing to the site to the fix.</p>
        </div>
        <div className="row">
          <Link className="btn ghost" href="/verify">
            Verify
          </Link>
          <Link className="btn" href="/ledger">
            Ledger →
          </Link>
        </div>
      </div>

      <div className="notice warn">
        <strong>{PLACEHOLDER_LABEL}</strong> These are three fictional still images from the sample pack. This is not a
        live site feed, and nothing here is captured from a real site.
      </div>

      <ol className="twin-line">
        {stages.map((s) => (
          <li key={s.n} className={`twin-stage ${s.tone}`}>
            <div className="twin-head">
              <span className="twin-dot">{s.n}</span>
              <span>
                <strong>{s.title}</strong>
                <span className="muted small"> · {s.source}</span>
              </span>
            </div>
            <div className="card twin-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="twin-img" src={s.image} alt={s.alt} />
              <span className={`badge twin-badge ${s.tone}`}>{s.badge}</span>
              <p className="twin-status">{s.status}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="small muted">
        The statuses follow what has been done in this demo session. CrossSight flags risks for a person to review. The
        Engineer of Record decides what is built, and only a person closes a finding.
      </p>
    </>
  );
}
