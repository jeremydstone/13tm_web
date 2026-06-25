#!/usr/bin/env node
/* ============================================================
   Self-test for the shows validator.

   Proves validateShows() accepts well-formed data and rejects every kind
   of mistake we care about. This keeps the *validator itself* honest, so a
   future change can't silently weaken the protection around data/shows.json.

   Run via:  npm run test:shows
   ============================================================ */
import { validateShows } from "./check-shows.mjs";

const D = "2026-07-18"; // a valid date used throughout

// [ name, data, expectValid ]
const CASES = [
  // -- should PASS --
  ["minimal valid", { shows: [{ date: D, title: "Covington Days Festival" }] }, true],
  ["full valid", { shows: [{ date: D, title: "X", subtitle: "12:00 PM • All ages", button: { url: "https://example.com/info", text: "Tickets" } }] }, true],
  ["empty subtitle string ok", { shows: [{ date: D, title: "X", subtitle: "" }] }, true],
  ["empty shows list ok", { shows: [] }, true],
  ["leap day is valid", { shows: [{ date: "2028-02-29", title: "X" }] }, true],

  // -- should FAIL --
  ["missing date", { shows: [{ title: "X" }] }, false],
  ["missing title", { shows: [{ date: D }] }, false],
  ["blank title", { shows: [{ date: D, title: "   " }] }, false],
  ["wrong date format", { shows: [{ date: "07/18/2026", title: "X" }] }, false],
  ["impossible month/day", { shows: [{ date: "2026-13-40", title: "X" }] }, false],
  ["non-leap Feb 29", { shows: [{ date: "2027-02-29", title: "X" }] }, false],
  ["date not a string", { shows: [{ date: 20260718, title: "X" }] }, false],
  ["unexpected show field (typo)", { shows: [{ date: D, title: "X", tilte: "oops" }] }, false],
  ["button missing url", { shows: [{ date: D, title: "X", button: { text: "Tickets" } }] }, false],
  ["button missing text", { shows: [{ date: D, title: "X", button: { url: "https://a.com" } }] }, false],
  ["button url not a URL", { shows: [{ date: D, title: "X", button: { url: "just some text", text: "Tickets" } }] }, false],
  ["button url not http(s)", { shows: [{ date: D, title: "X", button: { url: "ftp://a.com/x", text: "Tickets" } }] }, false],
  ["button extra field", { shows: [{ date: D, title: "X", button: { url: "https://a.com", text: "T", color: "red" } }] }, false],
  ["button not an object", { shows: [{ date: D, title: "X", button: "https://a.com" }] }, false],
  ["subtitle not a string", { shows: [{ date: D, title: "X", subtitle: 5 }] }, false],
  ["unexpected top-level field", { shows: [], notes: "hello" }, false],
  ["shows not a list", { shows: "nope" }, false],
  ["show is a string", { shows: ["just a string"] }, false],
  ["top level is an array", [{ date: D, title: "X" }], false],
  ["top level is null", null, false],
];

let failed = 0;
for (const [name, data, expectValid] of CASES) {
  const { errors } = validateShows(data);
  const got = errors.length === 0;
  if (got !== expectValid) {
    failed++;
    console.error(`  ✗ ${name}: expected ${expectValid ? "VALID" : "INVALID"}, got ${got ? "VALID" : "INVALID"}`);
    if (errors.length) console.error("      (" + errors.join(" | ") + ")");
  } else {
    console.log(`  ✓ ${name}`);
  }
}

if (failed) {
  console.error(`\ncheck-shows self-test FAILED: ${failed} of ${CASES.length} case(s) behaved wrong.`);
  process.exit(1);
}
console.log(`check-shows self-test: all ${CASES.length} cases passed.`);
