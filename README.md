# CrossSight

> **Fictional sample pack for demo only.** Project Atlas and every contract clause, blueprint, photo and certificate in this repo are invented for this demo. There is no real company or real data anywhere in it.

**Live demo:** https://crosssight.serenellifranco684.workers.dev/ (mock mode, hosted on Cloudflare Workers)

## What CrossSight is

CrossSight is an audit engine, not a chatbot or a document search box. It runs **one audit**: contract vs. blueprint vs. site photo. It finds where the three disagree and cites the exact clause, blueprint sheet region, or photo region. It then turns each finding into an **action packet** (a task and an RFI draft) that a human approves, dismisses, or assigns. A fix is checked against a new photo, and only a person closes the finding.

CrossSight flags risks for an engineer, lawyer or safety officer to review. It gives no cost figures, no safety verdicts and no legal advice, and it never approves or closes anything on its own. Low-confidence results say "needs human review".

In the sample pack, Contract §4.2 requires fire-rated cable Type A for riser runs. Blueprint Sheet 7 routes Type B for riser R-1, and Site Photo 12 shows Type C installed.

## Built During Hackathon

- **Event:** Meta Global AI Developer Hackathon, built during the event window (Oct 26 to Nov 4, 2026), in a fresh repo.
- **Entrant:** solo, **Indie Developer** track.
- **Theme:** **Push the Frontier** only.
- **Tools:** built with **Claude Code as a coding tool**, directed and verified by the builder. AI agents are tools, not team members.
- **Data:** all demo data is fictional and labeled "Fictional sample pack for demo only."
- **No outside code:** no code from before the event and no code from any other person's project.

## What is in this repo

These routes exist in the code today. Steps 1 to 5 are the core demo flow, in order.

| Step | Route | What it does |
|------|-------|--------------|
| 1 | `/` | **Upload.** The fictional Project Atlas pack. **Run audit** produces the masks. |
| 2 | `/masks` | **Masks.** Riser run R-1 outlined on Blueprint Sheet 7 and Site Photo 12. **Run cross-check** continues. |
| 3 | `/findings` | **Findings.** CS-001 (High) and CS-002 (Medium), with citations, a three-way comparison, region close-ups and impact. |
| | `/change` | Change spec: change §4.2 from Type A to Type B or C and list the pack items it touches (proven impacts only, 5 of 8). |
| 4 | `/actions` | **Actions.** The action packet and RFI draft per finding. Approve, Dismiss and Assign are human decisions with timestamps. |
| 5 | `/verify` | **Verify.** Submit the sample fix photo. A "not replaced" sample reopens the finding. A person clicks **Close finding**. |
| | `/diagram` | Corrected detail: a fixed in-app drawing of R-1 with Type A. Not model-generated. |
| | `/ledger` | Hash-linked audit trail of the demo, with JSON export. The hash is not a cryptographic proof system. |
| | `/packet` | Printable audit packet (save as PDF). Same content as the JSON export. |

Teasers (mock data only):

| Route | What it does |
|-------|--------------|
| `/portfolio` | Four fictional projects with fictional findings, totals by severity, and filters. |
| `/twin` | Living twin: a three-stage timeline of still images (blueprint, site photo, fix photo). Not a live feed. |
| `/idea` | Idea Builder: type an idea you already have and get a step-by-step plan with phases, checklists, tools, materials, people, documents, questions and risks. Uses only what you type; anything missing is marked "Needs your input". Saved in the browser, exportable as JSON, and it points you to the audit when you have documents. |

## Run it locally

Requires Node.js 18.18 or newer (the minimum Next.js 15 supports).

```bash
git clone https://github.com/idkman6789/crosssight.git
cd crosssight
npm install
```

Create your env file. Mock mode (`META_MODE=mock`, the default) never reads the key, so leave the key blank or as the placeholder. Never commit `.env.local`.

```bash
cp .env.example .env.local
```

On Windows Command Prompt use `copy .env.example .env.local` instead.

```bash
npm run build
npm start
```

Open http://localhost:3000. For development you can use `npm run dev`. To check types, run `npm run typecheck`.

## Reproduce the demo

1. Open the app and click **Reset demo** (bottom of the sidebar) so every step starts empty.
2. On **Upload**, click **Run audit**. You land on **Masks**.
3. On **Masks**, check the R-1 boxes on Sheet 7 and Photo 12, then click **Run cross-check**. You land on **Findings**.
4. On **Findings**, you should see:
   - **CS-001, High:** Contract §4.2 requires Type A, Blueprint Sheet 7 shows Type B, Site Photo 12 shows Type C.
   - **CS-002, Medium:** certificate C-Atlas-014 expired on 2026-10-17. The days expired are computed from the audit run date.
5. On **Actions**, set an assignee for CS-001 and click **Assign**, then **Approve** CS-002.
6. On **Verify**, click **Use sample: cable not replaced** (the finding reopens), then **Use sample fix photo** (matches the spec), then **Close finding**. Nothing closes until you click.

## Mock vs. live

**Everything in the app is mock right now.** No Meta API call is made.

- **Mock:** the SAM masks and region boxes, the findings, the fix-photo check, the portfolio, and the ledger and packet content. They come from fixed data in `lib/mock.ts` and `lib/mock-portfolio.ts` and from the demo session saved in your browser. The Idea Builder is a fixed set of rules, not a model.
- **`lib/meta.ts` is the only file that may call Meta.** It runs in mock mode by default and caches every result by input hash. Setting `META_MODE=live` throws "not wired", so no live call can happen by accident.
- **Pending, not working yet:**
  - **SAM 3.1** (live masks). A first live check returned empty results, so it has not passed.
  - **Muse Spark** (live cross-check) is not wired.
  - **Muse Image** (live corrected detail) is not wired.
- The key, when used, goes in `.env.local` as `META_API_KEY` and is read only on the server. `.env.local` is never committed.

## Project structure

- `app/`: one folder per route above, plus the sidebar, top bar and shared UI.
- `lib/`: `meta.ts` (the only Meta entry point), mock data, ledger, packet, change propagation, portfolio, and the Idea Builder rules.
- `data/atlas.ts`: the fictional Project Atlas pack text.
- `public/pack/`: the three fictional pack images (Sheet 7, Photo 12, fix photo).
- `crosssight-master-spec.md`: the build spec.

## Deploy (Cloudflare Workers)

The live demo runs through the OpenNext adapter. No database or environment variables are needed in mock mode.

```bash
npm run cf:preview   # build and run locally in the Workers runtime
npm run cf:deploy    # build and publish (run `npx wrangler login` once)
```

## License and bugs

MIT. See [LICENSE](LICENSE). To report a bug, open an issue at https://github.com/idkman6789/crosssight/issues.

## Troubleshooting

- **Masks or Findings are empty:** run the audit on **Upload** first, then continue to Masks and run the cross-check.
- **The key file is not picked up:** if the file is named `.env.local.txt`, rename it to `.env.local`.
- **The build folder is locked:** stop the dev server (`npm run dev`), then run `npm run build` again.

> **Fictional sample pack for demo only.**
