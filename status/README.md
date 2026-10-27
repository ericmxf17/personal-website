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

## Changing the rules

Edit `RULES` in the Apps Script editor, then **Deploy → Manage deployments → Edit → New version**. Calendar statuses are cached for 60 seconds.
