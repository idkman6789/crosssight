// Mock-mode results: fake SAM masks and the two guaranteed findings.
// Only lib/meta.ts reads this file. Confidence numbers here are placeholders.

import { CERT_EXPIRY, IMAGES } from "@/data/atlas";
import type { Finding, SamMask, VerifyResult } from "./types";

export const MOCK_MASKS: Record<string, SamMask> = {
  [IMAGES.sheet7]: {
    image: IMAGES.sheet7,
    regions: [
      { id: "sheet7-r1", label: "riser cable run R-1", prompt: "riser cable run", bbox: [471, 151, 54, 708], confidence: 0.94 },
      { id: "sheet7-r2", label: "cable label R-1 TYPE B", prompt: "cable label", bbox: [569, 405, 177, 29], confidence: 0.9 },
    ],
  },
  [IMAGES.photo12]: {
    image: IMAGES.photo12,
    regions: [
      { id: "photo12-r1", label: "installed riser cable", prompt: "installed riser cable", bbox: [332, 156, 301, 781], confidence: 0.91 },
      { id: "photo12-r2", label: "cable jacket marking TYPE C", prompt: "cable jacket marking", bbox: [491, 487, 28, 83], confidence: 0.88 },
    ],
  },
  [IMAGES.fixPhoto]: {
    image: IMAGES.fixPhoto,
    regions: [
      { id: "fix-r1", label: "installed riser cable", prompt: "installed riser cable", bbox: [475, 23, 26, 977], confidence: 0.92 },
      { id: "fix-r2", label: "cable jacket marking TYPE A", prompt: "cable jacket marking", bbox: [478, 660, 24, 114], confidence: 0.9 },
    ],
  },
};

export const MOCK_FINDINGS: Finding[] = [
  {
    finding_id: "CS-001",
    title: "Riser cable type disagrees across all three sources",
    severity: "High",
    confidence: "high",
    sources: {
      contract: {
        document: "Contract",
        ref: "§4.2 Riser cabling",
        quote: "All riser runs in Project Atlas shall use fire-rated cable Type A.",
      },
      blueprint: {
        document: "Blueprint Sheet 7",
        ref: "Riser run R-1 — mask region sheet7-r1",
        quote: "Riser run R-1 is shown routed with cable Type B. Note on sheet: 'R-1 routing per Rev C.'",
      },
      site_photo: {
        document: "Site Photo 12",
        ref: "Installed cable, riser run R-1 — mask region photo12-r1",
        quote: "Cable installed in riser run R-1 is cable Type C, as shown by its jacket marking in the photo. No change order for a cable substitution is included in the pack.",
      },
    },
    sam_masks: {
      blueprint: { image: IMAGES.sheet7, region_id: "sheet7-r1", label: "riser cable run R-1" },
      site_photo: { image: IMAGES.photo12, region_id: "photo12-r1", label: "installed riser cable" },
    },
    impact: {
      compliance:
        "Contract §4.2 requires fire-rated cable Type A. Sheet 7 routes Type B and Photo 12 shows Type C installed. No change order in the pack authorizes a substitution.",
      cost_schedule_safety:
        "Not estimated. CrossSight gives no cost figure and no safety verdict — flag for the Engineer of Record and a safety officer to review.",
    },
    action_packet: {
      task: "Verify the correct cable type for riser run R-1, then correct the installation or obtain an approved change order.",
      rfi_draft:
        "RFI — Project Atlas, riser run R-1. Contract §4.2 requires fire-rated cable Type A for all riser runs and permits a substitution only by a written change order approved by the Engineer of Record. Blueprint Sheet 7 shows R-1 routed with cable Type B ('R-1 routing per Rev C'), and Site Photo 12 shows cable Type C installed in R-1. No change order for a cable substitution is included in the pack. Please confirm the required cable type for R-1 and whether any approved change order authorizes Type B or Type C.",
      assignee: null,
      deadline: null,
      status: "Awaiting human approval",
    },
  },
  {
    finding_id: "CS-002",
    title: "Riser inspection certificate expired",
    severity: "Medium",
    confidence: "high",
    sources: {
      contract: null,
      blueprint: null,
      site_photo: null,
      certificate: {
        document: "Inspection certificate C-Atlas-014",
        ref: "Expiry date",
        quote: `Expiry: ${CERT_EXPIRY}. Status at audit time: expired.`,
      },
    },
    sam_masks: { blueprint: null, site_photo: null },
    impact: {
      compliance: `Riser inspection certificate C-Atlas-014 is past its ${CERT_EXPIRY} expiry date at the audit run date.`,
      cost_schedule_safety:
        "Not estimated. CrossSight gives no safety verdict — flag for a safety officer to review.",
    },
    action_packet: {
      task: "Renew certificate C-Atlas-014 or schedule a re-inspection of the riser. A human safety officer must approve.",
      rfi_draft: `Request — Project Atlas, certificate C-Atlas-014. The riser inspection certificate in the pack shows an expiry date of ${CERT_EXPIRY} and is expired at the audit run date. Please confirm whether a renewed certificate exists, or schedule a re-inspection of the riser, and add the current certificate to the pack.`,
      assignee: null,
      deadline: null,
      status: "Awaiting human approval",
    },
  },
];

/** Mock verification outcomes, keyed by fix-photo image. */
export const MOCK_VERIFY: Record<string, Omit<VerifyResult, "finding_id" | "image" | "mask">> = {
  [IMAGES.fixPhoto]: {
    required: "Fire-rated cable Type A (Contract §4.2)",
    detected: "Cable Type A — jacket marking in mask region fix-r1",
    verdict: "matches_spec",
    confidence: "high",
    proof: "Installed cable in riser run R-1 reads Type A, which matches Contract §4.2.",
  },
  [IMAGES.photo12]: {
    required: "Fire-rated cable Type A (Contract §4.2)",
    detected: "Cable Type C — jacket marking in mask region photo12-r1",
    verdict: "does_not_match",
    confidence: "high",
    proof: "Installed cable in riser run R-1 still reads Type C. Contract §4.2 requires Type A.",
  },
};
