# 13 Til Midnight — website

Static HTML / CSS / JS site for the band **13 Til Midnight**. No backend, no build
step. Designed to be hosted free on **GitHub Pages** at the custom domain
**13tilmidnight.com**.

## Pages

| File                  | URL         | Page    | Notes |
|-----------------------|-------------|---------|-------|
| `index.html`          | `/`         | SHOWS   | Muted background video hero + logo, upcoming shows, past shows by year |
| `pics/index.html`     | `/pics/`    | PICS    | Masonry photo gallery + lightbox |
| `videos/index.html`   | `/videos/`  | VIDEOS  | Two responsive Vimeo reels |
| `contact/index.html`  | `/contact/` | CONTACT | Booking form (Web3Forms) |
| `epk/index.html`      | `/epk/`     | (unlisted) | Electronic press kit — **not in the nav**; share the direct link with booking parties. `noindex` so it stays out of search. |

Nav order site-wide: **SHOWS · PICS · VIDEOS · CONTACT** (EPK is intentionally not in the nav).

**Clean URLs:** each page (except the root) lives in its own folder as `index.html`, so it's
served at an extension-less path like `/contact/` (a request to `/contact` redirects to it).
All asset/nav links are **root-absolute** (`/css/styles.css`, `/pics/`, …) so they resolve
the same from any page — which means the site must be served from the domain root (it is, via
the custom domain / `CNAME`).

## Run locally

It's just static files, so any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000  (and /pics/, /videos/, /contact/)
```

(Because links are root-absolute and pages use clean URLs, use the local server — opening via
`file://` won't resolve the paths.)

## Tests / linting

The site itself ships no dependencies, but there's dev-only tooling to catch mistakes.
Install once, then run the checks:

```bash
npm install     # one-time, pulls dev tools into node_modules (gitignored)
npm test        # runs everything below
```

Individual checks:

| Command | What it does |
|---------|--------------|
| `npm run lint:html` | Validates the HTML (`html-validate`) — broken markup, a11y issues, bad attributes |
| `npm run lint:css`  | Lints the CSS (`stylelint`) — invalid values, unknown properties, duplicates |
| `npm run lint:js`   | Lints the JS (`eslint`) — undefined vars, likely bugs |
| `npm run check:links` | Verifies every local `href`/`src` in the HTML points at a file that exists |
| `npm run check:photos` | Validates `assets/photos/photos.json` — valid JSON, every referenced full + thumb image exists (case-sensitively, like GitHub Pages), no duplicates, sane field types; warns about unlisted images |
| `npm run check:shows` | Validates `data/shows.json` — valid JSON; real `YYYY-MM-DD` dates; required `date`+`title`; well-formed buttons (`url` must be a valid http(s) URL + `text`); **rejects any unexpected field** (catches typos) |
| `npm run test:shows` | Self-test of the shows validator — proves it accepts good data and rejects each kind of mistake |
| `npm test` | All of the above |

**Always run `npm test` before opening a PR.** The same suite runs automatically in CI
(GitHub Actions, `.github/workflows/ci.yml`) on every pull request and push to `main`, so a
red build blocks the merge. Known intentionally-pending assets (e.g. `assets/hero.mp4`) are
allow-listed in `scripts/check-links.mjs` so they don't fail the link check.

---

## Updating shows (the most common edit)

All shows — upcoming **and** past — live in one file: **`data/shows.json`**. The site sorts
them and decides which are upcoming vs. past **based on today's date**, so a show moves itself
from "Upcoming Shows" to "Past Shows" automatically once its date passes. **You only ever add
upcoming shows; you never have to move anything to the past list.**

Each entry:

```json
{
  "date": "2026-07-18",
  "title": "Covington Days Festival",
  "subtitle": "12:00 PM • All ages",
  "button": { "url": "https://example.com/info", "text": "Info & Details" }
}
```

- **`date`** — `YYYY-MM-DD`. Required. Drives the upcoming/past split and all the date labels.
- **`title`** — Required. Shown as the big heading on an upcoming card, and as the whole line
  in the past-shows list (e.g. `"The Royal Room — Seattle, WA (2 shows)"`). Put whatever you
  want to read in both places here.
- **`subtitle`** — Optional. Extra line on upcoming cards (time, age policy, …). Hidden once
  the show is in the past.
- **`button`** — Optional. A link button on upcoming cards: `url` + the `text` to show on it
  (e.g. `"Tickets"` or `"Info & Details"`). Omit it for no button. Hidden once the show is past.

Order in the file doesn't matter — it's sorted automatically (upcoming soonest-first, past
most-recent-first, grouped by year with new years appearing on their own). If there are no
upcoming shows, the whole "Upcoming Shows" section disappears.

**The file is strictly validated** by `npm run check:shows` (part of `npm test`, and run in CI
on every pull request and push). It will fail — with a friendly message that names the show —
if anything is off: invalid JSON, a missing/typo'd field name, an impossible or wrongly
formatted date, a missing title, or a button without a valid http(s) `url` and `text`. So a
bad edit can't quietly ship. **Tip:** to be sure a broken `shows.json` can never reach the live
site, edit it via a pull request (or turn on branch protection requiring the CI check to pass
before merging to `main`).

## Dropping in the real content

Everything below is wired up with placeholders. Here's exactly what to replace.

### 1. Header video (SHOWS hero)
- Add your compressed MP4 at **`assets/hero.mp4`** (muted, autoplay, looping — no audio needed).
- Aim for **≤ ~10–15 MB** so GitHub Pages serves it fast. A 1080p, ~10–20s loop at a
  modest bitrate is ideal. (Tip: `ffmpeg -i in.mov -an -vf scale=1920:-2 -crf 28 -movflags +faststart assets/hero.mp4`.)
- Optionally also drop a still frame at **`assets/hero-poster.jpg`** and point the
  `poster="…"` attribute in `index.html` at it (currently a placeholder SVG). The poster
  shows on slow connections and before the video starts.

### 2. Logo
- The real logo lives at **`assets/logo.png`** (transparent, shown centered at the bottom of
  the video hero). Replace that file to update it; if you switch formats, update the `src` in
  `index.html` and the `og:image` meta tag.

### 3. Social links
- Currently set to `https://facebook.com/13tilmidnight` and
  `https://instagram.com/13tilmidnight` in the header of every page. Search/replace if the
  real URLs differ.

### 4. Photos (PICS)
You only manage **one set of hi-res images** — thumbnails are generated for you.

1. Drop your hi-res originals into **`assets/photos/full/`**. Use descriptive, stable
   filenames (e.g. `royal-room-trio.jpg`) — **not** sequential numbers. Display order is
   controlled by the manifest, not the filename, so reordering never means renaming.
2. Run **`npm run thumbs`** (requires macOS `sips`, which is built in). This:
   - generates optimized thumbnails into `assets/photos/thumb/` (max 1200px long edge), and
   - updates **`assets/photos/photos.json`**, adding any new images (with an empty `credit`)
     and recording each photo's dimensions — while preserving your existing credits and order.
3. Edit **`assets/photos/photos.json`** to taste:
   ```json
   {
     "photos": [
       { "file": "royal-room-trio.jpg", "credit": "Photo by Jane Doe", "w": 1200, "h": 800 },
       { "file": "mt-si-2025.jpg", "credit": "", "w": 800, "h": 1200 }
     ]
   }
   ```
   - **`credit`** (optional) shows in a small font under the photo in the lightbox (not in the grid).
   - **Reorder** by moving entries in the array. **`w`/`h`** are maintained by `npm run thumbs`
     (used for the masonry layout) — you don't need to touch them.
   - Alt text is a single fixed value (`"Photo of 13 Til Midnight"`) applied to every image —
     set in `js/gallery.js` (`ALT`), not per photo.
- The gallery is a **masonry layout**: a responsive number of equal-width columns
  (2 on mobile → 4 on desktop), so portrait and landscape photos both keep their natural
  shape. Clicking a photo opens the hi-res version in a lightbox.
- Commit both `assets/photos/full/` and `assets/photos/thumb/` (GitHub Pages serves them as-is).
- Until `photos.json` has entries, placeholder tiles are shown so the layout is visible.

### 5. Videos (VIDEOS)
- In **`videos/index.html`**, replace `VIMEO_ID_1` and `VIMEO_ID_2` with the real Vimeo video IDs
  (the number in a Vimeo URL, e.g. `vimeo.com/`**`123456789`**). Reel #1 = Band Reel,
  Reel #2 = Festival Reel.

### 6. Contact form (Web3Forms)
The contact form uses **[Web3Forms](https://web3forms.com)** — free, no account/server needed.
1. Go to web3forms.com, enter the email address you want inquiries delivered to, and copy
   the **Access Key** they email you.
2. In **`contact/index.html`**, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.
That's it — submissions get emailed to you. A honeypot field is already included for spam.
(If you ever prefer a different provider, the form is a standard POST and easy to repoint.)

---

## Hosting / deployment

**The site is live at https://13tilmidnight.com**, served by **GitHub Pages** (source: `main`
/ root) over HTTPS. The repo is public; `main` is branch-protected (every change goes through a
PR that must pass the "Lint & verify" CI check before it can merge). Pushing to `main` rebuilds
and redeploys the site automatically within ~1 minute. `.nojekyll` makes Pages serve the files
as-is, and the committed `CNAME` sets the custom domain.

The domain is registered at **GoDaddy** using GoDaddy's nameservers + DNS:
- Apex `A` records `13tilmidnight.com` → `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153` (plus matching `AAAA` records for IPv6)
- `CNAME` `www` → `jeremydstone.github.io`

Squarespace (the previous host) is no longer involved.

### Adding/updating shows
The common ongoing edit is adding shows to `data/shows.json`. For a non-technical editor, see
**[`SITEUPDATE.md`](SITEUPDATE.md)** — a from-zero, browser-only walkthrough (no git/CLI needed).

---

## Design notes
- **Fonts:** Inter for everything, loaded from Google Fonts. Headings and body are kept as
  separate CSS variables (`--font-display` / `--font-body`, both Inter) so the heading face can
  be changed in one place later.
- **Background:** near-black `#07080c` with subtle multi-color glows + faint noise (not flat black).
- **Accent:** electric blue. Solid buttons use a deeper indigo→royal gradient (`--btn-grad`) with
  white text; thinner accents (nav underline, etc.) use the brighter `--accent-grad`.
- **Animations:** kept minimal/tasteful (scroll-reveal on the Pics/Contact heroes); the SHOWS and
  Videos pages render everything immediately, and there are no hover effects on the (non-clickable)
  show cards — both deliberate, to keep scrolling smooth. Reduced-motion is respected.
- **Responsive:** mobile-first; hamburger menu under 760px; gallery and video frames adapt to
  screen size (videos cap their width on very large monitors).
- No frameworks, no dependencies, no tracking.
