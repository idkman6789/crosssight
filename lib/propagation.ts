// Change propagation (teaser): change the riser cable spec and list every
// pack item it touches. Pure logic over the fictional pack facts — no Meta
// call, no invented documents, no dollar figures.

import { FULL_PACK, type CableType, type PackItem } from "@/data/atlas";

export type ImpactGroup = "Blueprints" | "Photos" | "Schedule" | "Cost" | "Certification";

export const IMPACT_GROUPS: ImpactGroup[] = ["Blueprints", "Photos", "Schedule", "Cost", "Certification"];

/** What the master spec's demo beat expects. Shown next to what the pack proves. */
export const EXPECTED: Record<ImpactGroup, number> = {
  Blueprints: 3,
  Photos: 2,
  Schedule: 1,
  Cost: 1,
  Certification: 1,
};

export type Effect = "now_conforms" | "now_nonconforming" | "still_nonconforming" | "recheck" | "change_order";

export interface Impact {
  group: ImpactGroup;
  item: PackItem;
  effect: Effect;
  detail: string;
}

export interface Propagation {
  from: CableType;
  to: CableType;
  impacts: Impact[];
  proven: Record<ImpactGroup, number>;
  /** Groups where the pack proves fewer items than expected. */
  short: ImpactGroup[];
}

export function propagate(from: CableType, to: CableType, pack: PackItem[] = FULL_PACK): Propagation {
  const impacts: Impact[] = [];

  for (const item of pack) {
    const shows = item.facts.cable_type;

    if ((item.kind === "Blueprint" || item.kind === "Site photo") && item.facts.riser_run && shows) {
      impacts.push({
        group: item.kind === "Blueprint" ? "Blueprints" : "Photos",
        item,
        ...conformance(item.kind === "Blueprint" ? "Routes" : "Shows installed", shows, from, to, item.facts.riser_run),
      });
    }

    if (item.kind === "Certificate" && item.facts.covers === "riser inspection") {
      impacts.push({
        group: "Certification",
        item,
        effect: "recheck",
        detail: `Covers the riser inspection. The riser must be re-inspected against cable Type ${to}${
          item.facts.expiry ? ` (certificate also expired ${item.facts.expiry})` : ""
        }. Flag for a safety officer.`,
      });
    }

    if (item.kind === "Contract" && shows) {
      const rework = pack
        .filter((p) => p.kind === "Site photo" && p.facts.cable_type && p.facts.cable_type !== to)
        .map((p) => `${p.title.split(" — ")[0]} shows Type ${p.facts.cable_type}`);
      impacts.push({
        group: "Cost",
        item,
        effect: "change_order",
        detail: `§4.2 permits a cable substitution only by a written change order approved by the Engineer of Record. The change order must state the cost${
          rework.length ? `, including rework of installed cable that is not Type ${to} (${rework.join("; ")})` : ""
        }. No dollar figure is estimated here.`,
      });
    }

    if (item.kind === "Schedule") {
      impacts.push({ group: "Schedule", item, effect: "recheck", detail: "Schedule date tied to the riser work." });
    }
  }

  const proven = Object.fromEntries(
    IMPACT_GROUPS.map((g) => [g, impacts.filter((i) => i.group === g).length]),
  ) as Record<ImpactGroup, number>;
  const short = IMPACT_GROUPS.filter((g) => proven[g] < EXPECTED[g]);

  return { from, to, impacts, proven, short };
}

function conformance(
  verb: string,
  shows: CableType,
  from: CableType,
  to: CableType,
  run: string,
): { effect: Effect; detail: string } {
  if (shows === to) {
    return { effect: "now_conforms", detail: `${verb} Type ${shows} on ${run} — now conforms to the new spec.` };
  }
  if (shows === from) {
    return {
      effect: "now_nonconforming",
      detail: `${verb} Type ${shows} on ${run} — conformed to Type ${from}, now nonconforming.`,
    };
  }
  return {
    effect: "still_nonconforming",
    detail: `${verb} Type ${shows} on ${run} — matches neither spec, still nonconforming.`,
  };
}
