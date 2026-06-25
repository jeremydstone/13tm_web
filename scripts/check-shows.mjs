#!/usr/bin/env node
/* ============================================================
   Validate the shows data file (data/shows.json).

   This guards the one file a non-developer is most likely to edit, so it
   is strict on purpose. A show is valid only when:
   - the file is valid JSON shaped like { "shows": [ ... ] }, with no other
     top-level fields;
   - each show has a real "date" (YYYY-MM-DD, rejects e.g. 2026-13-40) and a
     non-empty "title";
   - "subtitle" is optional (text);
   - "button" is optional, but if present must be { "url", "text" } — both
     non-empty, and "url" must be a valid http(s) URL;
   - NO unexpected fields appear anywhere (an unknown field means a typo).

   The validation logic is exported as validateShows() so it can be unit-
   tested (see check-shows.test.mjs). Run the file check via:
     npm run check:shows
   ============================================================ */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ALLOWED_TOP = ["shows"];
const ALLOWED_SHOW = ["date", "title", "subtitle", "button"];
const ALLOWED_BUTTON = ["url", "text"];

export function isRealDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function isValidUrl(u) {
  if (typeof u !== "string") return false;
  let url;
  try {
    url = new URL(u);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function unexpectedKeys(obj, allowed) {
  return Object.keys(obj).filter((k) => !allowed.includes(k));
}

/* Validate a parsed shows object. Returns { errors: string[], count: number }.
   Pure (no I/O, no process.exit) so it can be unit-tested. */
export function validateShows(data) {
  const errors = [];

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { errors: ['the file must be a JSON object shaped like { "shows": [ ... ] }.'], count: 0 };
  }

  unexpectedKeys(data, ALLOWED_TOP).forEach((k) =>
    errors.push(`unexpected top-level field "${k}" — the only allowed field is "shows".`)
  );

  if (!Array.isArray(data.shows)) {
    errors.push('"shows" must be a list (array).');
    return { errors, count: 0 };
  }

  data.shows.forEach((s, i) => {
    const where = `shows[${i}]`;
    if (s === null || typeof s !== "object" || Array.isArray(s)) {
      errors.push(`${where} must be an object with at least a "date" and a "title".`);
      return;
    }
    // Friendly label so a non-dev can find the entry without counting indexes.
    const at = typeof s.title === "string" && s.title.trim() ? `${where} ("${s.title}")` : where;

    unexpectedKeys(s, ALLOWED_SHOW).forEach((k) =>
      errors.push(`${at} has an unexpected field "${k}" — probably a typo. Allowed fields: ${ALLOWED_SHOW.join(", ")}.`)
    );

    if (!("date" in s)) errors.push(`${at} is missing "date".`);
    else if (!isRealDate(s.date)) errors.push(`${at} "date" must be a real date in YYYY-MM-DD form (got ${JSON.stringify(s.date)}).`);

    if (!("title" in s)) errors.push(`${at} is missing "title".`);
    else if (typeof s.title !== "string" || !s.title.trim()) errors.push(`${at} "title" must be a non-empty string.`);

    if ("subtitle" in s && typeof s.subtitle !== "string") {
      errors.push(`${at} "subtitle" must be text (a string) when present.`);
    }

    if ("button" in s) {
      const b = s.button;
      if (b === null || typeof b !== "object" || Array.isArray(b)) {
        errors.push(`${at} "button" must be an object with "url" and "text".`);
      } else {
        unexpectedKeys(b, ALLOWED_BUTTON).forEach((k) =>
          errors.push(`${at} button has an unexpected field "${k}" — allowed fields: ${ALLOWED_BUTTON.join(", ")}.`)
        );
        if (typeof b.url !== "string" || !b.url.trim()) errors.push(`${at} button is missing a non-empty "url".`);
        else if (!isValidUrl(b.url)) errors.push(`${at} button "url" is not a valid http(s) URL: ${JSON.stringify(b.url)}.`);
        if (typeof b.text !== "string" || !b.text.trim()) errors.push(`${at} button is missing a non-empty "text".`);
      }
    }
  });

  return { errors, count: data.shows.length };
}

/* ---- CLI: validate the real data/shows.json ---- */
function cli() {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const DATA = join(ROOT, "data/shows.json");

  if (!existsSync(DATA)) {
    console.error("  ✗ data/shows.json is missing.");
    console.error("\ncheck-shows FAILED.");
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(DATA, "utf8"));
  } catch (e) {
    console.error("  ✗ data/shows.json is not valid JSON: " + e.message);
    console.error("    (tip: a stray comma or a missing quote/brace is the usual cause.)");
    console.error("\ncheck-shows FAILED.");
    process.exit(1);
  }

  const { errors, count } = validateShows(parsed);
  if (errors.length) {
    errors.forEach((e) => console.error("  ✗ " + e));
    console.error(`\ncheck-shows FAILED: ${errors.length} problem(s) in data/shows.json.`);
    process.exit(1);
  }
  console.log(`check-shows: ${count} show(s) validated, 0 errors.`);
}

// Run the CLI only when executed directly (not when imported by the test).
if (import.meta.url === pathToFileURL(process.argv[1]).href) cli();
