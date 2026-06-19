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
- Replace **`assets/logo.svg`** with the real logo (SVG preferred; a transparent PNG also
  works — just update the `src` in `index.html`). It's shown centered at the bottom of the
  video hero.

### 3. Social links
- Currently set to `https://facebook.com/13tilmidnight` and
  `https://instagram.com/13tilmidnight` in the header of every page. Search/replace if the
  real URLs differ.

### 4. Photos (PICS)
- Drop image files in **`assets/photos/`**.
- Open **`js/gallery.js`** and fill in the `PHOTOS` array, e.g.:
  ```js
  var PHOTOS = [
    { src: "assets/photos/01.jpg", alt: "13 Til Midnight live" },
    { src: "assets/photos/02.jpg", alt: "Festival crowd" },
    // …about 30
  ];
  ```
- The grid layout is **calculated automatically** from each image's real dimensions, so any
  mix of portrait + landscape just works — you never edit HTML/CSS to reflow.
- **Hi/low-res:** if you provide two sizes, use `thumb` for the grid and `src` for the
  full-size lightbox image:
  ```js
  { src: "assets/photos/full/01.jpg", thumb: "assets/photos/thumb/01.jpg", alt: "…" }
  ```
- While `PHOTOS` is empty, 30 generated placeholders are shown so you can see the layout.

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
