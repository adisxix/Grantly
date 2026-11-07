/**
 * Generate a .ics calendar file for a scholarship deadline.
 * @param {{ title: string, description: string, deadline: string, url?: string }} event
 * @returns {string} ICS file content
 */
export function generateICS(event) {
  const dt = new Date(event.deadline)
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr =
    `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}` +
    `T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
  const end = new Date(dt.getTime() + 60 * 60 * 1000)
  const endStr =
    `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}` +
    `T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}00Z`
  const uid = `${Date.now()}@grantly.app`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grantly//Scholarship Tracker//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dateStr}`,
    `DTSTART:${dateStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    event.url ? `URL:${event.url}` : '',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

function escapeICS(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Trigger a download of an ICS file.
 * @param {string} content
 * @param {string} filename
 */
export function downloadICS(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate and download an ICS file for a scholarship deadline.
 * @param {import('@/data/models').Scholarship} scholarship
 */
export function exportScholarshipICS(scholarship) {
  const ics = generateICS({
    title: `${scholarship.name} — Deadline`,
    description: `Application deadline for ${scholarship.name} by ${scholarship.provider}. ${scholarship.description}`,
    deadline: scholarship.deadline,
    url: scholarship.website,
  })
  downloadICS(ics, `${scholarship.slug}-deadline.ics`)
}
