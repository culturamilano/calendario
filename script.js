document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ICS EXPORT
  ========================= */

  function escapeICS(text) {
    return (text || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\r/g, "");
  }

  function generateICS(eventEl) {
    const title = eventEl.dataset.title || "Evento";
    const date = eventEl.dataset.date; // YYYYMMDD
    const start = eventEl.dataset.start || "0900";
    const end = eventEl.dataset.end || "";
    const location = eventEl.dataset.location || "";
    const address = eventEl.dataset.address || "";
    const description = eventEl.dataset.description || "";

    if (!date) {
      alert("Data mancante per questo evento (data-date).");
      return;
    }

    const dtStart = `${date}T${start}00`;
    const dtEnd = end ? `${date}T${end}00` : "";

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Cultura Milano//Agenda Stampa//IT",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${Math.random().toString(16).slice(2)}@cultura-milano`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${escapeICS(title)}`,
      `DTSTART:${dtStart}`,
      ...(dtEnd ? [`DTEND:${dtEnd}`] : []),
      `LOCATION:${escapeICS(`${location}${location && address ? ", " : ""}${address}`)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[\/\\?%*:|"<>]/g, "-")}.ics`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* =========================
     GOOGLE CALENDAR LINK
  ========================= */

  function openGoogleCalendar(eventEl) {
    const title = encodeURIComponent(eventEl.dataset.title || "");
    const date = eventEl.dataset.date;
    const start = eventEl.dataset.start || "0900";
    const end = eventEl.dataset.end || start;
    const location = encodeURIComponent(
      `${eventEl.dataset.location || ""}${eventEl.dataset.address ? ", " + eventEl.dataset.address : ""}`
    );
    const description = encodeURIComponent(eventEl.dataset.description || "");

    if (!date) {
      alert("Data mancante per questo evento (data-date).");
      return;
    }

    const dates = `${date}T${start}00/${date}T${end}00`;

    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${title}` +
      `&dates=${dates}` +
      `&details=${description}` +
      `&location=${location}`;

    window.open(url, "_blank");
  }

  /* =========================
     BIND CALENDAR BUTTONS
  ========================= */

  document.querySelectorAll(".event").forEach(eventEl => {
    const icsBtn = eventEl.querySelector(".ics-btn");
    const gcalBtn = eventEl.querySelector(".gcal-btn");

    if (icsBtn) {
      icsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        generateICS(eventEl);
      });
    }

    if (gcalBtn) {
      gcalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openGoogleCalendar(eventEl);
      });
    }
  });

  /* =========================
     FILTERS (robusti)
     - data-filter: all | preview | press
     - data-month: 202512 | 202601 | 202602
     - eventi: data-type="preview|press" e data-month="YYYYMM"
  ========================= */

  const filterBar = document.querySelector(".filters");
  const events = Array.from(document.querySelectorAll(".event"));

  if (!filterBar || events.length === 0) return;

  let state = { type: "all", month: "all" };

  function applyFilters() {
    events.forEach(ev => {
      const evType = (ev.dataset.type || "all").toLowerCase();
      const evMonth = (ev.dataset.month || "all").toLowerCase();

      const typeOk = (state.type === "all") || (evType === state.type);
      const monthOk = (state.month === "all") || (evMonth === state.month);

      ev.style.display = (typeOk && monthOk) ? "" : "none";
    });
  }

  function setActive(btn) {
    filterBar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    // tipo
    if (btn.dataset.filter) {
      state.type = btn.dataset.filter.toLowerCase();
      // non azzeriamo il month: combinazione possibile
    }

    // mese
    if (btn.dataset.month) {
      state.month = btn.dataset.month.toLowerCase();
      // non azzeriamo il type: combinazione possibile
    }

    // se è "Tutti" e lo vuoi davvero globale:
    if (btn.dataset.filter === "all") {
      state = { type: "all", month: "all" };
    }

    setActive(btn);
    applyFilters();
  });

  // default
  applyFilters();
});
