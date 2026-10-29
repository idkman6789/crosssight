// Small shared UI pieces used across the step pages.

import Link from "next/link";

import type { Confidence, SamMask, Severity } from "@/lib/types";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge sev-${severity}`}>{severity}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <>
      <span className="badge conf">Confidence: {confidence}</span>
      {confidence === "low" && <span className="badge review">Needs human review</span>}
    </>
  );
}

/** Image with SAM regions outlined. bbox coordinates are 0–1000. */
export function MaskView({
  mask,
  highlight,
  tone,
  thumb,
}: {
  mask: SamMask;
  highlight?: string;
  tone?: "good" | "bad";
  thumb?: boolean;
}) {
  const regions = highlight ? mask.regions.filter((r) => r.id === highlight) : mask.regions;
  return (
    <div className={`mask-view${thumb ? " thumb" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mask.image} alt={`Fictional pack image ${mask.image}`} />
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        {regions.map((r) => {
          const [x, y, w, h] = r.bbox;
          return (
            <g key={r.id}>
              <rect className={`mask-rect${tone ? ` ${tone}` : ""}`} x={x} y={y} width={w} height={h} rx={8} />
              <rect className="mask-tag" x={x} y={Math.max(0, y - 44)} width={Math.max(w, 300)} height={42} rx={6} />
              <text className="mask-tag-text" x={x + 10} y={Math.max(0, y - 44) + 31}>
                {r.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function NeedsStep({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="card">
      <p className="muted" style={{ marginTop: 0 }}>{text}</p>
      <Link className="btn" href={href}>{cta}</Link>
    </div>
  );
}
