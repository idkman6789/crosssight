"use client";

// Small shared UI pieces used across the step pages.

import Link from "next/link";
import { useEffect, useState } from "react";

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

/** Image with SAM regions outlined. bbox coordinates are 0–1000. Click to enlarge. */
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
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const view = (extra: string) => (
    <MaskImage mask={mask} highlight={highlight} tone={tone} className={extra} />
  );

  return (
    <>
      <button
        type="button"
        className="mask-open"
        title="Click to enlarge"
        aria-label="Enlarge image"
        onClick={() => setZoom(true)}
      >
        {view(thumb ? "thumb" : "")}
      </button>
      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setZoom(false)}>
          <div onClick={(e) => e.stopPropagation()}>{view("zoomed")}</div>
          <button type="button" className="btn small lightbox-close" onClick={() => setZoom(false)}>
            Close ✕
          </button>
        </div>
      )}
    </>
  );
}

function MaskImage({
  mask,
  highlight,
  tone,
  className,
}: {
  mask: SamMask;
  highlight?: string;
  tone?: "good" | "bad";
  className: string;
}) {
  const regions = highlight ? mask.regions.filter((r) => r.id === highlight) : mask.regions;
  return (
    <div className={`mask-view ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mask.image} alt={`Fictional pack image ${mask.image}`} />
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        {regions.map((r) => {
          const [x, y, w, h] = r.bbox;
          return (
            <rect
              key={r.id}
              className={`mask-rect${tone ? ` ${tone}` : ""}`}
              x={x}
              y={y}
              width={w}
              height={h}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {regions.map((r) => {
        const [x, y] = r.bbox;
        const inside = y < 40;
        return (
          <span
            key={r.id}
            className={`mask-tag${tone ? ` ${tone}` : ""}${inside ? " inside" : ""}`}
            style={{ left: `${x / 10}%`, top: `${y / 10}%` }}
          >
            {r.label}
          </span>
        );
      })}
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
