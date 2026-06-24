# 13 Til Midnight — website

Static HTML / CSS / JS site for the band **13 Til Midnight**. No backend, no build
step. Designed to be hosted free on **GitHub Pages** at the custom domain
**13tilmidnight.com**.

## Pages

| File           | Page    | Notes |
|----------------|---------|-------|
| `index.html`   | SHOWS   | Full-screen muted background video hero + logo, upcoming shows, past shows by year |
| `pics.html`    | PICS    | Dynamic justified photo gallery + lightbox |
| `videos.html`  | VIDEOS  | Two responsive Vimeo reels |
| `contact.html` | CONTACT | Booking form (Web3Forms) |

Nav order site-wide: **SHOWS · PICS · VIDEOS · CONTACT**.

## Run locally

It's just static files, so any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening the files via `file://` mostly works too, but a server is closer to production.)

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
| `npm test` | All of the above |

**Always run `npm test` before opening a PR.** The same suite runs automatically in CI
(GitHub Actions, `.github/workflows/ci.yml`) on every pull request and push to `main`, so a
red build blocks the merge. Known intentionally-pending assets (e.g. `assets/hero.mp4`) are
allow-listed in `scripts/check-links.mjs` so they don't fail the link check.

---

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
- In **`videos.html`**, replace `VIMEO_ID_1` and `VIMEO_ID_2` with the real Vimeo video IDs
  (the number in a Vimeo URL, e.g. `vimeo.com/`**`123456789`**). Reel #1 = Band Reel,
  Reel #2 = Festival Reel.

### 6. Contact form (Web3Forms)
The contact form uses **[Web3Forms](https://web3forms.com)** — free, no account/server needed.
1. Go to web3forms.com, enter the email address you want inquiries delivered to, and copy
   the **Access Key** they email you.
2. In **`contact.html`**, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.
That's it — submissions get emailed to you. A honeypot field is already included for spam.
(If you ever prefer a different provider, the form is a standard POST and easy to repoint.)

---

## Deploying to GitHub Pages

1. Create a GitHub repo and push these files to the default branch.
2. Repo **Settings → Pages →** set source to your branch, root (`/`).
3. The included **`CNAME`** file (`13tilmidnight.com`) tells Pages to use the custom domain.
4. At your domain registrar, point DNS at GitHub Pages:
   - Four `A` records for the apex `13tilmidnight.com` → `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - A `CNAME` record for `www` → `<your-username>.github.io`
5. Back in Settings → Pages, tick **Enforce HTTPS** once the cert provisions.
6. `.nojekyll` is included so GitHub serves the files as-is (no Jekyll processing).

Once DNS propagates you can cancel the Squarespace subscription.

---

## Design notes
- **Fonts:** Space Grotesk (display) + Inter (body), loaded from Google Fonts.
- **Background:** near-black `#07080c` with subtle multi-color glows + faint noise (not flat black).
- **Animations:** tasteful fade / fly-in reveals on scroll via `IntersectionObserver`; fully
  disabled for visitors who prefer reduced motion.
- **Responsive:** mobile-first; hamburger menu under 760px; gallery and video frames adapt to
  screen size (videos cap their width on very large monitors).
- No frameworks, no dependencies, no tracking.
