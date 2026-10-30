"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ATLAS_PACK, IMAGES, SAM_PROMPTS } from "@/data/atlas";
import { runSam } from "@/lib/meta";
import { addLedger, updateAudit, useAudit } from "@/lib/store";

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
      const at = new Date().toISOString();
      updateAudit((s) =>
        addLedger(
          {
            ...s,
            auditRunAt: at,
            masks,
            findings: null,
            actions: {},
            verifications: {},
            findingState: {},
            specChange: null,
            ledger: [],
          },
          { at, actor: "CrossSight (mock SAM)", action: "Audit run on the Project Atlas pack — masks produced", finding_id: "—" },
        ),
      );
      setPhase("done");
      router.push("/masks");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Project pack</h1>
          <p className="lede">
            One audit: Contract vs. Blueprint vs. Site Photo. CrossSight finds where the three disagree and cites the
            exact clause, sheet region, or photo region.
          </p>
        </div>
        <button className="btn" onClick={runAudit} disabled={phase === "masking"}>
          {phase === "masking" ? "Running…" : audit.auditRunAt ? "Re-run audit" : "Run audit"}
        </button>
      </div>

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
        <strong>Add files to the pack</strong>
        <span className="muted small"> · drop files here or click to browse.</span>
        <p className="muted small" style={{ margin: "4px 0 0" }}>
          Mock mode: added files are listed, but the audit runs on the built-in fictional Project Atlas pack.
        </p>
        {audit.uploadedFiles.length > 0 && (
          <p className="small" style={{ margin: "6px 0 0" }}>
            Received: {audit.uploadedFiles.join(", ")}
          </p>
        )}
      </div>

      <div className="card table-wrap">
        <div className="panel-head" style={{ margin: 0, borderRadius: 0 }}>
          <h2>Project Atlas pack contents</h2>
          <span className="small muted">{ATLAS_PACK.length} documents</span>
        </div>
        <table className="cite-table">
          <thead>
            <tr>
              <th className="doc">Type</th>
              <th>Document and text</th>
            </tr>
          </thead>
          <tbody>
            {ATLAS_PACK.map((item) => (
              <tr key={item.id}>
                <td className="doc">{item.kind}</td>
                <td>
                  <strong>{item.title}</strong>
                  <p className="quote">{item.text}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Audit steps</h2>
        <ul className="progress">
          <li className={phase === "masking" ? "running" : phase === "done" || audit.masks ? "done" : ""}>
            1. Mock SAM masks Blueprint Sheet 7 and Site Photo 12
          </li>
          <li>2. Mock cross-check of contract vs. blueprint vs. photo (next step)</li>
        </ul>
        {error && <p className="notice bad" style={{ marginTop: 8, marginBottom: 0 }}>{error}</p>}
      </div>
    </>
  );
}
