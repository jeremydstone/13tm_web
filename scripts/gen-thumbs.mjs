#!/usr/bin/env node
/* ============================================================
   Thumbnail generator + manifest maintainer for the PICS gallery.

   Reads hi-res images from   assets/photos/full/
   Writes optimized thumbs to  assets/photos/thumb/   (same filenames)
   Updates                     assets/photos/photos.json

   The manifest keeps your hand-edited "credit", "alt", and ORDER intact;
   it only refreshes each photo's width/height and appends entries for
   any new images (with an empty credit, ready for you to fill in).

   Requires macOS `sips` (built in). Run:  npm run thumbs
   ============================================================ */
import {
  readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync, copyFileSync
} from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FULL = join(ROOT, "assets/photos/full");
const THUMB = join(ROOT, "assets/photos/thumb");
const MANIFEST = join(ROOT, "assets/photos/photos.json");
const MAX_EDGE = 1200; // longest side of generated thumbnails (px)
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

if (!existsSync(FULL)) {
  console.error("No source folder at assets/photos/full/ — create it and add hi-res images.");
  process.exit(1);
}
mkdirSync(THUMB, { recursive: true });

function dimensions(file) {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
  return {
    w: Number((/pixelWidth:\s*(\d+)/.exec(out) || [])[1]) || 0,
    h: Number((/pixelHeight:\s*(\d+)/.exec(out) || [])[1]) || 0
  };
}

const sources = readdirSync(FULL)
  .filter((f) => EXTS.has(extname(f).toLowerCase()))
  .sort();

if (!sources.length) {
  console.error("No images found in assets/photos/full/ (jpg, jpeg, png, webp).");
  process.exit(1);
}

let downscaled = 0;
let copied = 0;
const dims = {};
for (const file of sources) {
  const src = join(FULL, file);
  const dst = join(THUMB, file);
  const srcDim = dimensions(src);
  const longest = Math.max(srcDim.w, srcDim.h);
  const stale = !existsSync(dst) || statSync(dst).mtimeMs < statSync(src).mtimeMs;
  if (stale) {
    if (longest > MAX_EDGE) {
      // Only downscale when the image is actually larger than the target.
      execFileSync("sips", ["-Z", String(MAX_EDGE), src, "--out", dst], { stdio: "ignore" });
      downscaled++;
    } else {
      // Already small enough — copy as-is, never upscale a low-res original.
      copyFileSync(src, dst);
      copied++;
    }
  }
  dims[file] = dimensions(dst);
}

// Merge into the manifest, preserving order + user-entered fields.
let manifest = { photos: [] };
if (existsSync(MANIFEST)) {
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, "utf8"));
    if (parsed && Array.isArray(parsed.photos)) manifest = parsed;
  } catch {
    console.warn("photos.json was unreadable — starting a fresh manifest.");
  }
}

const known = new Set(manifest.photos.map((p) => p.file));
for (const p of manifest.photos) {
  if (dims[p.file]) { p.w = dims[p.file].w; p.h = dims[p.file].h; }
}
let added = 0;
for (const file of sources) {
  if (!known.has(file)) {
    manifest.photos.push({ file, credit: "", w: dims[file].w, h: dims[file].h });
    added++;
  }
}

const orphans = manifest.photos.filter((p) => !dims[p.file]).map((p) => p.file);

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

console.log(`thumbs: ${sources.length} image(s) in full/ — ${downscaled} downscaled, ${copied} copied as-is into thumb/`);
console.log(`manifest: ${manifest.photos.length} entr(ies)${added ? `, ${added} newly added` : ""}.`);
if (orphans.length) {
  console.warn(`  ! ${orphans.length} manifest entr(ies) have no matching file in full/: ${orphans.join(", ")}`);
}
