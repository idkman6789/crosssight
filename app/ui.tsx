"use client";

// Small shared UI pieces used across the step pages.

import Link from "next/link";
import { useEffect, useState } from "react";

import { ATLAS_PACK, IMAGE_SIZE } from "@/data/atlas";
import type { Confidence, SamMask, SamRegion, Severity } from "@/lib/types";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge sev-${severity}`}>{severity}</span>;
}

/** Marks any result that comes from mock data rather than a live model call. */
export function MockTag({ children = "Mock data" }: { children?: React.ReactNode }) {
  return <span className="badge mock-tag">{children}</span>;
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
            Close (Esc)
          </button>
        </div>
      )}
    </>
  );
}

/** Static (non-interactive) image with its SAM regions outlined, for the printable packet. */
export function MaskFigure({ mask, highlight, tone }: { mask: SamMask; highlight?: string; tone?: "good" | "bad" }) {
  return <MaskImage mask={mask} highlight={highlight} tone={tone} className="figure" />;
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
          const cls = tone ? ` ${tone}` : "";
          return (
            <g key={r.id}>
              <rect className={`mask-rect-under${cls}`} x={x} y={y} width={w} height={h} vectorEffect="non-scaling-stroke" />
              <rect className={`mask-rect${cls}`} x={x} y={y} width={w} height={h} vectorEffect="non-scaling-stroke" />
            </g>
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

/**
 * Close-up of one SAM region, cropped from the same image the box was drawn on.
 * The crop is padded and widened to a readable shape; the region's own box is drawn inside it.
 */
export function EvidenceCrop({ mask, region, tone, caption }: { mask: SamMask; region: SamRegion; tone?: "good" | "bad"; caption?: string }) {
  const size = IMAGE_SIZE[mask.image];
  if (!size) return null;
  const { w: W, h: H } = size;
  const [x, y, w, h] = region.bbox;
  const px = (x / 1000) * W, py = (y / 1000) * H, pw = (w / 1000) * W, ph = (h / 1000) * H;
  let cw = pw * 1.5, ch = ph * 1.5;
  if (cw / ch < 1) cw = ch;
  else if (cw / ch > 2.2) ch = cw / 2.2;
  cw = Math.min(cw, W);
  ch = Math.min(ch, H);
  const left = Math.min(Math.max(px + pw / 2 - cw / 2, 0), W - cw);
  const top = Math.min(Math.max(py + ph / 2 - ch / 2, 0), H - ch);
  const pos = (v: number, span: number, full: number) => (full - span === 0 ? 0 : (v / (full - span)) * 100);

  return (
    <figure className="crop-fig">
      <div
        className="crop"
        role="img"
        aria-label={`Close-up of ${region.label}`}
        style={{
          aspectRatio: `${cw} / ${ch}`,
          backgroundImage: `url(${mask.image})`,
          backgroundSize: `${(W / cw) * 100}% ${(H / ch) * 100}%`,
          backgroundPosition: `${pos(left, cw, W)}% ${pos(top, ch, H)}%`,
        }}
      >
        <span
          className={`crop-box${tone ? ` ${tone}` : ""}`}
          style={{
            left: `${((px - left) / cw) * 100}%`,
            top: `${((py - top) / ch) * 100}%`,
            width: `${(pw / cw) * 100}%`,
            height: `${(ph / ch) * 100}%`,
          }}
        />
      </div>
      <figcaption className="caption">
        {caption ?? "Close-up"} · {region.label} · <span className="mono">{region.id}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The finding at a glance: what each source says about riser run R-1.
 * Types come from the structured pack facts, so the matrix can only show what the pack contains.
 */
export function ComparisonMatrix() {
  const pick = (id: string) => ATLAS_PACK.find((p) => p.id === id);
  const rows = [
    { item: pick("contract-4-2"), role: "Required", ref: "Contract §4.2" },
    { item: pick("sheet-7"), role: "Drawn", ref: "Blueprint Sheet 7" },
    { item: pick("photo-12"), role: "Installed", ref: "Site Photo 12" },
  ];
  const required = rows[0].item?.facts.cable_type;
  return (
    <div className="matrix" aria-label="Cable type for riser run R-1 by source">
      {rows.map(({ item, role, ref }) => {
        const type = item?.facts.cable_type;
        const differs = role !== "Required" && type !== required;
        return (
          <div key={ref} className={`matrix-cell${differs ? " differs" : ""}`}>
            <span className="matrix-ref">{ref}</span>
            <span className="matrix-type">Type {type}</span>
            <span className="matrix-role">{role}{differs ? " · differs from §4.2" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Time-ordered record of decisions on a finding. Empty until a person (or the mock checker) acts. */
export function ActionHistory({ history }: { history: { at: string; event: string; actor?: string }[] }) {
  if (history.length === 0) {
    return <p className="empty-line">No decisions recorded yet. Every status change is a human click.</p>;
  }
  return (
    <ul className="history">
      {history.map((h, i) => (
        <li key={i}>
          <span className="when">{new Date(h.at).toLocaleString()}</span>
          <span className="who">{h.actor ?? "Human reviewer"}</span>
          <span>{h.event}</span>
        </li>
      ))}
    </ul>
  );
}

export function NeedsStep({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="card">
      <p className="muted">{text}</p>
      <Link className="btn" href={href}>{cta}</Link>
    </div>
  );
}
