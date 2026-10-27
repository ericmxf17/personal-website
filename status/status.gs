// Live "currently ___" status for the personal website. Runs as a Google Apps Script web app.
//
//   GET                                   -> {"status": "in class"}  (or {"status": null})
//   GET ?key=SECRET&set=eating[&minutes=90] -> manual status; overrides the calendar until it expires
//   GET ?key=SECRET&set=                  -> clears the manual status
//
// The calendar status comes from whatever is on your Google Calendar (what Notion Calendar shows)
// right now. Only events matching RULES are shown; everything else stays private.

// First match wins, so order matters.
const RULES = [
  [/\bflight\b/i, "on a flight"],
  [/\bTA\b/, "teaching a section"],
  [/\b(gym|work ?out|lift(ing)?|run(ning)?|swim(ming)?|climb(ing)?|nelson)\b/i, "working out"],
  [/\b(breakfast|brunch|lunch|dinner|ratty|meal)\b/i, "eating"],
  [/\b(study|studying|library|pset|problem set|homework)\b/i, "studying"],
  [/\b(exam|midterm|final)\b/i, "taking an exam"],
  [/\b[A-Z]{2,4} ?\d{2,4}\b/, "in class"], // course codes: ECON 1130, APMA 260, CS17
  [/\b(lecture|class|seminar|section|lab)\b/i, "in class"],
  [/\b(meeting|call|sync|1:1|interview)\b/i, "in a meeting"],
  [/\b(sleep|nap)\b/i, "sleeping"],
];

const DEFAULT_MINUTES = 120;
const CALENDAR_CACHE_SECONDS = 60;

function doGet(e) {
  const params = e.parameter;
  const props = PropertiesService.getScriptProperties();

  if ("set" in params) {
    const secret = props.getProperty("SECRET");
    if (!secret || params.key !== secret) return json({ error: "wrong key" });
    if (!params.set.trim()) {
      props.deleteProperty("OVERRIDE");
      return json({ ok: true, status: null });
    }
    const status = params.set.trim().slice(0, 60);
    const minutes = Number(params.minutes) || DEFAULT_MINUTES;
    props.setProperty("OVERRIDE", JSON.stringify({ status, until: Date.now() + minutes * 60 * 1000 }));
    return json({ ok: true, status });
  }

  const override = JSON.parse(props.getProperty("OVERRIDE") || "null");
  if (override && override.until > Date.now()) return json({ status: override.status });
  return json({ status: calendarStatus() });
}

function calendarStatus() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("calendar");
  if (cached !== null) return cached || null;
  const status = findCalendarStatus();
  cache.put("calendar", status || "", CALENDAR_CACHE_SECONDS);
  return status;
}

function findCalendarStatus() {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 1000);
  for (const calendar of CalendarApp.getAllOwnedCalendars()) {
    for (const event of calendar.getEvents(now, soon)) {
      if (event.isAllDayEvent() || event.getMyStatus() === CalendarApp.GuestStatus.NO) continue;
      const rule = RULES.find(([pattern]) => pattern.test(event.getTitle()));
      if (rule) return rule[1];
    }
  }
  return null;
}

// Run once from the editor: creates SECRET (see Project Settings → Script properties)
// and asks for calendar access.
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SECRET")) props.setProperty("SECRET", Utilities.getUuid());
  console.log(`Calendar status right now: ${findCalendarStatus()}`);
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
