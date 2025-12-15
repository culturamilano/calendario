document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ICS EXPORT
  ========================= */

  function generateICS(eventEl) {
    const title = eventEl.dataset.title || "Evento";
    const date = eventEl.dataset.date; // YYYYMMDD
    const start = eventEl.dataset.start || "0900";
    const end = eventEl.dataset.end || "";
    const location = eventEl.dataset.location || "";
    const address = eventEl.dataset.address || "";
    const description = eventEl.dataset.description || "";

    const dtStart = `${date}T${start}00`;
    const dtEnd = end ? `${date}T${end}00` : "";

    let ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cultura Milano//Agenda Stampa//IT
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${dtStart}
${dtEnd ? `DTEND:${dtEnd}` : ""}
LOCATION:${location}, ${address}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.ics`;
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
      `${eventEl.dataset.location || ""}, ${eventEl.dataset.address || ""}`
    );
    const description = encodeURIComponent(eventEl.dataset.description || "");

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
     EVENT BINDINGS
  ========================= */

  document.querySelectorAll(".event").forEach(eventEl => {
    const icsBtn = eventEl.querySelector(".ics-btn");
    const gcalBtn = eventEl.querySelector(".gcal-btn");

    if (icsBtn) {
      icsBtn.addEventListener("click", e => {
        e.preventDefault();
        generateICS(eventEl);
      });
    }

    if (gcalBtn) {
      gcalBtn.addEventListener("click", e => {
        e.preventDefault();
        openGoogleCalendar(eventEl);
      });
    }
  });

});


/* =========================
   FILTERS
========================= */

const filterButtons = document.querySelectorAll(".filters button");
const events = document.querySelectorAll(".event");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.dataset.filter;
    const month = btn.dataset.month;

    events.forEach(event => {
      let show = true;

      if (type && type !== "all") {
        show = event.dataset.type === type;
      }

      if (month) {
        show = event.dataset.month === month;
      }

      event.style.display = show ? "" : "none";
    });
  });
});
