/* ============================================================
   SHOWS data + renderer.
   To update shows: edit the arrays below. No HTML/layout changes
   needed — the page rebuilds itself from this data.
   ============================================================ */
(function () {
  "use strict";

  /* Each upcoming show:
     { dow, mon, day, year, name, time, note, url, ticketLabel } */
  var UPCOMING = [
    { dow: "Sat", mon: "Jul", day: "18", year: "2026", name: "Covington Days Festival",          time: "12:00 PM", note: "All ages", url: "https://www.covingtonwa.gov/covingtondays/" },
    { dow: "Sat", mon: "Jul", day: "25", year: "2026", name: "Silverdale Whaling Days",            time: "8:30 PM",  note: "All ages", url: "https://whalingdays.com/entertainment/" },
    { dow: "Sun", mon: "Jul", day: "26", year: "2026", name: "Renton River Days",                  time: "4:00 PM",  note: "All ages", url: "https://www.rentonwa.gov/Government/Newsroom/Press-Releases/Renton-River-Days-announces-2026-festival-dates" },
    { dow: "Wed", mon: "Jul", day: "29", year: "2026", name: "Duvall SummerStage",                 time: "7:00 PM",  note: "All ages", url: "https://www.duvallwa.gov/492/SummerStage" },
    { dow: "Thu", mon: "Jul", day: "30", year: "2026", name: "Maple Valley Concerts in the Park",  time: "6:00 PM",  note: "All ages", url: "https://www.maplevalleywa.gov/government/departments/parks_and_recreation/special_events/music_in_the_park_concert_series.php" },
    { dow: "Thu", mon: "Aug", day: "6",  year: "2026", name: "Longview Summer Concerts at the Lake", time: "6:00 PM", note: "All ages", url: "https://www.mylongview.com/740/Summer-Concerts-at-the-Lake" },
    { dow: "Fri", mon: "Aug", day: "7",  year: "2026", name: "Lacey Summer Concerts",              time: "7:00 PM",  note: "All ages", url: "https://laceyparks.org/events/" },
    { dow: "Sun", mon: "Aug", day: "9",  year: "2026", name: "Festival at Mt Si",                  time: "12:00 PM", note: "All ages", url: "https://www.festivalatmtsi.org/schedule.php" },
    { dow: "Thu", mon: "Aug", day: "20", year: "2026", name: "Clallam County Fair",                time: "7:30 PM",  note: "All ages", url: "https://www.clallamcountywa.gov/403/2026-Fair-Entertainment-Events" },
    { dow: "Sat", mon: "Sep", day: "19", year: "2026", name: "Newcastle Days",                     time: "5:30 PM",  note: "All ages", url: "" }
  ];

  /* Past shows, newest first within each year.
     { date, venue }  — date is the short label, venue includes city. */
  var PAST = [
    {
      year: "2026",
      shows: [
        { date: "Sat May 9",  venue: "The Royal Room — Seattle, WA (2 shows)" },
        { date: "Sat Apr 11", venue: "Green River College — Auburn, WA" },
        { date: "Sat Mar 7",  venue: "Jazzbones — Tacoma, WA" },
        { date: "Fri Mar 6",  venue: "McMenamins Anderson School — Bothell, WA" },
        { date: "Sat Feb 7",  venue: "The Headliners Club — Lake Oswego, OR (2 shows)" },
        { date: "Sat Jan 31", venue: "Clearwater Casino — Suquamish, WA" },
        { date: "Sat Jan 24", venue: "Chalet Theatre — Enumclaw, WA" }
      ]
    },
    {
      year: "2025",
      shows: [
        { date: "Tue Dec 23",  venue: "Nectar Lounge — Seattle, WA" },
        { date: "Sat Dec 13",  venue: "Orcas Center — Orcas Island, WA" },
        { date: "Sat Oct 25",  venue: "Clearwater Casino — Suquamish, WA" },
        { date: "Fri Oct 24",  venue: "Tony V's Garage — Everett, WA" },
        { date: "Sat Sep 13",  venue: "Hidden Hall — Seattle, WA" },
        { date: "Sun Aug 24",  venue: "Spanish Ballroom — Tacoma, WA" },
        { date: "Fri Aug 22",  venue: "McMenamins Anderson School — Bothell, WA" },
        { date: "Wed Jul 30",  venue: "Duvall SummerStage — Duvall, WA" },
        { date: "Thu Jul 17",  venue: "Munch & Music Festival — Bend, OR" },
        { date: "Sat Mar 29",  venue: "Tim Noah Thumbnail Theater — Snohomish, WA" },
        { date: "Fri Mar 28",  venue: "McMenamins Anderson School — Bothell, WA" },
        { date: "Sat Feb 8",   venue: "Tractor Tavern — Seattle, WA" },
        { date: "Sat Feb 1",   venue: "Clearwater Casino — Suquamish, WA" },
        { date: "Sat Jan 25",  venue: "Chalet Theatre — Enumclaw, WA" },
        { date: "Sun Jan 12",  venue: "The Royal Room — Seattle, WA (2 shows)" }
      ]
    },
    {
      year: "2024",
      shows: [
        { date: "Thu Dec 12", venue: "Neumos — Seattle, WA" },
        { date: "Sat Nov 9",  venue: "Central Saloon — Seattle, WA" },
        { date: "Fri Oct 11", venue: "High Dive — Seattle, WA" }
      ]
    }
  ];

  var TICKET_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>';

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function renderUpcoming(container) {
    var reveals = [];
    UPCOMING.forEach(function (s, i) {
      var row = el("article", "show");
      row.setAttribute("data-reveal", "");
      row.style.setProperty("--reveal-delay", (Math.min(i, 6) * 60) + "ms");

      var meta = s.time || "";
      if (s.note) meta += (meta ? '<span class="dot">•</span>' : "") + s.note;

      var cta = s.url
        ? '<a class="btn btn--solid" href="' + s.url + '" target="_blank" rel="noopener">' + TICKET_SVG + ' Tickets &amp; Info</a>'
        : '<span class="show__soon">Details soon</span>';

      row.innerHTML =
        '<div class="show__date">' +
          '<span class="mon">' + s.mon + '</span>' +
          '<span class="day">' + s.day + '</span>' +
          '<span class="dow">' + s.dow + '</span>' +
        '</div>' +
        '<div class="show__info">' +
          '<h3 class="show__name">' + s.name + '</h3>' +
          '<p class="show__meta">' + meta + '</p>' +
        '</div>' +
        '<div class="show__cta">' + cta + '</div>';

      container.appendChild(row);
      reveals.push(row);
    });
    if (window.__revealObserve) window.__revealObserve(reveals);
  }

  function renderPast(container) {
    var reveals = [];
    PAST.forEach(function (group) {
      var block = el("div", "past-year");
      block.setAttribute("data-reveal", "");
      block.appendChild(el("h3", "past-year__label", group.year));

      var caps = el("div", "capsules");
      group.shows.forEach(function (s) {
        caps.appendChild(el("span", "capsule",
          '<span class="cap-date">' + s.date + '</span>' +
          '<span class="cap-sep"></span>' +
          '<span class="cap-venue">' + s.venue + '</span>'
        ));
      });
      block.appendChild(caps);
      container.appendChild(block);
      reveals.push(block);
    });
    if (window.__revealObserve) window.__revealObserve(reveals);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var up = document.getElementById("upcoming-list");
    var past = document.getElementById("past-list");
    if (up) renderUpcoming(up);
    if (past) renderPast(past);
  });
})();
