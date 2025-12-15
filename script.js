/* ----------------------------------------------------
   Utilities
---------------------------------------------------- */

function icsEscape(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function toICSDate(dateYYYYMMDD, hhmm) {
  const h = (hhmm || "0000").slice(0, 2);
  const m = (hhmm || "0000").slice(2, 4);
  return `${dateYYYYMMDD}T${h}${m}00`;
}

/* ----------------------------------------------------
   ICS DOWNLOAD (Apple / Outlook / etc.)
---------------------------------------------------- */

function downloadICSFromEvent(eventEl) {
  const title = eventEl.dataset.title || "Evento";
  const date = eventEl.dataset.date; // YYYYMMDD
  const start = eventEl.dataset.start || "0000";
  let end = eventEl.dataset.end || "";
  const location = eventEl.dataset.location || "";
  const description = eventEl.dataset.description || "";

  if (!date) {
    alert("Manca la data per questo evento.");
    return;
  }

  // Default durata: 60 minuti
  if (!end) {
    const sh = parseInt(start.slice(0, 2), 10) || 0;
    const sm = parseInt(start.slice(2, 4), 10) || 0;
    const total = sh * 60 + sm + 60;
    const eh = String(Math.floor(total / 60) % 24).padStart(2, "0");
    const em = String(total % 60).padStart(2, "0");
    end = `${eh}${em}`;
  }

  const dtstart = toICSDate(date, start);
  const dtend = toICSDate(date, end);

  const uid = `${date}-${start}-${Math.random().toString(16).slice(2)}@agenda-stampa`;
  const now = new Date();
  const dtstamp =
    now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, "0") +
    String(now.getUTCDate()).padStart(2, "0") +
    "T" +
    String(now.getUTCHours()).padStart(2, "0") +
    String(now.getUTCMinutes()).padStart(2, "0") +
    String(now.getUTCSeconds()).padStart(2, "0") +
    "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agenda Stampa//Cultura Milano//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${icsEscape(title)}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    location ? `LOCATION:${icsEscape(location)}` : null,
    description ? `DESCRIPTION:${icsEscape(description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  const ics = lines.join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = title.replace(/[^\w\-]+/g, "_") + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/* ----------------------------------------------------
   GOOGLE CALENDAR
---------------------------------------------------- */

function openGoogleCalendarFromEvent(eventEl) {
  const title = eventEl.dataset.title || "Evento";
  const date = eventEl.dataset.date; // YYYYMMDD
  const start = eventEl.dataset.start || "0000";
  let end = eventEl.dataset.end || "";
  const location = eventEl.dataset.location || "";
  const description = eventEl.dataset.description || "";

  // Default durata: 60 minuti
  if (!end) {
    const sh = parseInt(start.slice(0, 2), 10) || 0;
    const sm = parseInt(start.slice(2, 4), 10) || 0;
    const total = sh * 60 + sm + 60;
    const eh = String(Math.floor(total / 60) % 24).padStart(2, "0");
    const em = String(total % 60).padStart(2, "0");
    end = `${eh}${em}`;
  }

  const startISO = `${date}T${start}00`;
  const endISO = `${date}T${end}00`;

  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(title) +
    "&dates=" + startISO + "/" + endISO +
    "&details=" + encodeURIComponent(description) +
    "&location=" + encodeURIComponent(location);

  window.open(url, "_blank", "noopener");
}

/* ----------------------------------------------------
   INIT
---------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ics-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventEl = btn.closest(".event");
      if (eventEl) downloadICSFromEvent(eventEl);
    });
  });

  document.querySelectorAll(".gcal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventEl = btn.closest(".event");
      if (eventEl) openGoogleCalendarFromEvent(eventEl);
    });
  });

  console.log("Agenda Stampa – Calendar export ready ✅");
});
