// Portfolio teaser: pure aggregation over fictional findings. No Meta call.
// Project status comes from severity counts only.

import { SEVERITY_RANK, type Finding, type Severity } from "./types";

export const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];

export type IssueType = "spec_mismatch" | "expired_certification" | "missing_change_order" | "revision_mismatch";

export const ISSUE_LABEL: Record<IssueType, string> = {
  spec_mismatch: "Spec mismatch (contract vs. drawing vs. site)",
  expired_certification: "Expired certification",
  missing_change_order: "Missing change order",
  revision_mismatch: "Revision mismatch",
};

export interface PortfolioProject {
  id: string;
  name: string;
  kind: string;
}

/** A finding in the exact CS-001 / CS-002 shape, plus which project and issue type it belongs to. */
export interface PortfolioEntry {
  project_id: string;
  issue_type: IssueType;
  finding: Finding;
}

export interface PortfolioData {
  projects: PortfolioProject[];
  entries: PortfolioEntry[];
}

export type ProjectStatus = "On track" | "Needs attention" | "At risk";

export type SeverityCounts = Record<Severity, number>;

export function countBySeverity(entries: PortfolioEntry[]): SeverityCounts {
  const counts: SeverityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const e of entries) counts[e.finding.severity] += 1;
  return counts;
}

/**
 * Status from severity counts only:
 * - At risk: any Critical, or two or more High.
 * - Needs attention: one High, or any Medium.
 * - On track: only Low findings, or none.
 */
export function statusFromCounts(c: SeverityCounts): ProjectStatus {
  if (c.Critical >= 1 || c.High >= 2) return "At risk";
  if (c.High === 1 || c.Medium >= 1) return "Needs attention";
  return "On track";
}

export function mostCommonIssues(entries: PortfolioEntry[]): { types: IssueType[]; count: number } {
  const tally = new Map<IssueType, number>();
  for (const e of entries) tally.set(e.issue_type, (tally.get(e.issue_type) ?? 0) + 1);
  const max = Math.max(0, ...tally.values());
  return { types: [...tally].filter(([, n]) => n === max && max > 0).map(([t]) => t), count: max };
}

export function sortBySeverity(entries: PortfolioEntry[]): PortfolioEntry[] {
  return [...entries].sort(
    (a, b) =>
      SEVERITY_RANK[a.finding.severity] - SEVERITY_RANK[b.finding.severity] ||
      a.finding.finding_id.localeCompare(b.finding.finding_id),
  );
}
