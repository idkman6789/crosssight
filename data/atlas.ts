// Project Atlas — fictional sample pack. Texts are verbatim from
// crosssight-day1-project-atlas-pack.md. Nothing here is real.

export const FICTIONAL_LABEL = "Fictional sample pack for demo only.";

export const CONTRACT_4_2 =
  "§4.2 Riser cabling. All riser runs in Project Atlas shall use fire-rated cable Type A. No substitution of cable type for riser runs is permitted without a written change order approved by the Engineer of Record.";

export const SHEET_7 =
  "Sheet 7 — Riser diagram, Levels 1–4. Riser run R-1 is shown routed with cable Type B. Note on sheet: 'R-1 routing per Rev C.'";

export const PHOTO_12 =
  "Photo 12 — Riser room, Level 2, dated in-pack. Cable installed in riser run R-1 is cable Type C, as shown by its jacket marking in the photo. No change order for a cable substitution is included in the pack.";

export const CERT_C_ATLAS_014 =
  "Certificate C-Atlas-014 — Riser inspection, Project Atlas. Expiry: 2026-10-17. Status at audit time: expired.";

export const CERT_EXPIRY = "2026-10-17";

export const IMAGES = {
  sheet7: "/pack/sheet-7.png",
  photo12: "/pack/photo-12.png",
  fixPhoto: "/pack/fix-photo.png",
} as const;

export const SAM_PROMPTS: Record<string, string[]> = {
  [IMAGES.sheet7]: ["riser cable run", "cable tray", "cable label"],
  [IMAGES.photo12]: ["installed riser cable", "cable jacket marking"],
  [IMAGES.fixPhoto]: ["installed riser cable", "cable jacket marking"],
};

export const FIX_PHOTO =
  "Fix-verification photo — same riser run after correction, showing the spec-compliant cable installed.";

export type CableType = "A" | "B" | "C";

/**
 * Structured facts read from each item's text above. Change propagation
 * works only from these, so it can never list a document the pack lacks.
 */
export interface PackFacts {
  /** The cable type this item requires (contract) or shows (blueprint, photo). */
  cable_type?: CableType;
  riser_run?: string;
  /** What a certificate covers. */
  covers?: "riser inspection";
  expiry?: string;
}

export interface PackItem {
  id: string;
  kind: "Contract" | "Blueprint" | "Site photo" | "Certificate" | "Schedule" | "Budget";
  title: string;
  image: string | null;
  text: string;
  facts: PackFacts;
}

export const ATLAS_PACK: PackItem[] = [
  { id: "contract-4-2", kind: "Contract", title: "Contract §4.2 — Riser cabling", image: null, text: CONTRACT_4_2, facts: { cable_type: "A" } },
  { id: "sheet-7", kind: "Blueprint", title: "Blueprint Sheet 7 — Riser diagram, L1–L4", image: IMAGES.sheet7, text: SHEET_7, facts: { cable_type: "B", riser_run: "R-1" } },
  { id: "photo-12", kind: "Site photo", title: "Site Photo 12 — Riser room, Level 2", image: IMAGES.photo12, text: PHOTO_12, facts: { cable_type: "C", riser_run: "R-1" } },
  { id: "c-atlas-014", kind: "Certificate", title: "Certificate C-Atlas-014 — Riser inspection", image: null, text: CERT_C_ATLAS_014, facts: { covers: "riser inspection", expiry: CERT_EXPIRY } },
];

/** The fix photo is part of the pack but is submitted on the Verify step, so Upload does not list it. */
export const FIX_PHOTO_ITEM: PackItem = {
  id: "fix-photo",
  kind: "Site photo",
  title: "Fix-verification photo — Riser run R-1, after correction",
  image: IMAGES.fixPhoto,
  text: FIX_PHOTO,
  facts: { cable_type: "A", riser_run: "R-1" },
};

export const FULL_PACK: PackItem[] = [...ATLAS_PACK, FIX_PHOTO_ITEM];

/** Whole days between the expiry date and the audit run date. Never hardcoded. */
export function daysExpired(expiry: string, auditRunAt: Date): number {
  const exp = Date.UTC(...ymd(expiry));
  const run = Date.UTC(auditRunAt.getFullYear(), auditRunAt.getMonth(), auditRunAt.getDate());
  return Math.floor((run - exp) / 86_400_000);
}

function ymd(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m - 1, d];
}
