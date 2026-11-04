"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { STEPS, TEASERS, stepIndex } from "./steps";

function pageName(pathname: string): string {
  const i = stepIndex(pathname);
  if (i >= 0) return STEPS[i].label;
  return TEASERS.find((t) => t.href === pathname)?.label ?? "CrossSight";
}

/** Small label above every page: where this page sits in the audit. Also sets the tab title. */
export function PageEyebrow() {
  const pathname = usePathname();
  const i = stepIndex(pathname);
  const name = pageName(pathname);

  useEffect(() => {
    document.title = `${name} — Project Atlas — CrossSight`;
  }, [name]);

  const teaser = TEASERS.some((t) => t.href === pathname);
  if (i < 0 && !teaser) return null;
  return (
    <div className="eyebrow">
      {i >= 0 ? `${STEPS[i].group} · Step ${i + 1} of ${STEPS.length}` : "Teaser · mock data"}
    </div>
  );
}

/** Previous and next step, so the flow never dead-ends. */
export function StepFooter() {
  const pathname = usePathname();
  const i = stepIndex(pathname);
  if (i < 0) return null;
  const prev = STEPS[i - 1];
  const next = STEPS[i + 1];
  return (
    <nav className="step-footer" aria-label="Previous and next step">
      {prev ? (
        <Link className="step-link" href={prev.href}>
          <span className="step-link-dir">Previous</span>
          <span>{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="step-link next" href={next.href}>
          <span className="step-link-dir">Next</span>
          <span>{next.label}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
