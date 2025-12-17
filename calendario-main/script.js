
// Show print-header only in print mode
function handlePrintHeader() {
  var ph = document.querySelector('.print-header');
  if (!ph) return;
  if (window.matchMedia('print').matches) {
    ph.style.display = 'block';
  } else {
    ph.style.display = 'none';
  }
}
window.addEventListener('beforeprint', handlePrintHeader);
window.addEventListener('afterprint', handlePrintHeader);
handlePrintHeader();

document.addEventListener("DOMContentLoaded", () => {

  function escapeAttr(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  fetch("events.json")
    .then(res => res.json())
    .then(data => renderAgenda(data))
    .catch(err => console.error("Error loading events:", err));

  function renderAgenda(months) {
    const container = document.getElementById("agenda");

    months.forEach((month, mi) => {
      const section = document.createElement("section");
      section.className = "month-section";

      if (mi > 0) section.classList.add("month-separator");

      section.innerHTML = `
        <div class="month-inner">
          <h2>${month.month}</h2>
        </div>
      `;

      month.events.forEach((ev, ei) => {
        const article = document.createElement("article");
        article.className = "event three-col";
        if (ei > 0) article.classList.add("event-separator");

        article.innerHTML = `
          <aside class="event-meta">
            <div class="meta-date">${formatDate(ev.date)}</div>
              <div class="meta-time">${formatTime(ev.start, ev.end)}</div>
            <a href="${ev.maps}" target="_blank" class="meta-location">
              <span>${ev.venue}</span><br>
              <small>${ev.address}</small>
            </a>
          </aside>

          <div class="event-main">
            <h3>${ev.title}</h3>
            <p>${ev.description}</p>
            ${ev.extra ? `<p class="extra">${ev.extra}</p>` : ""}
          </div>

          <div class="event-actions">
            <span class="plus">+</span>
            <div class="calendar-menu">
              <button class="btn-google" data-title="${escapeAttr(ev.title)}" data-date="${ev.date}" data-start="${ev.start}" data-end="${ev.end}" data-venue="${escapeAttr(ev.venue)}" data-address="${escapeAttr(ev.address)}">Google</button>
              <button class="btn-ics" data-title="${escapeAttr(ev.title)}" data-date="${ev.date}" data-start="${ev.start}" data-end="${ev.end}" data-venue="${escapeAttr(ev.venue)}" data-address="${escapeAttr(ev.address)}" data-description="${escapeAttr(ev.description || '')}" data-extra="${escapeAttr(ev.extra || '')}">Calendario</button>
            </div>
          </div>
        `;

        section.appendChild(article);
      });

      container.appendChild(section);
    });
  }

    function formatTime(start, end) {
      function isValidTime(t) {
        // Accepts HH:MM or H:MM, 24h, not empty
        return typeof t === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(t);
      }
      const s = isValidTime(start) ? start : '';
      const e = isValidTime(end) ? end : '';
      if (!s && !e) return 'TBA';
      if (s && e) return `${s}–${e}`;
      return s || e || 'TBA';
    }

  function formatDate(d) {
    const date = new Date(d);
    if (isNaN(date.getTime())) {
      return "TBA";
    }
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  // Event delegation for calendar buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-google')) {
      const title = e.target.dataset.title;
      const date = e.target.dataset.date;
      const start = e.target.dataset.start;
      const end = e.target.dataset.end;
      const venue = e.target.dataset.venue;
      const address = e.target.dataset.address;
      addGoogle(title, date, start, end, venue, address);
    } else if (e.target.classList.contains('btn-ics')) {
      const title = e.target.dataset.title;
      const date = e.target.dataset.date;
      const start = e.target.dataset.start;
      const end = e.target.dataset.end;
      const venue = e.target.dataset.venue;
      const address = e.target.dataset.address;
      const description = e.target.dataset.description || '';
      const extra = e.target.dataset.extra || '';
      addICS(title, date, start, end, venue, address, description, extra);
    }
  });

  // Export to PDF trigger
  const exportBtn = document.getElementById('export-pdf');
  if (exportBtn) {
    exportBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      window.print();
    });
  }

  window.addGoogle = function(title, date, start, end, venue, address) {
    const d = date.replace(/-/g,"");
    const s = start.replace(":","");
    const e = end ? end.replace(":","") : s;
    const location = venue + ", " + address;
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${d}T${s}00/${d}T${e}00&location=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  window.addICS = function(title, date, start, end, venue, address, descriptionText, extraText) {
    const d = date.replace(/-/g,"");
    const s = start ? start.replace(":","") : "";
    const e = end ? end.replace(":","") : (s || "0000");
    const location = venue + ", " + address;

    // Build description with extra info and press contacts
    const contacts = `Contatti stampa:\nSilvia Egiziano – silvia.egiziano@comune.milano.it\nElena Conenna – elenamaria.conenna@comune.milano.it`;
    const description = `${descriptionText || ""}${descriptionText && extraText ? "\n\n" : (extraText ? "" : "")} ${extraText || ""}`.trim();
    const fullDescription = (description ? description + "\n\n" : "") + contacts;

    // Escape function for ICS fields
    function icsEscape(str) {
      return String(str)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    }

    const ics =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${icsEscape(title)}
DTSTART:${d}T${s}00
DTEND:${d}T${e}00
LOCATION:${icsEscape(location)}
DESCRIPTION:${icsEscape(fullDescription)}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.ics`;
    a.click();
  };
});
