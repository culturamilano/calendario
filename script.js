document.querySelectorAll('.ics-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const e = btn.closest('.event');

    const title = e.dataset.title;
    const date = e.dataset.date;
    const start = e.dataset.start || "0000";
    const end = e.dataset.end || "0000";
    const location = e.dataset.location;

    const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${date}T${start}00
DTEND:${date}T${end}00
LOCATION:${location}
END:VEVENT
END:VCALENDAR`.trim();

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/\s+/g, '_') + '.ics';
    a.click();

    URL.revokeObjectURL(url);
  });
});
