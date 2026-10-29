// Mock-mode portfolio: four fictional projects with fictional findings in the
// exact CS-001 / CS-002 shape. Only lib/meta.ts reads this file.
// No dollar figures, no safety verdicts, no legal advice.

import { MOCK_FINDINGS } from "./mock";
import type { IssueType, PortfolioData, PortfolioEntry } from "./portfolio";
import type { Confidence, Finding, Severity, Source } from "./types";

const NO_ESTIMATE = "Not estimated. No safety verdict is given — flag for the responsible engineer to review.";

interface Draft {
  id: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  sources: Finding["sources"];
  compliance: string;
  task: string;
  rfi: string;
}

function finding(d: Draft): Finding {
  return {
    finding_id: d.id,
    title: d.title,
    severity: d.severity,
    confidence: d.confidence,
    sources: d.sources,
    sam_masks: { blueprint: null, site_photo: null },
    impact: { compliance: d.compliance, cost_schedule_safety: NO_ESTIMATE },
    action_packet: {
      task: d.task,
      rfi_draft: d.rfi,
      assignee: null,
      deadline: null,
      status: "Awaiting human approval",
    },
  };
}

const src = (document: string, ref: string, quote: string): Source => ({ document, ref, quote });

function entry(project_id: string, issue_type: IssueType, f: Finding): PortfolioEntry {
  return { project_id, issue_type, finding: f };
}

const [atlasCs001, atlasCs002] = MOCK_FINDINGS;

export const MOCK_PORTFOLIO: PortfolioData = {
  projects: [
    { id: "atlas", name: "Project Atlas", kind: "Fictional data center build" },
    { id: "harbor", name: "Harbor Point", kind: "Fictional port logistics hub" },
    { id: "northgate", name: "Northgate Tower", kind: "Fictional office tower" },
    { id: "riverside", name: "Riverside Depot", kind: "Fictional transit depot" },
  ],
  entries: [
    entry("atlas", "spec_mismatch", atlasCs001),
    entry("atlas", "expired_certification", atlasCs002),

    entry(
      "harbor",
      "spec_mismatch",
      finding({
        id: "CS-101",
        title: "Corridor damper rating differs across specification, drawing, and site",
        severity: "Critical",
        confidence: "high",
        sources: {
          contract: src("Specification", "§7.3 Dampers", "Fire dampers in corridor walls shall be rated 90 minutes."),
          blueprint: src("Sheet M-12", "Corridor damper schedule", "Damper schedule lists 60-minute rated dampers for corridor walls."),
          site_photo: src("Site Photo 4", "Level 3 corridor", "Damper label in the photo reads 60 minutes."),
        },
        compliance: "The specification, the drawing, and the installed damper label do not agree on the rating.",
        task: "Confirm the required damper rating for corridor walls, then correct the drawing or the installation, or obtain an approved change order.",
        rfi: "RFI — Harbor Point, corridor dampers. Specification §7.3 requires 90-minute rated fire dampers in corridor walls. Sheet M-12 lists 60-minute dampers, and Site Photo 4 shows a 60-minute label on the Level 3 corridor damper. Please confirm the required rating.",
      }),
    ),
    entry(
      "harbor",
      "missing_change_order",
      finding({
        id: "CS-102",
        title: "Installed switchgear model differs from drawing with no change order in the pack",
        severity: "High",
        confidence: "medium",
        sources: {
          contract: src("Contract", "§9.1 Equipment substitutions", "Substitutions require a written change order."),
          blueprint: src("Sheet E-03", "Single-line diagram", "Switchgear model SG-200 is shown."),
          site_photo: src("Site Photo 9", "Electrical room", "Nameplate reads model SG-240. No change order is included in the pack."),
        },
        compliance: "The installed model differs from the drawing, and no change order authorizing the substitution is in the pack.",
        task: "Locate any approved change order for the switchgear, or raise an RFI to confirm the required model.",
        rfi: "RFI — Harbor Point, switchgear. Contract §9.1 requires a written change order for equipment substitutions. Sheet E-03 shows model SG-200 and Site Photo 9 shows a model SG-240 nameplate. No change order is in the pack. Please confirm the approved model.",
      }),
    ),
    entry(
      "harbor",
      "expired_certification",
      finding({
        id: "CS-103",
        title: "Crane inspection certificate expired",
        severity: "Medium",
        confidence: "high",
        sources: {
          contract: null,
          blueprint: null,
          site_photo: null,
          certificate: src("Certificate C-Harbor-007", "Expiry date", "Expiry: 2026-09-30. Status at audit time: expired."),
        },
        compliance: "Certificate C-Harbor-007 is past its 2026-09-30 expiry date at the audit run date.",
        task: "Renew certificate C-Harbor-007 or schedule a re-inspection. A human reviewer must approve.",
        rfi: "Request — Harbor Point, certificate C-Harbor-007. The certificate in the pack shows an expiry of 2026-09-30 and is expired. Please confirm whether a renewed certificate exists and add it to the pack.",
      }),
    ),

    entry(
      "northgate",
      "spec_mismatch",
      finding({
        id: "CS-201",
        title: "Door hinge grade differs between contract and drawing",
        severity: "Medium",
        confidence: "medium",
        sources: {
          contract: src("Contract", "§5.4 Door hardware", "Level 2 fire doors shall use Grade 1 hinges."),
          blueprint: src("Sheet A-22", "Door schedule", "Door schedule lists Grade 2 hinges for Level 2 fire doors."),
          site_photo: null,
        },
        compliance: "The contract and the door schedule name different hinge grades. No site photo in the pack shows the installed hinges.",
        task: "Confirm the required hinge grade and update the door schedule or the contract.",
        rfi: "RFI — Northgate Tower, door hardware. Contract §5.4 requires Grade 1 hinges on Level 2 fire doors. Sheet A-22 lists Grade 2. Please confirm the required grade.",
      }),
    ),
    entry(
      "northgate",
      "revision_mismatch",
      finding({
        id: "CS-202",
        title: "Drawing revision differs from the contract exhibit",
        severity: "Low",
        confidence: "high",
        sources: {
          contract: src("Contract", "Exhibit C", "Exhibit C lists Sheet A-05 at Rev B."),
          blueprint: src("Sheet A-05", "Title block", "Title block reads Rev C."),
          site_photo: null,
        },
        compliance: "The contract exhibit and the sheet title block name different revisions.",
        task: "Confirm which revision governs and update the exhibit if needed.",
        rfi: "RFI — Northgate Tower, Sheet A-05. Contract Exhibit C lists Rev B and the sheet title block reads Rev C. Please confirm the governing revision.",
      }),
    ),
    entry(
      "northgate",
      "revision_mismatch",
      finding({
        id: "CS-203",
        title: "Stair detail revision may be out of date",
        severity: "Low",
        confidence: "low",
        sources: {
          contract: src("Contract", "Exhibit C", "Exhibit C lists Sheet A-41 at Rev A."),
          blueprint: src("Sheet A-41", "Title block", "Title block is partly unreadable in the scan; it may read Rev A or Rev B."),
          site_photo: null,
        },
        compliance: "The sheet revision could not be read reliably, so the match with the exhibit is unconfirmed. Needs human review.",
        task: "Obtain a clean copy of Sheet A-41 and check the revision.",
        rfi: "RFI — Northgate Tower, Sheet A-41. The title block in the pack is partly unreadable. Please send a clean copy and confirm the revision.",
      }),
    ),

    entry(
      "riverside",
      "spec_mismatch",
      finding({
        id: "CS-301",
        title: "Signage mounting height differs between specification and drawing",
        severity: "Low",
        confidence: "medium",
        sources: {
          contract: src("Specification", "§3.2 Signage", "Wayfinding signs shall be mounted at 1,500 mm."),
          blueprint: src("Sheet A-31", "Signage elevation", "Elevation notes a mounting height of 1,400 mm."),
          site_photo: null,
        },
        compliance: "The specification and the elevation give different mounting heights.",
        task: "Confirm the mounting height and update the specification or the drawing.",
        rfi: "RFI — Riverside Depot, signage. Specification §3.2 requires 1,500 mm and Sheet A-31 notes 1,400 mm. Please confirm the mounting height.",
      }),
    ),
  ],
};
