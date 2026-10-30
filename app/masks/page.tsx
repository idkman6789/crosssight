"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CERT_C_ATLAS_014, CONTRACT_4_2, PHOTO_12, SAM_PROMPTS, SHEET_7 } from "@/data/atlas";
import { crossCheck } from "@/lib/meta";
import { addLedger, updateAudit, useAudit, type AuditState } from "@/lib/store";

import { MaskView, MockTag, NeedsStep } from "../ui";

const CAPTIONS: Record<string, string> = {
  "/pack/sheet-7.png": "Blueprint Sheet 7 — riser diagram",
  "/pack/photo-12.png": "Site Photo 12 — riser room, Level 2",
};

export default function MasksPage() {
  const router = useRouter();
  const audit = useAudit();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  if (!audit.masks) {
    return (
      <>
        <h1>SAM masks</h1>
        <NeedsStep text="No masks yet. Run the audit on the Upload step first." href="/" cta="Go to Upload" />
      </>
    );
  }

  async function runCrossCheck() {
    setRunning(true);
    setError("");
    try {
      const findings = await crossCheck({
        masks: audit.masks!,
        texts: { contract: CONTRACT_4_2, blueprint: SHEET_7, site_photo: PHOTO_12, certificate: CERT_C_ATLAS_014 },
      });
      updateAudit((s) => {
        let next: AuditState = { ...s, findings };
        for (const f of findings) {
          next = addLedger(next, {
            actor: "CrossSight (mock Spark)",
            action: `${f.finding_id} flagged — ${f.severity}: ${f.title}`,
            finding_id: f.finding_id,
          });
        }
        return next;
      });
      router.push("/findings");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRunning(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            SAM masks <MockTag>Mock SAM output</MockTag>
          </h1>
          <p className="lede">
            The same component — riser run R-1 — segmented on the blueprint and in the site photo. Region boxes below are
            recorded mock results, not a live SAM 3.1 call. Click an image to enlarge it.
          </p>
        </div>
        <button className="btn" onClick={runCrossCheck} disabled={running}>
          {running ? "Cross-checking…" : "Run cross-check"}
        </button>
      </div>
      {error && <p className="notice bad">{error}</p>}

      <div className="grid-2">
        {audit.masks.map((mask) => (
          <div className="card" key={mask.image}>
            <div className="panel-head">
              <h2>{CAPTIONS[mask.image] ?? mask.image}</h2>
              <span className="small muted">{mask.regions.length} regions</span>
            </div>
            <MaskView mask={mask} />
            <table className="region-table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Label</th>
                  <th>Prompt</th>
                  <th>bbox (0–1000)</th>
                  <th>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {mask.regions.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td>
                    <td>{r.label}</td>
                    <td className="muted">“{r.prompt}”</td>
                    <td className="mono">{r.bbox.join(", ")}</td>
                    <td>{r.confidence.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="caption">
              Prompts sent: {SAM_PROMPTS[mask.image]?.map((p) => `“${p}”`).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
