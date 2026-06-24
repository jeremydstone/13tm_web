/* ============================================================
   SHOWS — data-driven, date-aware renderer.

   Shows live in  /data/shows.json  (one flat list). This script:
   - splits them into UPCOMING (date today or later) and PAST
     (date already passed) based on the visitor's current date, so a
     show moves itself from "Upcoming" to "Past" automatically once its
     date passes — no site edit needed;
   - sorts upcoming soonest-first and past most-recent-first, grouping
     past shows by year (newest year first) — new years appear on their
     own automatically;
   - drops the "Upcoming Shows" section entirely when nothing is upcoming
     (and the "Past Shows" section when nothing is past).

   To update: edit /data/shows.json. Each show:
     { "date": "YYYY-MM-DD",
       "title": "...",                 // upcoming card heading AND past-list text
       "subtitle": "7:00 PM • All ages",   // optional; shown on upcoming only
       "button": { "url": "...", "text": "Tickets" } }  // optional; upcoming only
   ============================================================ */
(function () {
  "use strict";

  var DATA_URL = "/data/shows.json";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DOWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Parse "YYYY-MM-DD" as a LOCAL date (avoid the UTC-shift of new Date(str)).
  function parseDate(s) {
    var p = String(s).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function removeSection(id) {
    var s = document.getElementById(id);
    if (s) s.remove();
  }

  function renderUpcoming(container, shows) {
    shows.forEach(function (s) {
      var d = s._date;
      var row = el("article", "show");

      var date = el("div", "show__date");
      date.appendChild(el("span", "mon", MONTHS[d.getMonth()]));
      date.appendChild(el("span", "day", String(d.getDate())));
      date.appendChild(el("span", "dow", DOWS[d.getDay()]));
      row.appendChild(date);

      var info = el("div", "show__info");
      info.appendChild(el("h3", "show__name", s.title));
      if (s.subtitle) info.appendChild(el("p", "show__meta", s.subtitle));
      row.appendChild(info);

      if (s.button && s.button.url && s.button.text) {
        var cta = el("div", "show__cta");
        var a = el("a", "btn btn--solid", s.button.text);
        a.href = s.button.url;
        a.target = "_blank";
        a.rel = "noopener";
        cta.appendChild(a);
        row.appendChild(cta);
      }

      container.appendChild(row);
    });
  }

  function renderPast(container, shows) {
    var byYear = {};
    shows.forEach(function (s) {
      var y = s._date.getFullYear();
      (byYear[y] = byYear[y] || []).push(s);
    });
    Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; }).forEach(function (year) {
      var block = el("div", "past-year");
      block.appendChild(el("h3", "past-year__label", String(year)));
      var caps = el("div", "capsules");
      byYear[year].forEach(function (s) {
        var d = s._date;
        var cap = el("span", "capsule");
        cap.appendChild(el("span", "cap-date", DOWS[d.getDay()] + " " + MONTHS[d.getMonth()] + " " + d.getDate()));
        cap.appendChild(el("span", "cap-sep"));
        cap.appendChild(el("span", "cap-venue", s.title));
        caps.appendChild(cap);
      });
      block.appendChild(caps);
      container.appendChild(block);
    });
  }

  function render(list) {
    var now = new Date();
    var todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    var upcoming = [], past = [];
    list.forEach(function (s) {
      if (!s || !s.date) return;
      s._date = parseDate(s.date);
      if (isNaN(s._date.getTime())) return;
      if (s._date.getTime() >= todayMid) upcoming.push(s);
      else past.push(s);
    });
    upcoming.sort(function (a, b) { return a._date - b._date; }); // soonest first
    past.sort(function (a, b) { return b._date - a._date; });     // most recent first

    if (upcoming.length) {
      var ul = document.getElementById("upcoming-list");
      if (ul) renderUpcoming(ul, upcoming);
    } else {
      removeSection("shows");
    }

    if (past.length) {
      var pl = document.getElementById("past-list");
      if (pl) renderPast(pl, past);
    } else {
      removeSection("past");
    }
  }

  function init() {
    fetch(DATA_URL, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        render(data && Array.isArray(data.shows) ? data.shows : []);
      })
      .catch(function () {
        // Couldn't load the data (e.g. opened via file://). Remove the empty
        // sections rather than leaving bare headings.
        removeSection("shows");
        removeSection("past");
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
