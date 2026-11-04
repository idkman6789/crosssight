"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resetAudit, useAudit } from "@/lib/store";

import { GROUPS, STEPS, TEASERS } from "./steps";

export function StepNav({ mode }: { mode: string }) {
  const pathname = usePathname();
  const audit = useAudit();

  const tracked = STEPS.filter((s) => s.done);
  const complete = tracked.filter((s) => s.done!(audit)).length;

  return (
    <nav className="steps" aria-label="Audit steps">
      <div className="progress-meter" aria-label={`${complete} of ${tracked.length} steps complete`}>
        <div className="progress-meter-row">
          <span>Audit progress</span>
          <strong>
            {complete} of {tracked.length}
          </strong>
        </div>
        <div className="progress-meter-bar">
          <span style={{ width: `${(complete / tracked.length) * 100}%` }} />
        </div>
      </div>

      {GROUPS.map((group) => (
        <div key={group}>
          <div className="nav-section">{group}</div>
          <ol>
            {STEPS.map((step, i) => {
              if (step.group !== group) return null;
              const active = pathname === step.href;
              const done = step.done?.(audit) ?? false;
              return (
                <li key={step.href}>
                  <Link href={step.href} className={`step${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
                    <span className={`step-num${done ? " done" : ""}`} title={done ? "Done" : undefined}>
                      {i + 1}
                    </span>
                    <span>
                      <span className="step-label">{step.label}</span>
                      <span className="step-hint">{step.hint}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      <div className="nav-section">Teasers</div>
      {TEASERS.map((t) => (
        <Link key={t.href} href={t.href} className={`step${pathname === t.href ? " active" : ""}`}>
          <span className="step-num">{t.mark}</span>
          <span>
            <span className="step-label">{t.label}</span>
            <span className="step-hint">{t.hint}</span>
          </span>
        </Link>
      ))}

      <div className="sidebar-foot">
        <button className="btn ghost small" onClick={resetAudit}>
          Reset demo
        </button>
        <span className="mode">{mode === "mock" ? "Mock mode — no live Meta calls" : "Live mode"}</span>
      </div>
    </nav>
  );
}
