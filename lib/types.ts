// Shared shapes for CrossSight. Findings use the Day 1 schema plus the
// master-spec `deadline` field. Findings are structured data only.

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Confidence = "high" | "medium" | "low";

export const SEVERITY_RANK: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** One citation: the document, the exact place in it, and the quoted text. */
export interface Source {
  document: string;
  ref: string;
  quote: string;
}

/** One SAM region. bbox is [x, y, w, h] in 0–1000 image coordinates. */
export interface SamRegion {
  id: string;
  label: string;
  prompt: string;
  bbox: [number, number, number, number];
  confidence: number;
}

export interface SamMask {
  image: string;
  regions: SamRegion[];
}

/** Points a finding at one region of one mask. */
export interface MaskRef {
  image: string;
  region_id: string;
  label: string;
}

export interface ActionPacket {
  task: string;
  rfi_draft: string;
  /** null until a human assigns it. */
  assignee: string | null;
  /** null until a human sets it. CrossSight never invents a date. */
  deadline: string | null;
  /** The AI only ever emits this status. Humans change it in the UI. */
  status: "Awaiting human approval";
}

export interface Finding {
  finding_id: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  sources: {
    contract: Source | null;
    blueprint: Source | null;
    site_photo: Source | null;
    /** Additive key: CS-002 cites a certificate, which has no other slot. */
    certificate?: Source | null;
  };
  sam_masks: {
    blueprint: MaskRef | null;
    site_photo: MaskRef | null;
  };
  impact: {
    compliance: string;
    cost_schedule_safety: string;
  };
  action_packet: ActionPacket;
}

export type HumanStatus =
  | "Awaiting human approval"
  | "Approved"
  | "Dismissed"
  | "Assigned";

export type Verdict = "matches_spec" | "does_not_match" | "needs_human_review";

export interface VerifyResult {
  finding_id: string;
  image: string;
  mask: SamMask;
  required: string;
  detected: string;
  verdict: Verdict;
  confidence: Confidence;
  proof: string;
}
