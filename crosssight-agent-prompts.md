# CrossSight — Agent Prompts (copy-paste, in order)

**How to use this:** Open your agent in a NEW, EMPTY folder (fresh repo — nothing from before Oct 26). Give it these two files first: `crosssight-master-spec.md` and `crosssight-day1-project-atlas-pack.md`. Then paste Prompt 1. When it finishes, paste Prompt 2. Then Prompt 3. Do not skip mock mode — that's what keeps the $150 credits alive.

---

## PROMPT 1 — Kickoff + mock-mode skeleton (paste first)

> You are building CrossSight, my solo entry for the Meta Global AI Developer Hackathon (Indie track, theme: Push the Frontier only). Read `crosssight-master-spec.md` FIRST — it is the single source of truth. Then read `crosssight-day1-project-atlas-pack.md` for today's work. If anything conflicts, the master spec wins.
>
> HARD RULES — breaking any of these can disqualify the project:
> - Fresh repo only. Do NOT copy in any code from before Oct 26 — no CRM demo, no Elite Roofing demo, no saas-crm architecture, and NO code from Luke's VAULT project.
> - Solo entrant, Indie track. AI agents are tools, not team members — never list them as team members.
> - Only ONE file talks to the Meta Model API: `lib/meta.ts` (SAM 3.1, Muse Spark, Muse Image). No other file calls Meta directly.
> - Cache every API result by input hash. Run once, reuse forever.
> - MOCK MODE FIRST. Build the entire Day 1 skeleton against fake masks and fake findings for $0. Do not call the live Meta API until I say "checkpoint" in a later prompt.
> - Fictional data only. Everything in the demo is the invented Project Atlas pack. Label every screen "Fictional sample pack for demo only." No real company data.
> - This is an AUDIT ENGINE, not a document search box and not a photo describer. Demo order is always: masks → cross-check → finding → action → verification. Never build a chat-box demo path.
> - Findings are structured JSON only — never a free-form paragraph as the finding. Every finding needs: finding_id, title, severity, confidence, citations (exact clause, sheet + region, photo), impact, and an action packet with status "Awaiting human approval." Never invent a dollar figure, never give a safety verdict, never give legal advice. Low-confidence findings must say "needs human review."
>
> TODAY'S BUILD (Day 1, in this order):
> 1. Scaffold a Next.js app with: an upload page for the Project Atlas pack, a SAM mask view, and a findings page shell. Wire it end to end in MOCK MODE using the fake masks and the two guaranteed findings from the Day 1 pack: CS-001 (High — riser cable Type A vs Type B vs Type C across contract §4.2, Blueprint Sheet 7, Site Photo 12) and CS-002 (Medium — inspection certificate C-Atlas-014 expired 2026-10-17; compute days-expired from the audit run date, never hardcode it).
> 2. The findings page must show the masks side by side, severity ranking, and proof citations.
> 3. Build the action packet UI: task + RFI draft + assignee + deadline, with human Approve / Dismiss / Assign buttons. Nothing auto-approves.
> 4. Add a README section titled "Built During Hackathon": solo entrant, Indie track, built Oct 29 – Nov 4, 2026, built with Claude Code as a coding tool directed and verified by the solo entrant, what was built, and what is fictional sample data.
>
> DO NOT BUILD TODAY: portfolio dashboard, living-twin video, ledger export, other industries, other audit types, payments, permissions. Those are roadmap only.
>
> When the mock-mode skeleton runs end to end, stop and report: what runs, the routes, and what is still fake. Wait for my next prompt before touching the live API.

---

## PROMPT 2 — SAM live checkpoint (paste after Prompt 1 finishes — this is where credits get used)

> Checkpoint time. You may now call the live Meta API, ONLY through `lib/meta.ts`, and ONLY for this checkpoint.
>
> Run SAM 3.1 on these 3 fictional Project Atlas photos, TWICE each (repeat run, same photo, same prompt):
> 1. Blueprint Sheet 7 — riser run diagram, cable tray running vertically between floors, cable labels visible. Prompts: "riser cable run", "cable tray", "cable label". Expected mask: the riser cable run region on Sheet 7.
> 2. Site Photo 12 — installed riser cable in a riser shaft / riser room, cable and jacket markings visible. Prompts: "installed riser cable", "cable jacket marking". Expected mask: the installed cable region in Photo 12.
> 3. Fix-verification photo — same riser run after correction, showing the spec-compliant cable installed. Same prompts as Photo 12. Expected mask: the corrected cable region.
>
> Save every mask JSON to cache keyed by input hash. PASS = masks clean TWICE on all 3 photos. If a mask is messy, do NOT invent a finding from it — flag it low-confidence / "needs human review" and fall back to the cached pre-run mask per the master spec fallback chain (live → cached → recorded backup).
>
> Report: for each photo, mask clean or messy on run 1 and run 2, and whether Day 1 passes. Then stop — do not run anything else live until my next prompt.

## PROMPT 3 — Wire the one Spark call (paste after the SAM checkpoint passes)

> Now wire ONE structured Muse Spark call through `lib/meta.ts` only. Input: the cached SAM masks from the checkpoint + the verbatim Project Atlas texts — Contract §4.2 (fire-rated cable Type A required for all riser runs), Blueprint Sheet 7 (riser run R-1 shown with cable Type B, "R-1 routing per Rev C"), Site Photo 12 (riser run R-1 installed with cable Type C, no change order in the pack).
>
> Output must be structured findings only, in the exact shape from the Day 1 pack: CS-001 (High — riser cable type disagrees across all three sources, with contract/blueprint/site-photo citations, SAM mask regions, impact, and an action packet with task + one-paragraph RFI draft + assignee "to be assigned by the human approver" + status "Awaiting human approval") and CS-002 (Medium — certificate C-Atlas-014 expired 2026-10-17, days-expired computed from the audit run date, action packet flagged for a human safety officer to approve, never auto-approved).
>
> Rules: structured output only, no long chat loops. If any citation is missing, the finding is NOT published (Judge rule). No dollar figures, no safety verdicts, no legal advice. Cache the result by input hash. Then stop and report both findings exactly as returned.

## PROMPT 4 — Day 1 done-check (paste when Prompts 1–3 are done)

> Day 1 done-check. Verify and report, honestly, with no invented results:
> 1. Does the app run end to end: upload pack → SAM masks → findings page → action packet (Approve / Dismiss / Assign)?
> 2. Did all 3 SAM photos pass clean twice? If not, which photo failed and what is the fallback?
> 3. Are CS-001 and CS-002 returned as structured JSON with all citations?
> 4. Is `lib/meta.ts` the ONLY file calling Meta? Is every live result cached by input hash?
> 5. Is "Fictional sample pack for demo only" labeled on every screen showing pack data?
>
> List anything that is still fake, broken, or untested. Do not start Day 2 work (full audit polish, action packet + fix verification, teasers) until I say so. Freeze is Nov 2, video is Nov 3, submit before 9:00 PM ET Nov 4.

---

## If SAM fails on Day 1 (do NOT restart the idea)

Paste this instead of panicking:

> SAM did not pass clean twice. Per the master spec, do NOT restart the idea. Pivot inside CrossSight: keep the same demo and story, but run the audit on text + blueprint with SAM masks from the cached pre-run pack. Same findings (CS-001, CS-002), same findings page, same action packet. Report what failed and what the fallback mask source is.
