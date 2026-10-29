# CrossSight — Day 1: Project Atlas pack (ready to hand to Claude Code agents)

**Status:** Companion to the locked master spec
(`crosssight-master-spec.md`, locked 2026-10-29, solo, Indie, Push the Frontier).
This file adds only what Day 1 needs. It does not change the lock, the
frozen core, or any rule in the master spec. If anything here conflicts
with the master spec, the master spec wins.

**Fictional only, everywhere:** Project Atlas, all contract text,
blueprint descriptions, photos, and certificates below are invented for
this demo. Label every screen, README section, and video frame that
shows them: "Fictional sample pack for demo only." No real company data,
no Luke VAULT code, no pre-Oct 26 CRM / Elite code.

## Day 1 pass test (from the master spec, Oct 29)

Skeleton + SAM test on 3 fictional photos. Pass = SAM masks clean
**twice** (repeat run, same photo, same prompt) on all 3 photos.
If a mask is messy, do not invent a finding from it — flag it
low-confidence / needs human review, and fall back to the cached
pre-run mask per the master spec fallback chain (live → cached →
recorded backup).

Mock mode first: agents build all day against fake masks/findings for
$0. Live Meta calls only at the Day 1 checkpoint, cached by input hash,
through `lib/meta.ts` only. Budget guardrail: $150 Meta credits confirmed
only; partner credits are not counted on.

## The 3 photos agents test SAM on

1. **Blueprint Sheet 7 (fictional):** riser run diagram, cable tray
   running vertically between floors, cable labels visible.
   SAM prompts: "riser cable run", "cable tray", "cable label".
   Expected mask: the riser cable run region on Sheet 7.
2. **Site Photo 12 (fictional):** installed riser cable in a riser
   shaft / riser room, cable and jacket markings visible.
   SAM prompts: "installed riser cable", "cable jacket marking".
   Expected mask: the installed cable region in Photo 12.
3. **Fix-verification photo (fictional, for Oct 31):** same riser run
   after correction, showing the spec-compliant cable installed.
   SAM prompts: same as Photo 12. Expected mask: the corrected cable
   region, so the agent can compare it against the spec and close
   Finding 1 — or reopen it with new proof if it still does not match.

## Fictional source texts (copy verbatim into the pack)

### Contract §4.2 — Project Atlas (fictional)

> "§4.2 Riser cabling. All riser runs in Project Atlas shall use
> fire-rated cable Type A. No substitution of cable type for riser runs
> is permitted without a written change order approved by the Engineer
> of Record."

### Blueprint Sheet 7 — Project Atlas (fictional)

> "Sheet 7 — Riser diagram, Levels 1–4. Riser run R-1 is shown routed
> with cable Type B. Note on sheet: 'R-1 routing per Rev C.'"

### Site Photo 12 — Project Atlas (fictional)

> "Photo 12 — Riser room, Level 2, dated in-pack. Cable installed in
> riser run R-1 is cable Type C, as shown by its jacket marking in the
> photo. No change order for a cable substitution is included in the
> pack."

### Inspection certificate — Project Atlas (fictional)

> "Certificate C-Atlas-014 — Riser inspection, Project Atlas.
> Expiry: 2026-10-17. Status at audit time: expired. Do not hardcode
> '12 days ago' in the UI — compute days expired from the audit run
> date, so the number stays true on Nov 2 / Nov 3 as well as Oct 29."

## The two guaranteed findings (Spark output shape)

Spark returns structured findings only — no free-form paragraph as the
finding. Every finding must carry all fields below; if a citation is
missing, the finding is not published (Judge rule in the master spec).

```json
{
  "finding_id": "CS-001",
  "title": "Riser cable type disagrees across all three sources",
  "severity": "High",
  "confidence": "high | medium | low",
  "sources": {
    "contract": "Contract §4.2 — fire-rated cable Type A required for all riser runs",
    "blueprint": "Blueprint Sheet 7 — riser run R-1 shown with cable Type B",
    "site_photo": "Site Photo 12 — riser run R-1 installed with cable Type C"
  },
  "sam_masks": {
    "blueprint_region": "Sheet 7, riser run R-1 mask",
    "site_photo_region": "Photo 12, installed cable mask"
  },
  "impact": {
    "compliance": "Contract and blueprint do not match the installed work",
    "cost_schedule_safety": "State in the finding; do not invent a dollar figure or a safety verdict — flag for an engineer / safety officer to review"
  },
  "action_packet": {
    "task": "Verify correct cable type for riser run R-1 and correct or obtain an approved change order",
    "rfi_draft": "One-paragraph draft RFI asking the Engineer of Record to confirm the required cable type for R-1",
    "assignee": "To be assigned by the human approver",
    "status": "Awaiting human approval"
  }
}
```

Finding 2, same shape, `finding_id: "CS-002"`:
- Title: "Riser inspection certificate expired"
- Severity: Medium
- Sources: Certificate C-Atlas-014, expiry 2026-10-17
- Action packet: task to renew / re-inspect, flagged for a human
  safety officer to approve — never auto-approved by the AI.

## Change-propagation demo (Nov 1 teaser / video beat, not Day 1)

Changing the spec Type A → Type B live must list, from the pack only:
3 blueprints, 2 photos, 1 schedule date, a cost impact, and 1 safety
certification affected. Do not invent additional affected documents
beyond what the pack actually contains; if the count cannot be proven
from the pack, show only the proven subset and say so.

## Day 1 order of work (first 3 actions, in order)

1. Fresh repo only (no old code, no VAULT code). Skeleton: upload pack
   → SAM mask → findings page shell, with mock mode working end to end.
2. SAM live checkpoint: run the 3 photos above, twice each. Save every
   mask JSON to cache by input hash. Pass = clean twice, all 3.
3. Wire one Spark call (structured output only, `lib/meta.ts`) that
   takes the cached masks + the §4.2 / Sheet 7 / Photo 12 texts and
   returns CS-001 in the shape above. No chat-box demo path.

## What is NOT Day 1

No portfolio dashboard, no living-twin video, no ledger export, no
other industries, no other audit types, no payments, no permissions
system. Those are master-spec teasers / roadmap only, and only if
actually working. Freeze is Nov 2; video is Nov 3; submit early,
before 9:00 PM ET on Nov 4, via
https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit
