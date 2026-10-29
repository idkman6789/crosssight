# CrossSight x5 — Master Spec (Locked Build)

**Status: LOCKED 2026-10-29, solo, Indie Developer track**
**Theme (one only): Push the Frontier**
**Event: Meta Global AI Developer Hackathon, Oct 26 – Nov 4, 2026**
**Submit by: Wed Nov 4, 2026, 9:00 PM ET**
**Submission link: https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit**

This file is the single source of truth for every Claude Code agent working on CrossSight. If a feature is not in this file, do not build it before Nov 2. Additions are allowed after lock, but only through this spec, and never by breaking a rule below.

## 1. What CrossSight is — keep all of this in the vision

CrossSight is an Enterprise Truth Engine. A big company uploads a project pack — contracts, blueprints, site photos, inspection videos, schedules, budgets, tickets, certifications — and CrossSight finds where they disagree with each other, proves it, and turns it into an action.

It is NOT a document search box (that is VAULT, and that is Basic RAG). It is an audit engine.

Full capability list — preserved in full, even though only the Core is demoed live:

1. **See Everything:** ingest contracts, change orders, RFIs, submittals, permits, blueprints, CAD, specs, manuals, SOPs, site photos, drone/360 photos, CCTV/phone video, schedules, budgets, invoices, tickets, emails, certifications, safety records, inspection reports.
2. **Understand visually:** SAM 3.1 segments blueprint regions and site-photo regions, matches the same component across both, reads labels/nameplates, tracks components across video frames. Muse Image generates clean corrected-detail diagrams and annotated blueprints.
3. **Truth Graph:** every clause, spec, photo, video frame, schedule date, budget line, certification, and person is linked to its source. Ask in plain language, get answers with exact citations: document page, blueprint sheet + region, photo, video timestamp.
4. **Audit automatically:** contract vs. blueprint, blueprint vs. site, spec vs. installed, schedule vs. progress, budget vs. change, safety vs. regulation, certification expiry, version vs. version, document vs. document. Each finding has severity (Critical / High / Medium / Low), confidence, cost/schedule/safety impact, and all sources.
5. **Agent team:** Contract Agent, Blueprint Agent, Site Agent, Safety Agent, Cost Agent, Schedule Agent, plus a Judge Agent that resolves disagreements and only publishes findings with proof.
6. **Act automatically:** every finding becomes a task, an RFI draft, a change-order draft, a notification, or an escalation. Approval workflow: human approves / dismisses / assigns. Fix verification: upload a new photo, SAM verifies it matches the spec, finding closes; if wrong, it reopens with new proof.
7. **Change Propagation:** change one spec/material/date/budget line and instantly list every blueprint, photo, schedule, cost, certification, and safety check affected, with downstream cost and delay.
8. **Living Twin:** daily video/drone/phone walkthrough auto-compared to the blueprint, progress % verified from what the camera sees, safety hazards flagged as the camera moves, multilingual voice + photo findings from field workers.
9. **Portfolio:** Portfolio Risk Dashboard ranking all projects by risk, Contractor Scorecard, Supplier Risk, Pattern Alerts ("this mistake happened on 4 other projects"), Executive View, and forecasting of delay / cost overrun / inspection failure with the pattern shown.
10. **Prove Forever:** tamper-evident ledger — every finding, approval, dismissal, and fix timestamped and linked to its exact source. One-click export: court-ready, regulator-ready, insurance-ready, auditor-ready packet.
11. **Learn from corrections:** a dismissed finding teaches the rule, company-specific rules build per project, template packs per industry (construction, data centers, energy, manufacturing, pharma, logistics, infrastructure, mining).
12. **Enterprise fit:** roles/permissions (owner, PM, engineer, safety, QA, contractor, auditor), audit log, redaction, private/VPC pilot option, SSO (roadmap), integrations with Procore, Autodesk, SharePoint, SAP (roadmap — CrossSight sits on top, it does not replace them).

Guardrails that make it sellable — never remove these:
- Flags risks for an engineer/lawyer/safety officer to review. It does NOT give legal advice and does NOT auto-approve safety work.
- Human approval is required for every safety/compliance decision.
- Every finding shows confidence. Low-confidence findings say "needs human review" — never a confident fake.
- No real company data in the demo. Fictional pack only, clearly labeled.

## 2. Rules compliance — non-negotiable

From the Discord rules provided 2026-10-29. Breaking these can disqualify the project.

- **New work only, Oct 26 – Nov 4:** All code, features, and functionality presented must be built during the event. Fresh repo started for CrossSight. Do NOT copy in the pre-Oct 26 CRM demo, Elite Roofing demo, or saas-crm architecture, and do NOT copy Luke's VAULT repo, roadmap, or code. Standard frameworks (Next.js, Supabase, Vercel) are tools, not the project.
- **Identify contributions:** README must have a "Built During Hackathon" section: solo entrant, Indie track, built Oct 29 – Nov 4, 2026, built with Claude Code as a coding tool directed and verified by the solo entrant, what was built, and what is fictional sample data. Demo video must show only features built during the event.
- **Public repo:** Repo must be public before submission. No private repo.
- **Team/track:** Solo, Indie Developer track only, one submitter. AI agents are tools, NOT team members — do not list them as team members.
- **Demo video: 3 minutes, required, main scoring item.** Target 2:50–3:00. Never over 3:00.
- **Banned / generic:** No illegal, unethical, or platform-violating content. No code, data, or assets without rights. Avoid generic categories: Basic RAG apps, Simple image analyzers, AI medical/health advice, education chatbots, job screeners, nutrition coaches, personality analyzers, sports analyzers/coaches. CrossSight must NOT be demoed as "upload a doc, ask a question" (RAG) or "upload a photo, describe it" (simple analyzer). Demo order is masks → cross-check → finding → action → verification.
- **Theme fit:** Push the Frontier only. Models: Muse Spark, SAM 3.1 (SAM 3 family), Muse Image via the Meta Model API. Spark + SAM must be load-bearing — remove them and the product collapses. Do not present a model-swappable chatbot.
- **Fictional data only:** All sample contracts, blueprints, and photos are created for this demo. No real Meta, contractor, or client documents. Label "Fictional sample pack for demo only" in the demo, README, and submission.
- **Age/eligibility:** Entrant is 18+. No Meta/CV staff affiliation claimed.

## 3. Hackathon Core — what is actually built and demoed live

Everything in Section 1 is the vision. Only this is built and shown as working by Nov 2:

**One audit only: Contract vs. Blueprint vs. Site Photo.**

Flow:
1. Upload Project Atlas pack (see Section 4).
2. SAM 3.1 masks the blueprint region and the site-photo region for the same component.
3. Muse Spark cross-checks contract clause vs. blueprint spec vs. site photo, returns structured findings only: finding, severity, confidence, cost/schedule/safety impact, citations (exact clause, sheet + region, photo).
4. Findings page shows masks side by side, severity ranking, and proof.
5. Action packet: task + RFI draft + assignee + deadline. Human taps Approve / Dismiss / Assign.
6. Fix verification: upload a new photo, SAM checks it against the spec, finding closes or reopens with new proof.
7. Muse Image: one corrected-detail diagram for the main finding.

**Working teasers (only if actually working, even in limited form):**
- One video walkthrough clip, keyframes only, compared to a blueprint.
- One portfolio dashboard reading fictional findings data.
- One ledger export (PDF packet with masks, citations, approval history).

**Roadmap only (README future work, NOT presented as working in the video):**
Full living twin, full portfolio learning, integrations, enterprise SSO/VPC, all other industries and audit types. If a teaser is not working, cut it from the video and put it here.

## 4. Fictional sample pack — Project Atlas (guaranteed findings)

Project name: Project Atlas — fictional data center build. Label everywhere: "Fictional sample pack for demo only."

- **Contract §4.2:** Fire-rated cable Type A required for all riser runs.
- **Blueprint Sheet 7:** Shows Type B cable routing for the same riser run.
- **Site Photo 12:** Shows Type C cable actually installed in that riser run.
- **Finding 1 (High, compliance):** Contract §4.2 vs. Blueprint Sheet 7 vs. Photo 12 — three sources disagree. SAM masks: blueprint cable region + photo cable region, side by side.
- **Finding 2 (Medium):** Inspection certificate expired 12 days ago (fictional date in pack).
- **Change Propagation demo:** Change spec Type A → Type B live, show downstream impacts: 3 blueprints, 2 photos, 1 schedule date, cost impact, 1 safety certification affected.

No other findings are needed for the demo. Two guaranteed findings beat ten flaky ones.

## 5. Tech, budget, and Claude Code rules — smart on every way

**Budget: $150 Meta Model API credits confirmed. Partner credits are NOT counted on.**
- Claude Code Pro pays for coding, not Meta API calls. Use Claude Code heavily, Meta credits sparingly.
- One file only talks to Meta: `lib/meta.ts` (SAM, Spark, Image). No other file calls Meta directly.
- Cache every API result by input hash. Run once, reuse forever.
- Mock mode first: agents build all day with fake masks/findings for $0. Live runs only at checkpoints.
- Video: keyframes only, 1 frame every 5 seconds, never every frame.
- Prompts: tight, structured output only, no long chat loops.
- Realistic total if disciplined: $10–25, leaving $125+ headroom. Waste traps: full video frames, re-running audits on every code change, looping API calls in tests, many Image variants.

**Agent contracts — no agent touches another agent's files:**
- Agent A — SAM: input photo + prompt → output mask JSON + area/count.
- Agent B — Spark: input masks + contract text + blueprint text → output structured findings only, with citations.
- Agent C — UI + Action Packet: input findings JSON → output findings page, approve/dismiss/assign, fix-photo verification.
- Agent D — Demo + Test: fictional pack, teaser dashboard, ledger export, backup video, 10x demo-path testing.
- Master rule: read this spec first. If it is not in this spec, do not build it before Nov 2.

**Reliability fallback, in order:**
1. Live API, if fast.
2. Cached pre-run result, if live is slow.
3. Recorded backup video, if live fails on video day. Disclose pre-run use in the submission if used.

## 6. Schedule — freeze is real

- **Oct 29:** Skeleton + SAM test on 3 fictional photos. Pass = masks clean twice.
- **Oct 30:** Full audit working — contract vs. blueprint vs. site photo, with proof.
- **Oct 31:** Action packet + approval + fix verification working.
- **Nov 1:** Teasers only — one video clip, one fictional portfolio dashboard, one ledger export.
- **Nov 2: FREEZE.** No new features. Test the demo path 10 times, fix only what breaks it.
- **Nov 3:** Video only, 2:50–3:00.
- **Nov 4:** Submit early, before 9:00 PM ET.

If SAM fails on Oct 29, do NOT restart the idea. Pivot inside CrossSight: text + blueprint audit with SAM masks from the pre-run pack. Same demo, same story, no restart.

## 7. Demo video script — 3 minutes

- 0:00–0:15: "Big companies don't lose money because they can't find a document. They lose it because three documents disagree and nobody notices."
- 0:15–0:45: Upload Project Atlas pack. SAM masks blueprint region + site photo region.
- 0:45–1:15: Finding 1 appears: Contract §4.2 vs. Blueprint Sheet 7 vs. Photo 12, severity High, with citations.
- 1:15–1:40: Change Propagation live: change spec, downstream impacts appear.
- 1:40–2:10: Action packet: assign, approve, RFI draft. Fix photo uploaded, finding verifies closed.
- 2:10–2:35: Finding 2: expired certificate. Ledger export packet shown.
- 2:35–2:50: Teaser (only if working): video clip or portfolio dashboard.
- 2:50–3:00: "VAULT finds documents. CrossSight finds mistakes, fixes them, watches the site, and proves it forever." + "Fictional sample pack for demo only."

## 8. Submission checklist — Nov 4, before 9:00 PM ET

- [ ] Public repo link, fresh CrossSight repo only
- [ ] Working demo video link, 2:50–3:00
- [ ] Solo team member added, Indie track only
- [ ] README: Push the Frontier theme, Muse Spark + SAM 3.1 + Muse Image, Built During Hackathon section, fictional data disclaimer, how to run, how to reproduce the demo with the sample pack
- [ ] No old CRM/Elite code, no Luke VAULT code, no real company data, no legal-advice claims
- [ ] Submission via https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit
