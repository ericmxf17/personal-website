# Live "currently ___" status

The site shows, in order of priority:

1. A status you set from your iPhone (expires after 2 hours).
2. Whatever is on your Google Calendar right now, which is what Notion Calendar shows. Only events matching `RULES` in `status.gs` are shown.
3. Your most recently pushed GitHub repo ("Currently building …").

## One-time setup (about 5 minutes)

1. Open [script.google.com](https://script.google.com), click **New project**, and replace the starter code with the contents of `status.gs`.
2. Select `setup` in the function dropdown and click **Run**, then allow calendar access. This creates `SECRET`, the password for setting your status. You can find it under **Project Settings → Script properties**.
3. Click **Deploy → New deployment**, choose the **Web app** type, and set **Execute as: Me** and **Who has access: Anyone**. Deploy, then allow calendar access.
4. Copy the web app URL (it ends in `/exec`) into `STATUS_URL` in `index.html`.

## iPhone shortcut

In the Shortcuts app, make a shortcut called "Set status":

1. **Choose from Menu** with the items: studying, working out, eating, Something else, Clear.
   - For studying, working out and eating, add a **Text** action with that phrase.
   - For Something else, add **Ask for Input** (prompt: "Currently…").
   - For Clear, add an empty **Text** action.
2. **URL Encode** the Menu Result.
3. **Get Contents of URL**: `YOUR_EXEC_URL?key=YOUR_SECRET&set=` followed by the URL Encoded Text.

Put the shortcut on your home screen or Action Button.

## "Sleeping"

Between 11pm and 9am Providence time, the site says "Currently sleeping." if nothing else is set and your Mac hasn't checked in for 15 minutes. The Mac checks in every 5 minutes while you're using it, through a small background job:

```bash
cp status/com.itsee.website-status.plist ~/Library/LaunchAgents/ && launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.itsee.website-status.plist
```

To remove it:

```bash
launchctl bootout gui/$(id -u)/com.itsee.website-status && rm ~/Library/LaunchAgents/com.itsee.website-status.plist
```

The hours are `NIGHT_START_HOUR` and `NIGHT_END_HOUR` in `status.gs`.

## Changing the rules

Edit `RULES` in the Apps Script editor, then **Deploy → Manage deployments → Edit → New version**. Calendar statuses are cached for 60 seconds.
