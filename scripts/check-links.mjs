#!/usr/bin/env node
/* ============================================================
   Local link / asset checker.
   Scans every *.html file for local href/src/srcset/<source> and
   verifies the referenced file exists on disk. External URLs
   (http/https/mailto/tel/#anchors/data:) are skipped.
   Exits non-zero if any local reference is broken.
   ============================================================ */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

const ATTR_RE = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const isExternal = (u) =>
  /^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(u) || u.trim() === "";

// Intentionally-pending assets the band will supply later. These are
// allowed to be absent without failing the check.
const IGNORE = new Set([
  "assets/hero.mp4" // SHOWS header background video — drop in when ready
]);

let broken = 0;
let checked = 0;
const files = htmlFiles(ROOT);

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const base = dirname(file);
  let m;
  while ((m = ATTR_RE.exec(html)) !== null) {
    let ref = m[1];
    if (isExternal(ref)) continue;
    // strip query string / hash fragment
    ref = ref.split(/[?#]/)[0];
    if (!ref || IGNORE.has(ref)) continue;
    const target = ref.startsWith("/")
      ? join(ROOT, ref)
      : normalize(join(base, ref));
    checked++;
    if (!existsSync(target)) {
      broken++;
      console.error(
        `  ✗ ${file.replace(ROOT + "/", "")}  ->  ${m[1]}  (missing: ${target.replace(ROOT + "/", "")})`
      );
    }
  }
}

console.log(
  `check-links: scanned ${files.length} HTML file(s), ${checked} local reference(s), ${broken} broken.`
);
if (broken > 0) {
  console.error(`\ncheck-links FAILED: ${broken} broken local reference(s).`);
  process.exit(1);
}
