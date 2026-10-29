"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ATLAS_PACK, IMAGES, SAM_PROMPTS } from "@/data/atlas";
import { runSam } from "@/lib/meta";
import { updateAudit, useAudit } from "@/lib/store";

type Phase = "idle" | "masking" | "done" | "error";

export default function UploadPage() {
  const router = useRouter();
  const audit = useAudit();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const names = Array.from(files, (f) => f.name);
    updateAudit((s) => ({ ...s, uploadedFiles: [...new Set([...s.uploadedFiles, ...names])] }));
  }

  async function runAudit() {
    setPhase("masking");
    setError("");
    try {
      const images = [IMAGES.sheet7, IMAGES.photo12];
      const masks = await Promise.all(images.map((image) => runSam({ image, prompts: SAM_PROMPTS[image] })));
      updateAudit((s) => ({
        ...s,
        auditRunAt: new Date().toISOString(),
        masks,
        findings: null,
        actions: {},
        verifications: {},
        findingState: {},
        specChange: null,
      }));
      setPhase("done");
      router.push("/masks");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  return (
    <>
      <h1>Upload project pack</h1>
      <p className="lede">
        CrossSight cross-checks a project pack — contract, blueprint, site photo — and proves every disagreement
        to the exact clause, sheet region, or photo.
      </p>

      <div
        className={`dropzone${over ? " over" : ""}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <input ref={input} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <strong>Drop the Project Atlas pack here</strong>
        <p className="muted small" style={{ margin: "6px 0 0" }}>
          Mock mode: dropped files are listed, but the audit runs on the built-in fictional Project Atlas pack.
        </p>
        {audit.uploadedFiles.length > 0 && (
          <p className="small" style={{ margin: "10px 0 0" }}>
            Received: {audit.uploadedFiles.join(", ")}
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="spread">
          <h2 style={{ margin: 0 }}>Project Atlas — pack contents</h2>
          <button className="btn" onClick={runAudit} disabled={phase === "masking"}>
            {phase === "masking" ? "Running…" : audit.auditRunAt ? "Re-run audit" : "Run audit"}
          </button>
        </div>
        <ul className="pack-list" style={{ marginTop: 12 }}>
          {ATLAS_PACK.map((item) => (
            <li key={item.id}>
              <span className="kind">{item.kind}</span>
              <span style={{ flex: 1 }}>
                <strong>{item.title}</strong>
                <p className="quote">{item.text}</p>
              </span>
            </li>
          ))}
        </ul>
        <ul className="progress">
          <li className={phase === "masking" ? "running" : phase === "done" || audit.masks ? "done" : ""}>
            1. SAM 3.1 masks Blueprint Sheet 7 and Site Photo 12
          </li>
          <li>2. Muse Spark cross-checks contract vs. blueprint vs. photo (next step)</li>
        </ul>
        {error && <p className="badge status-Dismissed">{error}</p>}
      </div>
    </>
  );
}
