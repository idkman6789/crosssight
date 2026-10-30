"use client";

import Link from "next/link";
import { useState } from "react";

import type { CableType } from "@/data/atlas";
import { EXPECTED, IMPACT_GROUPS, propagate, type Effect, type ImpactGroup } from "@/lib/propagation";
import { updateAudit, useAudit } from "@/lib/store";

import { NeedsStep } from "../ui";

const CURRENT: CableType = "A";

const EFFECT_TEXT: Record<Effect, string> = {
  now_conforms: "Now conforms",
  now_nonconforming: "Now nonconforming",
  still_nonconforming: "Still nonconforming",
  recheck: "Re-check required",
  change_order: "Change order required",
};

const GROUP_UNIT: Record<ImpactGroup, [string, string]> = {
  Blueprints: ["blueprint", "blueprints"],
  Photos: ["photo", "photos"],
  Schedule: ["schedule date", "schedule dates"],
  Cost: ["cost impact", "cost impacts"],
  Certification: ["safety certification", "safety certifications"],
};

const EMPTY_GROUP: Record<ImpactGroup, string> = {
  Blueprints: "No other blueprint in the pack references a riser run.",
  Photos: "No other photo in the pack shows a riser run.",
  Schedule: "The pack contains no schedule, so no schedule date is shown.",
  Cost: "The pack contains no contract cost clause.",
  Certification: "No certificate in the pack covers the riser.",
};

function unit(g: ImpactGroup, n: number) {
  return `${n} ${GROUP_UNIT[g][n === 1 ? 0 : 1]}`;
}

export default function ChangeSpecPage() {
  const audit = useAudit();
  const [to, setTo] = useState<CableType>((audit.specChange?.to as CableType) ?? "B");
  const applied = audit.specChange !== null;

  if (!audit.findings) {
    return (
      <>
        <h1>Change spec</h1>
        <NeedsStep text="Change propagation starts from a finding. Run the audit first." href="/" cta="Go to Upload" />
      </>
    );
  }

  const result = applied ? propagate(CURRENT, audit.specChange!.to as CableType) : null;
  const missing = result?.short.map((g) => unit(g, EXPECTED[g] - result.proven[g])) ?? [];

  function apply() {
    updateAudit((s) => ({ ...s, specChange: { from: CURRENT, to, at: new Date().toISOString() } }));
  }

  function undo() {
    updateAudit((s) => ({ ...s, specChange: null }));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            Change spec <span className="badge conf">Teaser</span>
          </h1>
          <p className="lede">
            Change one spec and list every pack item it touches. Computed from the pack only; nothing is listed that the
            pack does not contain.
          </p>
        </div>
        <Link className="btn" href="/actions">
          Review actions
        </Link>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginTop: 0 }}>Contract §4.2 — Riser cabling</div>
        <p className="spec-line">
          All riser runs in Project Atlas shall use fire-rated cable{" "}
          <span className={`spec-type${applied ? " old" : ""}`}>Type {CURRENT}</span>
          {applied && (
            <>
              <span className="spec-arrow">changed to</span>
              <span className="spec-type new">Type {audit.specChange!.to}</span>
            </>
          )}
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          {applied ? (
            <button className="btn ghost" onClick={undo}>
              Undo change
            </button>
          ) : (
            <>
              <label className="small muted" htmlFor="new-type">
                Change to
              </label>
              <select id="new-type" className="select" value={to} onChange={(e) => setTo(e.target.value as CableType)}>
                <option value="B">Type B</option>
                <option value="C">Type C</option>
              </select>
              <button className="btn" onClick={apply}>
                Apply change
              </button>
            </>
          )}
          <span className="small muted">What-if only — nothing in the pack or the findings is modified.</span>
        </div>
      </div>

      {result && (
        <>
          <div className="impact-summary">
            {IMPACT_GROUPS.map((g) => (
              <div key={g} className={`impact-count${result.proven[g] < EXPECTED[g] ? " short" : ""}`}>
                <strong>
                  {result.proven[g]}
                  <span className="muted"> / {EXPECTED[g]}</span>
                </strong>
                <span>{GROUP_UNIT[g][1]}</span>
              </div>
            ))}
          </div>

          {result.short.length > 0 && (
            <div className="notice warn">
              <strong>Showing proven impacts only.</strong> The pack proves {result.impacts.length} of{" "}
              {Object.values(EXPECTED).reduce((a, b) => a + b, 0)} expected impacts. Not in the pack:{" "}
              {missing.join(", ")}. Nothing is listed that the pack does not contain.
            </div>
          )}

          {IMPACT_GROUPS.map((g) => {
            const items = result.impacts.filter((i) => i.group === g);
            return (
              <div key={g} className="card impact-group">
                <div className="panel-head" style={{ marginBottom: 0 }}>
                  <h2>{g}</h2>
                  <span className="muted small">
                    {items.length} proven · {EXPECTED[g]} expected
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="empty-line" style={{ marginTop: 10 }}>{EMPTY_GROUP[g]}</p>
                ) : (
                  <ul className="impact-list">
                    {items.map((i) => (
                      <li key={i.item.id}>
                        {i.item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="impact-thumb" src={i.item.image} alt={i.item.title} />
                        ) : (
                          <span className="impact-thumb doc">{i.item.kind}</span>
                        )}
                        <span style={{ flex: 1 }}>
                          <span className="row">
                            <strong>{i.item.title}</strong>
                            <span className={`badge effect-${i.effect}`}>{EFFECT_TEXT[i.effect]}</span>
                          </span>
                          <span className="block small">{i.detail}</span>
                          <span className="block small muted">
                            Source: {i.item.kind} · <span className="mono">{i.item.id}</span>
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
