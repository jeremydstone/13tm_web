#!/usr/bin/env node
/* ============================================================
   Validate the shows data file (data/shows.json).

   Checks:
   - exists and is valid JSON with a "shows" array
   - each show has a real "date" in YYYY-MM-DD form (rejects e.g. 2026-13-40)
   - each show has a non-empty string "title"
   - "subtitle" (if present) is a string
   - "button" (if present) is an object with non-empty string "url" and
     "text"; a button missing either is an error. (warning) url should be
     an http(s) link

   Exits non-zero on any error. Run via:  npm run check:shows
   ============================================================ */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data/shows.json");

const errors = [];
const warnings = [];
let count = 0;

function finish() {
  warnings.forEach((w) => console.warn("  ! " + w));
  if (errors.length) {
    errors.forEach((e) => console.error("  ✗ " + e));
    console.error(`\ncheck-shows FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
    process.exit(1);
  }
  console.log(`check-shows: ${count} show(s) validated, ${warnings.length} warning(s), 0 errors.`);
  process.exit(0);
}

function isRealDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

if (!existsSync(DATA)) {
  errors.push("data/shows.json is missing.");
  finish();
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(DATA, "utf8"));
} catch (e) {
  errors.push("shows.json is not valid JSON: " + e.message);
  finish();
}

if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.shows)) {
  errors.push('shows.json must be an object with a "shows" array.');
  finish();
}

count = manifest.shows.length;
manifest.shows.forEach((s, i) => {
  const at = `shows[${i}]`;
  if (!s || typeof s !== "object" || Array.isArray(s)) {
    errors.push(`${at} is not an object.`);
    return;
  }
  if (!isRealDate(s.date)) {
    errors.push(`${at} has an invalid "date" (need a real YYYY-MM-DD): ${JSON.stringify(s.date)}`);
  }
  if (typeof s.title !== "string" || !s.title.trim()) {
    errors.push(`${at} is missing a non-empty "title".`);
  }
  if (s.subtitle != null && typeof s.subtitle !== "string") {
    errors.push(`${at} "subtitle" must be a string.`);
  }
  if (s.button != null) {
    const b = s.button;
    if (typeof b !== "object" || Array.isArray(b)) {
      errors.push(`${at} "button" must be an object with "url" and "text".`);
    } else {
      if (typeof b.url !== "string" || !b.url.trim()) errors.push(`${at} button is missing a non-empty "url".`);
      else if (!/^https?:\/\//i.test(b.url)) warnings.push(`${at} button "url" is not an http(s) link: ${b.url}`);
      if (typeof b.text !== "string" || !b.text.trim()) errors.push(`${at} button is missing non-empty "text".`);
    }
  }
});

finish();
