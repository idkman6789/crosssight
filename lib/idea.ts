// Idea Builder (mock organizer): turns what the user typed into a step-by-step plan.
//
// Nothing here calls a model or any service. The plan is built only from the intake
// form plus fixed process headings. Anything the user did not say is marked
// "Needs your input" — never guessed. No costs, dates, people, or tools are invented.

export type Category = "Construction" | "Business" | "Product" | "Home project" | "Other";
export const CATEGORIES: Category[] = ["Construction", "Business", "Product", "Home project", "Other"];

export type HaveKey = "blueprint" | "contract" | "photos" | "budget" | "team" | "none";
export const HAVE_KEYS: HaveKey[] = ["blueprint", "contract", "photos", "budget", "team", "none"];
export const HAVE_LABEL: Record<HaveKey, string> = {
  blueprint: "Blueprint",
  contract: "Contract",
  photos: "Photos",
  budget: "Budget",
  team: "Team",
  none: "None yet",
};

export interface Intake {
  name: string;
  description: string;
  category: Category;
  success: string;
  deadline: string;
  mustHaves: string;
  /** Optional: tools, materials, and people the user already knows about, one per line. */
  tools: string;
  materials: string;
  people: string;
  have: Record<HaveKey, boolean>;
}

export const EMPTY_INTAKE: Intake = {
  name: "",
  description: "",
  category: "Other",
  success: "",
  deadline: "",
  mustHaves: "",
  tools: "",
  materials: "",
  people: "",
  have: { blueprint: false, contract: false, photos: false, budget: false, team: false, none: false },
};

/** Fictional sample, typed in by the sample button only. No prices, no dates. */
export const SAMPLE_INTAKE: Intake = {
  name: "Small backyard workshop",
  description:
    "I want to build a small backyard workshop where I can keep my tools and work on weekend projects.",
  category: "Construction",
  success: "A finished, dry, lockable workshop where I can store tools and work year-round.",
  deadline: "",
  mustHaves: "Weatherproof roof and walls\nLockable door\nSpace for a workbench\nPower outlet inside, installed by a qualified person",
  tools: "Tape measure\nLevel\nCircular saw\nCordless drill",
  materials: "Treated lumber\nRoofing sheets\nConcrete blocks\nScrews and fasteners",
  people: "Me (lead builder)\nA helper for lifting\nAn electrician for the outlet",
  have: { blueprint: true, contract: false, photos: true, budget: false, team: false, none: false },
};

export interface Step {
  id: string;
  text: string;
  done: boolean;
  /** True while the step is a placeholder the user has not filled in. */
  needs?: boolean;
}
export interface Phase {
  id: string;
  title: string;
  steps: Step[];
}
export interface Tool {
  id: string;
  text: string;
  group: string;
  have: boolean;
  needs?: boolean;
}
export interface Material {
  id: string;
  text: string;
  have: boolean;
  needs?: boolean;
}
export interface Person {
  id: string;
  text: string;
  needs?: boolean;
  review?: boolean;
}
export interface DocItem {
  id: string;
  label: string;
  have: boolean;
  note?: string;
}
export interface Plan {
  generated_at: string;
  intake: Intake;
  phases: Phase[];
  toolGroups: string[];
  tools: Tool[];
  materials: Material[];
  people: Person[];
  documents: DocItem[];
  risks: string[];
}
export interface IdeaState {
  intake: Intake;
  plan: Plan | null;
}

export const EMPTY_IDEA: IdeaState = { intake: EMPTY_INTAKE, plan: null };

export const IDEA_LABEL = "Idea Builder placeholder — mock organizer, no live planning call yet.";
export const NEEDS_INPUT = "Needs your input";
export const NEEDS_REVIEW = "Needs human review";
export const PERMIT_NOTE = "Check with the local authority or a professional — human review required.";

let counter = 0;
export function uid(): string {
  counter += 1;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function split(text: string, pattern: RegExp): string[] {
  return text
    .split(pattern)
    .map((s) => s.trim())
    .filter(Boolean);
}
/** Tools, materials, people: one per line, or separated by commas or semicolons. */
const listOf = (text: string) => split(text, /[\n,;]+/);
/** Must-haves are sentences, so only lines and semicolons separate them. */
const linesOf = (text: string) => split(text, /[\n;]+/);

const step = (text: string, needs = false): Step => ({ id: uid(), text, done: false, ...(needs ? { needs: true } : {}) });

const TOOL_GROUPS: Record<Category, string[]> = {
  Construction: ["Measuring and layout", "Cutting and fastening", "Lifting and access", "Safety equipment"],
  Business: ["Planning tools", "Customer contact tools", "Tracking tools"],
  Product: ["Design tools", "Build tools", "Testing tools"],
  "Home project": ["Measuring tools", "Hand and power tools", "Safety equipment"],
  Other: ["General tools"],
};
export const LISTED_GROUP = "Listed in your idea";

/** Extra checklist headings per category. They are prompts, not claims about the project. */
function categorySteps(category: Category): Record<number, Step[]> {
  switch (category) {
    case "Construction":
      return {
        2: [
          step("Blueprint check: compare the drawing with what you intend to build", true),
          step("Contract check: compare the contract with the drawing", true),
        ],
        3: [step("Materials: confirm the materials list is complete (see Materials)"), step("Tools: confirm every tool is on hand (see Tools)")],
        4: [step("Site photo check: photograph the site before each stage", true)],
        6: [step("Inspection documents: collect the records an inspector will ask for (human review)", true)],
      };
    case "Business":
      return {
        1: [step("Offer: describe what you sell", true), step("Customers: describe who it is for", true)],
        4: [step("Launch steps: list them in order", true)],
        6: [step("Follow-up system: decide how you will follow up with customers", true)],
      };
    case "Product":
      return {
        1: [step("Features: list the must-have features", true)],
        4: [step("Build steps: list them in order", true)],
        5: [step("Testing steps: list how each feature will be tested", true)],
        6: [step("Launch steps: list them in order", true)],
      };
    case "Home project":
      return {
        2: [step("Measurements: take and record them", true)],
        3: [step("Tools: confirm every tool is on hand (see Tools)"), step("Materials: confirm the materials list is complete (see Materials)")],
        5: [step("Safety checks: a qualified person reviews any safety-related work (human review)", true)],
      };
    default:
      return {};
  }
}

export function buildPlan(intake: Intake): Plan {
  const extra = categorySteps(intake.category);
  const mustHaves = linesOf(intake.mustHaves);
  const haveList = (["blueprint", "contract", "photos", "budget", "team"] as HaveKey[]).filter((k) => intake.have[k]);

  const phase1: Step[] = [
    intake.success.trim()
      ? step(`Confirm the goal: ${intake.success.trim()}`)
      : step("Define what success looks like", true),
    ...mustHaves.map((m) => step(`Must-have: ${m}`)),
    ...(mustHaves.length === 0 ? [step("List the must-haves", true)] : []),
    intake.deadline
      ? step(`Confirm the deadline you set: ${intake.deadline}`)
      : step("Decide whether there is a deadline", true),
    step("Decide what is out of scope", true),
    ...(extra[1] ?? []),
  ];

  const phase2: Step[] = [
    haveList.length > 0 && !intake.have.none
      ? step(`Collect the documents you already have: ${haveList.map((k) => HAVE_LABEL[k].toLowerCase()).join(", ")}`)
      : step("Decide which documents you need and where they will come from", true),
    step("Draft a simple schedule with your own dates", true),
    step("Draft a budget with your own numbers", true),
    step(`Permits and approvals: ${PERMIT_NOTE}`, true),
    ...(extra[2] ?? []),
  ];

  // Construction and Home project already carry their own tools and materials headings.
  const phase3: Step[] = [
    ...(extra[3] ?? [
      step("Confirm every tool you need is on hand (see Tools)"),
      step("Confirm the materials you need are on hand (see Materials)"),
    ]),
    step("Line up the people and roles (see People and roles)"),
  ];

  const phase4: Step[] = [
    step("Put the build steps in order", true),
    step("Work in small stages and check each one before the next"),
    ...(extra[4] ?? []),
  ];

  const phase5: Step[] = [
    step("Check each stage against the must-haves"),
    step("Record anything that does not match, then fix it"),
    step("Have a qualified human review any safety-related work (human review required)"),
    ...(extra[5] ?? []),
  ];

  const phase6: Step[] = [
    step("Confirm every must-have is met"),
    intake.success.trim() ? step("Confirm the success you described is true") : step("Define what success looks like, then confirm it", true),
    step("Collect photos and documents as proof"),
    step("A person signs off; record who approved what"),
    ...(extra[6] ?? []),
  ];

  const phases: Phase[] = [
    { id: "p1", title: "Define and scope", steps: phase1 },
    { id: "p2", title: "Plan and documents", steps: phase2 },
    { id: "p3", title: "Gather tools, materials, and people", steps: phase3 },
    { id: "p4", title: "Build in order", steps: phase4 },
    { id: "p5", title: "Check and fix", steps: phase5 },
    { id: "p6", title: "Finish and prove it", steps: phase6 },
  ];

  const groups = TOOL_GROUPS[intake.category];
  const listedTools = listOf(intake.tools);
  const tools: Tool[] = listedTools.map((t) => ({ id: uid(), text: t, group: LISTED_GROUP, have: false }));

  const materials: Material[] = listOf(intake.materials).map((m) => ({ id: uid(), text: m, have: false }));

  const people: Person[] = [
    ...listOf(intake.people).map((p) => ({ id: uid(), text: p })),
    { id: uid(), text: "Who approves this plan", needs: true, review: true },
    { id: uid(), text: "Who reviews any safety-related work", needs: true, review: true },
  ];

  const documents: DocItem[] = [
    { id: "blueprint", label: "Blueprint", have: intake.have.blueprint },
    { id: "contract", label: "Contract", have: intake.have.contract },
    { id: "photos", label: "Photos", have: intake.have.photos },
    { id: "schedule", label: "Schedule", have: false },
    { id: "budget", label: "Budget", have: intake.have.budget },
    { id: "permits", label: "Permits", have: false, note: PERMIT_NOTE },
  ];

  const risks: string[] = [
    "Anything marked Needs your input is unknown. Fill it in before you start.",
    "No costs, dates, people, or tools were filled in for you. Only what you typed is shown.",
    `Permits or approvals may apply. ${PERMIT_NOTE}`,
    "If two documents disagree, for example a drawing and a contract, run the audit before building.",
  ];
  if (intake.category === "Construction" || intake.category === "Home project") {
    risks.push("Safety-related work should be reviewed by a qualified person. CrossSight does not give safety verdicts.");
  }
  if (!intake.deadline) risks.push("No deadline was given, so nothing in the plan is scheduled.");
  if (mustHaves.length === 0) risks.push("No must-haves were given, so there is nothing to check the result against yet.");

  return {
    generated_at: new Date().toISOString(),
    intake,
    phases,
    toolGroups: [LISTED_GROUP, ...groups],
    tools,
    materials,
    people,
    documents,
    risks,
  };
}

// ---------- derived views ----------

export function allSteps(plan: Plan): Step[] {
  return plan.phases.flatMap((p) => p.steps);
}

export function progress(steps: Step[]): { done: number; total: number; pct: number } {
  const done = steps.filter((s) => s.done).length;
  return { done, total: steps.length, pct: steps.length === 0 ? 0 : Math.round((done / steps.length) * 100) };
}

/** The first three unchecked steps, in plan order. */
export function nextActions(plan: Plan): { phase: string; step: Step }[] {
  return plan.phases
    .flatMap((p) => p.steps.map((s) => ({ phase: p.title, step: s })))
    .filter((x) => !x.step.done)
    .slice(0, 3);
}

/** Everything the user has not answered yet. */
export function questionsFor(plan: Plan): string[] {
  const i = plan.intake;
  const q: string[] = [];
  if (!i.name.trim()) q.push("What is the idea called?");
  if (!i.description.trim()) q.push("What do you want to build, in your own words?");
  if (!i.success.trim()) q.push("What does success look like?");
  if (!i.deadline.trim()) q.push("Is there a deadline? None was given.");
  if (linesOf(i.mustHaves).length === 0) q.push("What are the must-haves?");
  if (plan.tools.filter((t) => !t.needs).length === 0) q.push("Which tools do you need, or already have?");
  if (plan.materials.filter((m) => !m.needs).length === 0) q.push("Which materials do you need?");
  if (listOf(i.people).length === 0) q.push("Which people and roles are involved?");
  if (i.category === "Other") q.push("Which category fits? No category-specific checklist was added.");
  if (i.have.none || !(i.have.blueprint || i.have.contract || i.have.photos || i.have.budget || i.have.team)) {
    q.push("Which documents do you have? None were selected.");
  }
  q.push("What is the budget? Enter your own numbers; CrossSight does not estimate costs.");
  q.push(`Which permits or approvals apply? ${PERMIT_NOTE}`);
  q.push(`Who reviews and approves the plan? ${NEEDS_REVIEW}.`);
  const open = allSteps(plan).filter((s) => s.needs).length;
  if (open > 0) q.push(`${open} step${open === 1 ? " is" : "s are"} marked ${NEEDS_INPUT}.`);
  return q;
}

export function hasDocuments(intake: Intake): boolean {
  return intake.have.blueprint || intake.have.contract || intake.have.photos;
}

export function buildExport(idea: IdeaState) {
  const plan = idea.plan;
  return {
    label: IDEA_LABEL,
    notice: "Built only from what was typed into the form. Anything missing is marked Needs your input. No costs, dates, or approvals are included.",
    exported_at: new Date().toISOString(),
    intake: idea.intake,
    progress: plan ? progress(allSteps(plan)) : null,
    next_actions: plan ? nextActions(plan).map((n) => ({ phase: n.phase, step: n.step.text })) : [],
    questions: plan ? questionsFor(plan) : [],
    plan,
  };
}
