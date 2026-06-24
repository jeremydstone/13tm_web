/* ============================================================
   PICS — masonry gallery + lightbox, driven by a JSON manifest.

   HOW TO ADD/UPDATE PHOTOS:
   1. Drop hi-res images into  assets/photos/full/
   2. Run  npm run thumbs       (generates assets/photos/thumb/ and
      updates assets/photos/photos.json with each photo + dimensions)
   3. Edit assets/photos/photos.json to set an optional "credit" (shown in
      the lightbox only) and "alt" per photo, and reorder entries to change
      display order. Order is the array order — never depends on filenames.

   Until photos.json has entries, a set of placeholders is shown so the
   layout is visible during development.
   ============================================================ */
(function () {
  "use strict";

  var galleryEl = document.getElementById("gallery");
  if (!galleryEl) return;

  var MANIFEST_URL = "assets/photos/photos.json";
  var FULL_DIR = "assets/photos/full/";
  var THUMB_DIR = "assets/photos/thumb/";
  var GAP = 14;

  var photos = [];   // normalized: { thumb, full, alt, credit, w, h, _el }
  var current = 0;

  /* ---------- Placeholder generation (used until real photos exist) ---------- */
  function makePlaceholders() {
    var ratios = [[3, 2], [2, 3], [4, 3], [1, 1], [3, 4], [16, 9], [5, 4], [9, 16]];
    var hues = [330, 268, 205, 190, 312, 230];
    var out = [];
    for (var i = 0; i < 18; i++) {
      var r = ratios[i % ratios.length];
      var w = r[0] * 240, h = r[1] * 240, hue = hues[i % hues.length];
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
          '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="hsl(' + hue + ',45%,16%)"/>' +
            '<stop offset="1" stop-color="hsl(' + ((hue + 40) % 360) + ',55%,9%)"/>' +
          '</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>' +
          '<text x="50%" y="50%" fill="hsla(' + hue + ',60%,80%,0.55)" font-family="Inter,sans-serif" ' +
            'font-size="' + Math.round(Math.min(w, h) * 0.18) + '" font-weight="700" text-anchor="middle" ' +
            'dominant-baseline="central">' + (i + 1) + '</text></svg>';
      var uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      out.push({
        thumb: uri, full: uri, w: w, h: h,
        alt: "Photo placeholder " + (i + 1),
        credit: i % 4 === 0 ? "Photo by Sample Credit" : ""
      });
    }
    return out;
  }

  function normalize(list) {
    return list.map(function (p) {
      return {
        thumb: THUMB_DIR + p.file,
        full: FULL_DIR + p.file,
        alt: p.alt || "13 Til Midnight",
        credit: p.credit || "",
        w: p.w || 0,
        h: p.h || 0
      };
    });
  }

  /* ---------- Build item DOM once; layout() re-parents into columns ---------- */
  function buildItems() {
    photos.forEach(function (p, i) {
      var fig = document.createElement("figure");
      fig.className = "gallery__item";
      fig.setAttribute("data-index", i);

      var media = document.createElement("span");
      media.className = "gallery__media";

      var img = document.createElement("img");
      img.alt = p.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.src = p.thumb;
      media.appendChild(img);
      fig.appendChild(media);

      // Credit is shown in the lightbox only (not in the grid).
      p._el = fig;

      // If dimensions are unknown (e.g. hand-added without running thumbs),
      // measure on load and re-layout.
      if (!p.w || !p.h) {
        if (img.complete && img.naturalWidth) {
          p.w = img.naturalWidth; p.h = img.naturalHeight;
        } else {
          img.addEventListener("load", function () {
            p.w = img.naturalWidth; p.h = img.naturalHeight; scheduleLayout();
          });
        }
      }
    });
  }

  function colCount(w) {
    if (w < 540) return 2;
    if (w < 880) return 3;
    return 4;
  }

  function layout() {
    var W = galleryEl.clientWidth;
    if (!W || !photos.length) return;
    var cols = colCount(W);
    var colW = (W - GAP * (cols - 1)) / cols;

    galleryEl.textContent = "";
    var colEls = [], colH = [];
    for (var c = 0; c < cols; c++) {
      var col = document.createElement("div");
      col.className = "gallery__col";
      galleryEl.appendChild(col);
      colEls.push(col);
      colH.push(0);
    }

    photos.forEach(function (p) {
      var ar = (p.w && p.h) ? p.w / p.h : 1.5;
      var estH = colW / ar + GAP;
      var idx = 0;
      for (var c = 1; c < cols; c++) if (colH[c] < colH[idx]) idx = c;
      colEls[idx].appendChild(p._el);
      colH[idx] += estH;
    });
  }

  var raf;
  function scheduleLayout() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  }
  window.addEventListener("resize", scheduleLayout);

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb && lb.querySelector(".lightbox__img");
  var lbCredit = lb && lb.querySelector(".lightbox__credit");
  var lbCounter = lb && lb.querySelector(".lightbox__counter");

  function showCurrent() {
    var p = photos[current];
    lbImg.src = p.full;
    lbImg.alt = p.alt;
    if (lbCredit) lbCredit.textContent = p.credit || "";
    if (lbCounter) lbCounter.textContent = (current + 1) + " / " + photos.length;
  }
  function openLightbox(i) {
    current = i;
    showCurrent();
    lb.classList.add("is-open");
    lb.removeAttribute("inert");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("inert", "");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function step(dir) {
    current = (current + dir + photos.length) % photos.length;
    showCurrent();
  }

  function wireLightbox() {
    if (!lb || !lbImg) return;
    galleryEl.addEventListener("click", function (e) {
      var fig = e.target.closest(".gallery__item");
      if (fig) openLightbox(+fig.getAttribute("data-index"));
    });
    lb.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { step(-1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---------- Boot ---------- */
  function start(list) {
    photos = list;
    buildItems();
    layout();
    window.addEventListener("load", scheduleLayout);
    wireLightbox();
  }

  fetch(MANIFEST_URL, { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var list = data && Array.isArray(data.photos) ? data.photos : [];
      start(list.length ? normalize(list) : makePlaceholders());
    })
    .catch(function () {
      // e.g. opened via file:// — fall back to placeholders
      start(makePlaceholders());
    });
})();
