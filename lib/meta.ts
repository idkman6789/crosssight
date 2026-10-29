"use server";

// The ONLY file in CrossSight that may talk to the Meta Model API
// (SAM 3.1, Muse Spark, Muse Image). Everything else calls these server
// actions. Every result is cached by a hash of its input.
//
// Day 1: mock mode only. Live mode is deliberately not wired, so no Meta
// call can happen by accident. META_MODE=live throws until the checkpoint.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { MOCK_FINDINGS, MOCK_MASKS, MOCK_VERIFY } from "./mock";
import { MOCK_PORTFOLIO } from "./mock-portfolio";
import type { PortfolioData } from "./portfolio";
import type { Finding, SamMask, VerifyResult } from "./types";

type Mode = "mock" | "live";

function mode(): Mode {
  return process.env.META_MODE === "live" ? "live" : "mock";
}

function liveNotWired(op: string): never {
  throw new Error(`META_MODE=live: ${op} is not wired yet. Day 1 runs in mock mode only.`);
}

// ---------- cache by input hash ----------

const CACHE_DIR = path.join(process.cwd(), ".cache", "meta");
const memory = new Map<string, unknown>();

async function cached<T>(op: string, input: unknown, run: () => Promise<T>): Promise<T> {
  const hash = createHash("sha256")
    .update(JSON.stringify({ op, mode: mode(), input }))
    .digest("hex");
  const key = `${op}-${hash.slice(0, 32)}`;

  if (memory.has(key)) return memory.get(key) as T;

  const file = path.join(CACHE_DIR, `${key}.json`);
  try {
    const hit = JSON.parse(await readFile(file, "utf8")) as T;
    memory.set(key, hit);
    return hit;
  } catch {
    // cache miss
  }

  const result = await run();
  memory.set(key, result);
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, JSON.stringify(result, null, 2));
  } catch {
    // read-only filesystem: keep the in-memory copy
  }
  return result;
}

// ---------- public server actions ----------

export async function getMetaMode(): Promise<Mode> {
  return mode();
}

/**
 * Portfolio teaser: fictional findings for four fictional projects.
 * Makes no Meta call in any mode — it only reads the fictional sample data.
 */
export async function getPortfolio(): Promise<PortfolioData> {
  return MOCK_PORTFOLIO;
}

/** SAM 3.1: image + text prompts → mask regions. */
export async function runSam(input: { image: string; prompts: string[] }): Promise<SamMask> {
  return cached("sam", input, async () => {
    if (mode() === "live") liveNotWired("SAM 3.1");
    return MOCK_MASKS[input.image] ?? { image: input.image, regions: [] };
  });
}

/**
 * Muse Spark: masks + source texts → structured findings only.
 * Judge rule: a finding without a citation is never published.
 */
export async function crossCheck(input: {
  masks: SamMask[];
  texts: { contract: string; blueprint: string; site_photo: string; certificate: string };
}): Promise<Finding[]> {
  const findings = await cached("spark-crosscheck", input, async () => {
    if (mode() === "live") liveNotWired("Muse Spark");
    return MOCK_FINDINGS;
  });
  return findings.filter(hasCitation);
}

/** SAM 3.1 on a fix photo, compared against the spec for one finding. */
export async function verifyFix(input: {
  finding_id: string;
  image: string;
  upload?: { name: string; sha256: string };
}): Promise<VerifyResult> {
  return cached("sam-verify", input, async () => {
    if (mode() === "live") liveNotWired("SAM 3.1 fix verification");

    const known = MOCK_VERIFY[input.image];
    if (!input.upload && known) {
      return {
        finding_id: input.finding_id,
        image: input.image,
        mask: MOCK_MASKS[input.image],
        ...known,
      };
    }
    // Mock mode cannot read an uploaded image, so it never guesses.
    return {
      finding_id: input.finding_id,
      image: input.image,
      mask: { image: input.image, regions: [] },
      required: "Fire-rated cable Type A (Contract §4.2)",
      detected: "Unknown — mock mode cannot read uploaded images",
      verdict: "needs_human_review",
      confidence: "low",
      proof: `Uploaded file "${input.upload?.name ?? input.image}" was not analysed. Needs human review.`,
    };
  });
}

function hasCitation(f: Finding): boolean {
  const s = f.sources;
  return Boolean(s.contract || s.blueprint || s.site_photo || s.certificate);
}
