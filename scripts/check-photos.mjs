#!/usr/bin/env node
/* ============================================================
   Validate the PICS photo manifest (assets/photos/photos.json).

   Checks:
   - photos.json exists and is valid JSON with a "photos" array
   - each entry has a non-empty string "file"
   - no duplicate "file" values
   - the referenced full AND thumbnail images both exist — matched
     case-sensitively against the real directory listing (macOS is
     case-insensitive, but GitHub Pages runs on case-sensitive Linux,
     so existsSync() alone would hide real 404s)
   - optional "credit"/"alt" are strings; "w"/"h" are positive numbers
   - (warning) images in full/ that aren't listed won't appear in the gallery
   - (warning) uppercase file extensions — a case-sensitivity footgun

   Exits non-zero on any error. Run via:  npm run check:photos
   ============================================================ */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "assets/photos/photos.json");
const FULL = join(ROOT, "assets/photos/full");
const THUMB = join(ROOT, "assets/photos/thumb");
const OK_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const errors = [];
const warnings = [];
let count = 0;

function listing(dir) {
  if (!existsSync(dir)) return new Set();
  return new Set(readdirSync(dir).filter((f) => f !== ".gitkeep" && !f.startsWith(".")));
}

function finish() {
  warnings.forEach((w) => console.warn("  ! " + w));
  if (errors.length) {
    errors.forEach((e) => console.error("  ✗ " + e));
    console.error(`\ncheck-photos FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
    process.exit(1);
  }
  console.log(`check-photos: ${count} photo(s) validated, ${warnings.length} warning(s), 0 errors.`);
  process.exit(0);
}

if (!existsSync(MANIFEST)) {
  errors.push("assets/photos/photos.json is missing.");
  finish();
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
} catch (e) {
  errors.push("photos.json is not valid JSON: " + e.message);
  finish();
}

if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.photos)) {
  errors.push('photos.json must be an object with a "photos" array.');
  finish();
}

count = manifest.photos.length;
const fullSet = listing(FULL);
const thumbSet = listing(THUMB);
const seen = new Map();

manifest.photos.forEach((p, i) => {
  const at = `photos[${i}]`;
  if (!p || typeof p !== "object" || Array.isArray(p)) {
    errors.push(`${at} is not an object.`);
    return;
  }
  if (typeof p.file !== "string" || !p.file.trim()) {
    errors.push(`${at} is missing a non-empty "file".`);
    return;
  }
  const file = p.file;

  if (seen.has(file)) errors.push(`${at} duplicates "${file}" (already at photos[${seen.get(file)}]).`);
  else seen.set(file, i);

  if (!OK_EXT.has(extname(file).toLowerCase())) {
    warnings.push(`${at} "${file}" has an unusual extension for web images.`);
  }
  if (extname(file) !== extname(file).toLowerCase()) {
    warnings.push(`${at} "${file}" has an uppercase extension — prefer lowercase (GitHub Pages is case-sensitive).`);
  }

  // Case-sensitive existence check against the real directory listing.
  if (!fullSet.has(file)) errors.push(`${at} full image not found: assets/photos/full/${file}`);
  if (!thumbSet.has(file)) errors.push(`${at} thumbnail not found: assets/photos/thumb/${file}`);

  if (p.credit != null && typeof p.credit !== "string") errors.push(`${at} "credit" must be a string.`);
  if (p.alt != null && typeof p.alt !== "string") errors.push(`${at} "alt" must be a string.`);
  ["w", "h"].forEach((k) => {
    if (p[k] != null && (typeof p[k] !== "number" || !(p[k] > 0))) {
      warnings.push(`${at} "${k}" should be a positive number.`);
    }
  });
});

// Images present on disk but not referenced won't show up in the gallery.
const referenced = new Set(manifest.photos.map((p) => p && p.file));
for (const f of fullSet) {
  if (OK_EXT.has(extname(f).toLowerCase()) && !referenced.has(f)) {
    warnings.push(`assets/photos/full/${f} is not listed in photos.json (it won't appear) — run "npm run thumbs".`);
  }
}

finish();
