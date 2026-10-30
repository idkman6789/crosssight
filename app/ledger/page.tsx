"use client";

import Link from "next/link";
import { useState } from "react";

import { LEDGER_PLACEHOLDER, buildExport, checkChain, shortHash, type LedgerEntry } from "@/lib/ledger";
import { buildPacket } from "@/lib/packet";
import { useAudit } from "@/lib/store";

import { NeedsStep } from "../ui";

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LedgerPage() {
  const audit = useAudit();
  const [tampered, setTampered] = useState(false);

  const entries = audit.ledger ?? [];

  if (entries.length === 0) {
    return (
      <>
        <h1>Ledger</h1>
        <NeedsStep
          text="The ledger records the demo as it happens. Run the audit first."
          href="/"
          cta="Go to Upload"
        />
      </>
    );
  }

  // The tamper demo edits a copy in memory only; the stored ledger is never changed.
  const shown: LedgerEntry[] =
    tampered && entries.length > 1
      ? entries.map((e) => (e.seq === 2 ? { ...e, action: e.action + " (edited)" } : e))
      : entries;
  const chain = checkChain(shown);

  function exportJson() {
    downloadJson(buildExport(entries), "crosssight-ledger-mock.json");
  }

  function exportPacket() {
    downloadJson(buildPacket(audit), "crosssight-atlas-audit-packet-mock.json");
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            Ledger <span className="badge conf">Placeholder</span>
          </h1>
          <p className="lede">
            Every step of the demo, in order, each entry linked to the one before it by a hash.
          </p>
        </div>
        <div className="row">
          <Link className="btn ghost" href="/diagram">
            Corrected detail
          </Link>
          <button className="btn ghost" onClick={exportJson}>
            Export ledger (JSON)
          </button>
          <button className="btn" onClick={exportPacket}>
            Export audit packet (JSON)
          </button>
        </div>
      </div>

      <div className="notice warn">
        <strong>{LEDGER_PLACEHOLDER}</strong> These entries come from this demo session on mock data. The hashes show
        the idea of a tamper-evident chain with a small non-cryptographic function. They are not a cryptographic
        proof system.
      </div>

      <div className="notice warn">
        <strong>Audit packet.</strong> One click downloads CS-001 and CS-002 with their citations, the mock SAM regions
        for Sheet 7 and Photo 12, the human approval history with timestamps, the change-spec note (proven impacts
        only) and this ledger. It is a placeholder for the live export, built from mock data.
      </div>

      <div className="card table-wrap">
        <table className="proj-table ledger-table">
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Time</th>
              <th>Action</th>
              <th>Finding</th>
              <th>Previous hash</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((e) => {
              const broken = !chain.ok && chain.brokenAt !== null && e.seq >= chain.brokenAt;
              return (
                <tr key={e.seq} className={broken ? "ledger-broken" : ""}>
                  <td className="num">{e.seq}</td>
                  <td className="small">{new Date(e.at).toLocaleString()}</td>
                  <td>
                    {e.action}
                    <span className="block small muted">{e.actor}</span>
                  </td>
                  <td>
                    {e.finding_id === "—" ? <span className="muted">—</span> : <strong className="mono">{e.finding_id}</strong>}
                  </td>
                  <td className="mono">{shortHash(e.prev_hash)}</td>
                  <td className="mono">
                    <strong>{shortHash(e.hash)}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="spread">
          <div>
            <span className={`badge ${chain.ok ? "status-Approved" : "state-reopened"}`}>
              {chain.ok ? "Chain intact" : `Chain broken at entry ${chain.brokenAt}`}
            </span>
            <span className="small muted" style={{ marginLeft: 10 }}>
              {chain.ok
                ? `All ${shown.length} entries recompute to their stored hash and link to the entry before.`
                : "The edited entry no longer matches its stored hash, so it and every entry after it fail the check."}
            </span>
          </div>
          {entries.length > 1 && (
            <button className="btn ghost small" onClick={() => setTampered(!tampered)}>
              {tampered ? "Restore entry 2" : "Demo: edit entry 2"}
            </button>
          )}
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          The edit demo changes a copy in memory only. The stored ledger is not touched.
        </p>
      </div>
    </>
  );
}
