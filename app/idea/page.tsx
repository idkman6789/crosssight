"use client";

import Link from "next/link";
import { useState } from "react";

import {
  CATEGORIES,
  EMPTY_IDEA,
  HAVE_KEYS,
  HAVE_LABEL,
  IDEA_LABEL,
  LISTED_GROUP,
  NEEDS_INPUT,
  NEEDS_REVIEW,
  SAMPLE_INTAKE,
  allSteps,
  buildExport,
  buildPlan,
  hasDocuments,
  nextActions,
  progress,
  questionsFor,
  uid,
  type Category,
  type HaveKey,
  type IdeaState,
  type Intake,
  type Phase,
  type Plan,
} from "@/lib/idea";
import { updateAudit, useAudit } from "@/lib/store";

import { MockTag } from "../ui";

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Bar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** One add-an-item form: press Enter or click Add. */
function AddRow({ label, placeholder, onAdd }: { label: string; placeholder: string; onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="add-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text.trim());
        setText("");
      }}
    >
      <input aria-label={label} placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" className="btn ghost small">
        Add
      </button>
    </form>
  );
}

function NeedsPill({ review }: { review?: boolean }) {
  return <span className="badge review">{review ? NEEDS_REVIEW : NEEDS_INPUT}</span>;
}

export default function IdeaPage() {
  const audit = useAudit();
  const idea: IdeaState = audit.idea ?? EMPTY_IDEA;
  const { intake, plan } = idea;

  const setIdea = (fn: (i: IdeaState) => IdeaState) => updateAudit((s) => ({ ...s, idea: fn(s.idea ?? EMPTY_IDEA) }));
  const setIntake = (patch: Partial<Intake>) => setIdea((i) => ({ ...i, intake: { ...i.intake, ...patch } }));
  const setPlan = (fn: (p: Plan) => Plan) => setIdea((i) => (i.plan ? { ...i, plan: fn(i.plan) } : i));

  function toggleHave(k: HaveKey) {
    const next = { ...intake.have, [k]: !intake.have[k] };
    if (k === "none" && next.none) HAVE_KEYS.forEach((x) => x !== "none" && (next[x] = false));
    if (k !== "none" && next[k]) next.none = false;
    setIntake({ have: next });
  }

  function organize() {
    setIdea((i) => ({ ...i, plan: buildPlan(i.intake) }));
    setTimeout(() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  const editPhase = (id: string, fn: (p: Phase) => Phase) =>
    setPlan((p) => ({ ...p, phases: p.phases.map((ph) => (ph.id === id ? fn(ph) : ph)) }));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            Idea Builder <span className="badge conf">Teaser</span> <MockTag>Mock organizer</MockTag>
          </h1>
          <p className="lede">
            Write down the idea you already have. CrossSight organizes it into a plan you can follow step by step. It
            uses only what you type; anything you leave out is marked as needing your input.
          </p>
        </div>
      </div>

      <div className="notice warn">
        <strong>{IDEA_LABEL}</strong> Your entries are saved in this browser only. Reset demo clears them. This is a
        planning aid: it gives no cost estimates, no safety verdicts, and no legal advice, and it never approves
        anything.
      </div>

      <div className="card">
        <div className="panel-head">
          <h2>Your idea</h2>
          <button className="btn ghost small" onClick={() => setIntake({ ...SAMPLE_INTAKE, have: { ...SAMPLE_INTAKE.have } })}>
            Load sample idea
          </button>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="idea-name">Idea name</label>
            <input id="idea-name" value={intake.name} onChange={(e) => setIntake({ name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="idea-category">Category</label>
            <select
              id="idea-category"
              className="select"
              value={intake.category}
              onChange={(e) => setIntake({ category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="idea-description">What you want to build, in your own words</label>
          <textarea
            id="idea-description"
            rows={4}
            value={intake.description}
            onChange={(e) => setIntake({ description: e.target.value })}
          />
        </div>

        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="idea-success">What success looks like</label>
            <textarea id="idea-success" rows={3} value={intake.success} onChange={(e) => setIntake({ success: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="idea-musthaves">Must-haves (one per line)</label>
            <textarea
              id="idea-musthaves"
              rows={3}
              value={intake.mustHaves}
              onChange={(e) => setIntake({ mustHaves: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="idea-deadline">Deadline (optional)</label>
            <input id="idea-deadline" type="date" value={intake.deadline} onChange={(e) => setIntake({ deadline: e.target.value })} />
          </div>
          <div className="field">
            <span className="field-label">What you already have</span>
            <div className="check-group">
              {HAVE_KEYS.map((k) => (
                <label key={k} className="check">
                  <input type="checkbox" checked={intake.have[k]} onChange={() => toggleHave(k)} />
                  {HAVE_LABEL[k]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="section-label">Optional: what you already know you need (one per line)</div>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="idea-tools">Tools</label>
            <textarea id="idea-tools" rows={3} value={intake.tools} onChange={(e) => setIntake({ tools: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="idea-materials">Materials</label>
            <textarea id="idea-materials" rows={3} value={intake.materials} onChange={(e) => setIntake({ materials: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="idea-people">People and roles</label>
            <textarea id="idea-people" rows={3} value={intake.people} onChange={(e) => setIntake({ people: e.target.value })} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={organize}>
            Organize my idea
          </button>
          <span className="small muted">
            {plan
              ? "The plan was built from the form when you last clicked. Click again to rebuild it; this replaces any edits to the plan."
              : "Builds a plan from what you typed. Nothing is invented."}
          </span>
        </div>
      </div>

      {plan && (
        <PlanView
          idea={idea}
          plan={plan}
          setPlan={setPlan}
          editPhase={editPhase}
          onExport={() => downloadJson(buildExport(idea), "crosssight-idea-plan-mock.json")}
        />
      )}
    </>
  );
}

function PlanView({
  idea,
  plan,
  setPlan,
  editPhase,
  onExport,
}: {
  idea: IdeaState;
  plan: Plan;
  setPlan: (fn: (p: Plan) => Plan) => void;
  editPhase: (id: string, fn: (p: Phase) => Phase) => void;
  onExport: () => void;
}) {
  const intake = plan.intake;
  const overall = progress(allSteps(plan));
  const next = nextActions(plan);
  const questions = questionsFor(plan);
  const hasDocs = hasDocuments(intake);

  return (
    <div id="plan">
      {hasDocs && (
        <div className="notice">
          <div className="spread" style={{ alignItems: "center" }}>
            <span>
              <strong>You have documents — run the audit next.</strong> The audit checks them against each other.
            </span>
            <Link className="btn small" href="/">
              Check my documents
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <div className="panel-head">
          <h2>Your plan{intake.name.trim() ? `: ${intake.name.trim()}` : ""}</h2>
          <button className="btn ghost small" onClick={onExport}>
            Export plan (JSON)
          </button>
        </div>
        <div className="spread" style={{ alignItems: "center" }}>
          <span>
            <strong>
              {overall.done} of {overall.total}
            </strong>{" "}
            steps done
          </span>
          <span className="muted small">{overall.pct}%</span>
        </div>
        <Bar pct={overall.pct} label="Overall progress" />

        <div className="section-label">Next 3 actions</div>
        {next.length === 0 ? (
          <p className="empty-line">Every step is checked. A person should still review the result.</p>
        ) : (
          <ol className="next-list">
            {next.map(({ phase, step }) => (
              <li key={step.id}>
                <span>{step.text}</span>
                <span className="small muted"> · {phase}</span>
                {step.needs && <> <NeedsPill /></>}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-label" style={{ marginTop: 0 }}>Summary, in your words</div>
          {intake.description.trim() ? (
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{intake.description.trim()}</p>
          ) : (
            <p className="empty-line">
              <NeedsPill /> Describe what you want to build.
            </p>
          )}
          <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Category: {intake.category}
            {intake.deadline ? ` · Deadline you set: ${intake.deadline}` : ""}
          </p>
        </div>
        <div className="card">
          <div className="section-label" style={{ marginTop: 0 }}>Goal: what success looks like</div>
          {intake.success.trim() ? (
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{intake.success.trim()}</p>
          ) : (
            <p className="empty-line">
              <NeedsPill /> Say what success looks like.
            </p>
          )}
        </div>
      </div>

      {plan.phases.map((phase, idx) => {
        const pr = progress(phase.steps);
        return (
          <div className="card" key={phase.id}>
            <div className="panel-head">
              <h2>
                {idx + 1}. {phase.title}
              </h2>
              <span className="small muted">
                {pr.done} of {pr.total} done
              </span>
            </div>
            <Bar pct={pr.pct} label={`${phase.title} progress`} />
            <ul className="items">
              {phase.steps.map((s) => (
                <li key={s.id} className="item">
                  <input
                    type="checkbox"
                    aria-label={`Done: ${s.text}`}
                    checked={s.done}
                    onChange={() =>
                      editPhase(phase.id, (ph) => ({ ...ph, steps: ph.steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) }))
                    }
                  />
                  <input
                    className={`inline${s.done ? " done" : ""}`}
                    aria-label="Step text"
                    value={s.text}
                    onChange={(e) =>
                      editPhase(phase.id, (ph) => ({
                        ...ph,
                        steps: ph.steps.map((x) => (x.id === s.id ? { ...x, text: e.target.value, needs: false } : x)),
                      }))
                    }
                  />
                  {s.needs && <NeedsPill />}
                  <button
                    className="btn ghost small"
                    onClick={() => editPhase(phase.id, (ph) => ({ ...ph, steps: ph.steps.filter((x) => x.id !== s.id) }))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <AddRow
              label={`Add a step to ${phase.title}`}
              placeholder="Add a step"
              onAdd={(text) => editPhase(phase.id, (ph) => ({ ...ph, steps: [...ph.steps, { id: uid(), text, done: false }] }))}
            />
          </div>
        );
      })}

      <div className="card">
        <div className="panel-head">
          <h2>Tools needed</h2>
          <span className="small muted">Grouped. Tick the ones you already have.</span>
        </div>
        {plan.toolGroups.map((group) => {
          const items = plan.tools.filter((t) => t.group === group);
          return (
            <div key={group} className="tool-group">
              <h3>{group}</h3>
              {items.length === 0 ? (
                <p className="empty-line">
                  <NeedsPill /> {group === LISTED_GROUP ? "No tools were listed." : "Add the tools you need for this."}
                </p>
              ) : (
                <ul className="items">
                  {items.map((t) => (
                    <li key={t.id} className="item">
                      <input
                        className="inline"
                        aria-label="Tool"
                        value={t.text}
                        onChange={(e) =>
                          setPlan((p) => ({ ...p, tools: p.tools.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)) }))
                        }
                      />
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={t.have}
                          onChange={() => setPlan((p) => ({ ...p, tools: p.tools.map((x) => (x.id === t.id ? { ...x, have: !x.have } : x)) }))}
                        />
                        I already have this
                      </label>
                      <button className="btn ghost small" onClick={() => setPlan((p) => ({ ...p, tools: p.tools.filter((x) => x.id !== t.id) }))}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <AddRow
                label={`Add a tool to ${group}`}
                placeholder="Add a tool"
                onAdd={(text) => setPlan((p) => ({ ...p, tools: [...p.tools, { id: uid(), text, group, have: false }] }))}
              />
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="panel-head">
          <h2>Materials needed</h2>
          <span className="small muted">Tick the ones you already have.</span>
        </div>
        {plan.materials.length === 0 ? (
          <p className="empty-line">
            <NeedsPill /> No materials were listed.
          </p>
        ) : (
          <ul className="items">
            {plan.materials.map((m) => (
              <li key={m.id} className="item">
                <input
                  className="inline"
                  aria-label="Material"
                  value={m.text}
                  onChange={(e) =>
                    setPlan((p) => ({ ...p, materials: p.materials.map((x) => (x.id === m.id ? { ...x, text: e.target.value } : x)) }))
                  }
                />
                <label className="check">
                  <input
                    type="checkbox"
                    checked={m.have}
                    onChange={() => setPlan((p) => ({ ...p, materials: p.materials.map((x) => (x.id === m.id ? { ...x, have: !x.have } : x)) }))}
                  />
                  I already have this
                </label>
                <button className="btn ghost small" onClick={() => setPlan((p) => ({ ...p, materials: p.materials.filter((x) => x.id !== m.id) }))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <AddRow
          label="Add a material"
          placeholder="Add a material"
          onAdd={(text) => setPlan((p) => ({ ...p, materials: [...p.materials, { id: uid(), text, have: false }] }))}
        />
      </div>

      <div className="card">
        <div className="panel-head">
          <h2>People and roles needed</h2>
        </div>
        <ul className="items">
          {plan.people.map((person) => (
            <li key={person.id} className="item">
              <input
                className="inline"
                aria-label="Person or role"
                value={person.text}
                onChange={(e) =>
                  setPlan((p) => ({ ...p, people: p.people.map((x) => (x.id === person.id ? { ...x, text: e.target.value } : x)) }))
                }
              />
              {person.needs && <NeedsPill review={person.review} />}
              <button className="btn ghost small" onClick={() => setPlan((p) => ({ ...p, people: p.people.filter((x) => x.id !== person.id) }))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <AddRow
          label="Add a person or role"
          placeholder="Add a person or role"
          onAdd={(text) => setPlan((p) => ({ ...p, people: [...p.people, { id: uid(), text }] }))}
        />
      </div>

      <div className="card table-wrap">
        <div className="panel-head" style={{ margin: 0, borderRadius: 0 }}>
          <h2>Documents checklist</h2>
        </div>
        <table className="cite-table">
          <thead>
            <tr>
              <th className="doc">Document</th>
              <th className="ref">Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {plan.documents.map((d) => (
              <tr key={d.id}>
                <td className="doc">{d.label}</td>
                <td className="ref">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={d.have}
                      onChange={() =>
                        setPlan((p) => ({ ...p, documents: p.documents.map((x) => (x.id === d.id ? { ...x, have: !x.have } : x)) }))
                      }
                    />
                    I have this
                  </label>
                </td>
                <td>
                  {d.note ? (
                    <>
                      {d.note} <NeedsPill review />
                    </>
                  ) : d.have ? (
                    <span className="muted">Listed by you.</span>
                  ) : (
                    <span className="muted">Not listed yet.</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="panel-head">
            <h2>Questions and missing information</h2>
          </div>
          <ul className="plain-list">
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="panel-head">
            <h2>Risks and things to check before starting</h2>
          </div>
          <ul className="plain-list">
            {plan.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card bridge">
        <div className="spread" style={{ alignItems: "center" }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>I have blueprints, photos, or a contract — check them</h2>
            <p className="muted" style={{ margin: 0 }}>
              CrossSight will now check your documents against each other for mismatches, just like CS-001, and turn any
              mismatch into an action packet for a human to approve.
            </p>
          </div>
          <Link className="btn" href="/">
            Check my documents
          </Link>
        </div>
      </div>

      <p className="small muted">
        {IDEA_LABEL} Plan generated {new Date(plan.generated_at).toLocaleString()} from the form{idea.intake.name ? "" : " (untitled)"}.
      </p>
    </div>
  );
}
