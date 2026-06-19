/* ============================================================
   PICS — dynamic justified gallery + lightbox.

   HOW TO UPDATE PHOTOS:
   Just edit the PHOTOS array below (filename + alt text). Layout is
   computed automatically from each image's real dimensions, so any mix
   of portrait/landscape works and you never touch HTML/CSS to reflow.

   For now PHOTOS is empty, so we generate ~30 placeholders with varied
   aspect ratios. Replace the placeholder block with real entries like:
     { src: "assets/photos/band-01.jpg", alt: "13 Til Midnight live" }
   Providing both a full-res and a smaller (thumb) version is supported:
     { src: "assets/photos/full/01.jpg", thumb: "assets/photos/thumb/01.jpg", alt: "..." }
   ============================================================ */
(function () {
  "use strict";

  var PHOTOS = [
    // { src: "assets/photos/01.jpg", thumb: "assets/photos/thumb/01.jpg", alt: "13 Til Midnight" },
  ];

  /* ---------- Placeholder generation (remove once real photos added) ---------- */
  function makePlaceholders() {
    var ratios = [
      [3, 2], [2, 3], [4, 3], [16, 9], [1, 1], [3, 4], [5, 4], [9, 16], [2, 3], [3, 2]
    ];
    var hues = [330, 268, 205, 190, 312, 230];
    var out = [];
    for (var i = 0; i < 30; i++) {
      var r = ratios[i % ratios.length];
      var w = r[0] * 220;
      var h = r[1] * 220;
      var hue = hues[i % hues.length];
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
          '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="hsl(' + hue + ',45%,16%)"/>' +
            '<stop offset="1" stop-color="hsl(' + ((hue + 40) % 360) + ',55%,9%)"/>' +
          '</linearGradient></defs>' +
          '<rect width="100%" height="100%" fill="url(#g)"/>' +
          '<text x="50%" y="50%" fill="hsla(' + hue + ',60%,80%,0.55)" font-family="Space Grotesk, sans-serif" ' +
            'font-size="' + Math.round(Math.min(w, h) * 0.18) + '" font-weight="700" text-anchor="middle" ' +
            'dominant-baseline="central">' + (i + 1) + '</text>' +
        '</svg>';
      out.push({
        src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
        alt: "Photo placeholder " + (i + 1),
        w: w,
        h: h
      });
    }
    return out;
  }

  var photos = PHOTOS.length ? PHOTOS : makePlaceholders();

  var galleryEl = document.getElementById("gallery");
  if (!galleryEl) return;

  var TARGET_ROW_H = 300;   // desired row height (desktop)
  var GAP = 12;

  var items = []; // { el, img, ar }

  /* ---------- Build DOM ---------- */
  photos.forEach(function (p, i) {
    var fig = document.createElement("figure");
    fig.className = "gallery__item";
    fig.setAttribute("data-index", i);

    var img = document.createElement("img");
    img.alt = p.alt || "13 Til Midnight";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = p.thumb || p.src;

    fig.appendChild(img);
    galleryEl.appendChild(fig);

    var rec = { el: fig, img: img, ar: p.w && p.h ? p.w / p.h : null, full: p.src };
    items.push(rec);

    // Measure natural aspect ratio if not supplied
    if (!rec.ar) {
      if (img.complete && img.naturalWidth) {
        rec.ar = img.naturalWidth / img.naturalHeight;
        layout();
      } else {
        img.addEventListener("load", function () {
          rec.ar = img.naturalWidth / img.naturalHeight;
          layout();
        });
      }
    }
  });

  /* ---------- Justified-rows layout ---------- */
  function targetRowHeight() {
    var w = galleryEl.clientWidth;
    if (w < 520) return 180;
    if (w < 820) return 230;
    return TARGET_ROW_H;
  }

  function layout() {
    var containerW = galleryEl.clientWidth;
    if (!containerW) return;
    var rowH = targetRowHeight();
    var ready = items.filter(function (it) { return it.ar; });
    if (!ready.length) return;

    var row = [];
    var rowARsum = 0;

    function flush(isLast) {
      if (!row.length) return;
      // width available for images in this row (minus gaps)
      var avail = containerW - GAP * (row.length - 1);
      var h = avail / rowARsum;
      if (isLast) h = Math.min(h, rowH * 1.18); // don't over-stretch a lonely last row
      row.forEach(function (it) {
        var wv = h * it.ar;
        it.el.style.width = wv + "px";
        it.el.style.height = h + "px";
        it.el.style.flex = "0 0 auto";
      });
    }

    ready.forEach(function (it, idx) {
      row.push(it);
      rowARsum += it.ar;
      var projectedH = (containerW - GAP * (row.length - 1)) / rowARsum;
      if (projectedH <= rowH) {
        flush(false);
        row = [];
        rowARsum = 0;
      } else if (idx === ready.length - 1) {
        flush(true);
      }
    });
  }

  var rAF;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(layout);
  });

  // initial + reveal
  layout();
  window.addEventListener("load", layout);
  if (window.__revealObserve) {
    items.forEach(function (it, i) {
      it.el.setAttribute("data-reveal", "scale");
      it.el.style.setProperty("--reveal-delay", (Math.min(i, 12) * 35) + "ms");
    });
    window.__revealObserve(items.map(function (it) { return it.el; }));
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb ? lb.querySelector(".lightbox__img") : null;
  var lbCounter = lb ? lb.querySelector(".lightbox__counter") : null;
  var current = 0;

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
  function showCurrent() {
    var p = photos[current];
    lbImg.src = p.src;
    lbImg.alt = p.alt || "13 Til Midnight";
    if (lbCounter) lbCounter.textContent = (current + 1) + " / " + photos.length;
  }
  function step(dir) {
    current = (current + dir + photos.length) % photos.length;
    showCurrent();
  }

  if (lb && lbImg) {
    galleryEl.addEventListener("click", function (e) {
      var fig = e.target.closest(".gallery__item");
      if (fig) openLightbox(+fig.getAttribute("data-index"));
    });
    lb.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { step(-1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    });
  }
})();
