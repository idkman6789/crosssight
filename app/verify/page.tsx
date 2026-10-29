"use client";

import { useRef, useState } from "react";

import { IMAGES } from "@/data/atlas";
import { verifyFix } from "@/lib/meta";
import { humanAction, recordAction, updateAudit, useAudit } from "@/lib/store";
import type { VerifyResult } from "@/lib/types";

import { ConfidenceBadge, MaskView, NeedsStep } from "../ui";

const FINDING_ID = "CS-001";

const VERDICT_TEXT: Record<VerifyResult["verdict"], string> = {
  matches_spec: "Matches spec",
  does_not_match: "Does not match spec",
  needs_human_review: "Needs human review",
};

export default function VerifyPage() {
  const audit = useAudit();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const finding = audit.findings?.find((f) => f.finding_id === FINDING_ID);
  if (!finding) {
    return (
      <>
        <h1>Fix verification</h1>
        <NeedsStep text="Finding CS-001 is not on file yet. Run the audit first." href="/" cta="Go to Upload" />
      </>
    );
  }

  const results = audit.verifications[FINDING_ID] ?? [];
  const latest = results.at(-1);
  const state = audit.findingState[FINDING_ID] ?? "open";
  const action = humanAction(audit, FINDING_ID);
  const original = audit.masks?.find((m) => m.image === IMAGES.photo12);

  async function check(image: string, upload?: { name: string; sha256: string }) {
    setBusy(true);
    try {
      const result = await verifyFix({ finding_id: FINDING_ID, image, upload });
      updateAudit((s) => ({
        ...s,
        verifications: { ...s.verifications, [FINDING_ID]: [...(s.verifications[FINDING_ID] ?? []), result] },
        // A failed check reopens the finding with new proof. Closing always needs a human.
        findingState:
          result.verdict === "does_not_match" ? { ...s.findingState, [FINDING_ID]: "reopened" } : s.findingState,
      }));
      if (result.verdict === "does_not_match") {
        recordAction(FINDING_ID, {}, `Fix check failed — finding reopened (${result.detected})`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    const sha256 = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
    const image = `upload:${file.name}`;
    setPreviews((p) => ({ ...p, [image]: URL.createObjectURL(file) }));
    await check(image, { name: file.name, sha256 });
  }

  function closeFinding() {
    updateAudit((s) => ({ ...s, findingState: { ...s.findingState, [FINDING_ID]: "closed" } }));
    recordAction(FINDING_ID, {}, "Finding closed by human reviewer after fix verification");
  }

  const shownMask = latest && {
    ...latest.mask,
    image: previews[latest.image] ?? latest.mask.image,
  };

  return (
    <>
      <h1>Fix verification</h1>
      <p className="lede">
        Upload a photo of the corrected riser run. SAM 3.1 masks the installed cable and checks it against Contract
        §4.2. A failed check reopens the finding with new proof. Closing it always takes a person.
      </p>

      <div className="card">
        <div className="spread">
          <div className="row">
            <span className="finding-id">{FINDING_ID}</span>
            <strong>{finding.title}</strong>
          </div>
          <div className="row">
            <span className={`badge state-${state}`}>Finding {state}</span>
            <span className={`badge status-${action.status.split(" ")[0]}`}>Action: {action.status}</span>
          </div>
        </div>
        <p className="small" style={{ marginBottom: 0 }}>
          Required: <strong>fire-rated cable Type A</strong> (Contract §4.2) for riser run R-1.
        </p>
        {action.status === "Awaiting human approval" && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            The action packet has not been approved yet. You can still run a check.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Submit a fix photo</h2>
        <div className="row">
          <button className="btn" disabled={busy} onClick={() => check(IMAGES.fixPhoto)}>
            Use sample fix photo (after correction)
          </button>
          <button className="btn ghost" disabled={busy} onClick={() => check(IMAGES.photo12)}>
            Use sample: cable not replaced
          </button>
          <button className="btn ghost" disabled={busy} onClick={() => input.current?.click()}>
            Upload a photo…
          </button>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files)} />
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          Mock mode cannot read uploaded images, so an upload returns “needs human review” instead of a guess.
        </p>
      </div>

      {latest && shownMask && (
        <div className="card">
          <div className="spread">
            <h2 style={{ margin: 0 }}>Result</h2>
            <div className="row">
              <span className={`badge verdict-${latest.verdict}`}>{VERDICT_TEXT[latest.verdict]}</span>
              <ConfidenceBadge confidence={latest.confidence} />
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 14 }}>
            <div>
              <p className="section-label" style={{ marginTop: 0 }}>Original evidence — Site Photo 12</p>
              {original && <MaskView mask={original} tone="bad" />}
            </div>
            <div>
              <p className="section-label" style={{ marginTop: 0 }}>Fix photo — {latest.image}</p>
              <MaskView mask={shownMask} tone={latest.verdict === "matches_spec" ? "good" : "bad"} />
            </div>
          </div>
          <dl className="kv" style={{ marginTop: 14 }}>
            <dt>Required</dt>
            <dd>{latest.required}</dd>
            <dt>Detected</dt>
            <dd>{latest.detected}</dd>
            <dt>Proof</dt>
            <dd>{latest.proof}</dd>
          </dl>

          {latest.verdict === "matches_spec" && state !== "closed" && (
            <div className="notice" style={{ marginTop: 14, marginBottom: 0 }}>
              <div className="spread">
                <span>The fix matches the spec. CrossSight does not close findings — a reviewer must confirm.</span>
                <button className="btn approve" onClick={closeFinding}>
                  Close finding
                </button>
              </div>
            </div>
          )}
          {latest.verdict === "does_not_match" && (
            <div className="notice warn" style={{ marginTop: 14, marginBottom: 0 }}>
              Finding reopened with new proof. The installed cable still does not match Contract §4.2.
            </div>
          )}
          {latest.verdict === "needs_human_review" && (
            <div className="notice warn" style={{ marginTop: 14, marginBottom: 0 }}>
              Needs human review. No status was changed.
            </div>
          )}
        </div>
      )}

      {results.length > 1 && (
        <div className="card">
          <h2>Check history</h2>
          <ul className="history">
            {results.map((r, i) => (
              <li key={i}>
                {i + 1}. {r.image} — {VERDICT_TEXT[r.verdict]} ({r.detected})
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
