# How to Add a Show to 13tilmidnight.com

This guide is for whoever keeps the **shows list** up to date. You do **not** need to be a
programmer, and you don't need to install anything — everything here happens in your web
browser.

> **The most important thing to know:** you can't break the website. Every change you make is
> checked automatically before it can go live. If something is off (a typo, a missing comma,
> a bad date), the system **blocks it and tells you what to fix**. Nothing reaches the public
> site until the check passes. So relax — you can't take the site down.

You only ever **add upcoming shows**. The website automatically sorts everything by date, shows
upcoming shows in the "Upcoming Shows" section, and **moves a show to "Past Shows" on its own**
once the date passes. You never have to move anything to the past list.

---

## Part 1 — One-time setup (do this once)

### 1. Create a free GitHub account
GitHub is the service that stores the website's files.
1. Go to **https://github.com** and click **Sign up**.
2. Follow the prompts (email, password, username). It's free.
3. Remember your **username** — you'll need to share it in the next step.

### 2. Get access to the website's files
Email the site admin and say:

> "Here's my GitHub username: **`your-username`** — please add me as a collaborator with
> **Write** access to the `13tm_web` repository."

You'll get an **email invitation** from GitHub. Open it and click **Accept invitation**. That's
it — you now have access.

*(That's all the setup. From here on it's just editing a file in your browser.)*

---

## Part 2 — Adding a show (the routine you'll repeat)

Everything below is done at this one file. Bookmark it:

**👉 https://github.com/jeremydstone/13tm_web/blob/main/data/shows.json**

### Step 1 — Open the file for editing
Go to the link above and click the **pencil icon ✏️** near the top-right of the file (its tooltip
says "Edit this file"). You'll see the file's text in an editor.

### Step 2 — Add your show
The easiest, safest way is to **copy an existing line and change it** (that way all the tricky
punctuation is already correct):

1. Find a show that's similar to the one you're adding — for example, another upcoming show
   that has a ticket/info link. Each show is **one line** that looks like this:

   ```json
       { "date": "2026-08-07", "title": "Lacey Summer Concerts", "subtitle": "7:00 PM • All ages", "button": { "url": "https://laceyparks.org/events/", "text": "Info & Details" } },
   ```

2. **Select that whole line, copy it, and paste it on a new line right below** (now you have two
   identical lines).
3. In your **new** copy, change the values to your show:
   - **date** → your show's date as `YYYY-MM-DD` (4-digit year, 2-digit month, 2-digit day).
   - **title** → what the show should say.
   - **subtitle** → the time / details line (or delete this part — see the examples below).
   - **button** → the link and the words on the button (or delete this part for no button).
4. Leave the comma at the end of the line. (Every show line ends with a comma — see the comma
   rule below.)

You can add your line **anywhere** in the list — order doesn't matter, the site sorts it for
you. If in doubt, add it right under the line that says `"shows": [`.

### Step 3 — Save your change (this starts the publishing process)
1. Click the green **Commit changes...** button (top-right).
2. A box pops up. In **"Commit message"**, type a short note like `Add Newcastle Days show`.
3. GitHub will say it can't save directly to `main` and will offer to
   **"Create a new branch for this commit and start a pull request."** That's exactly what you
   want — leave it selected. (A "branch" is just a safe draft copy of your change.)
4. Click **Propose changes**.

### Step 4 — Create the pull request
A "pull request" (PR) is simply **your request to make the change official**.
1. You'll land on a page titled "Open a pull request." The title is pre-filled — fine as is.
2. Click **Create pull request**.

### Step 5 — Wait for the automatic check (≈1–2 minutes)
On the pull request page you'll see a checks area:
- 🟡 **Yellow dot** = the check is running. Wait a minute.
- ✅ **Green check ("All checks have passed")** = your change is valid. Go to Step 6.
- ❌ **Red X** = something needs fixing. **Don't worry — nothing went live.** Click **Details**
  next to the red X; it will tell you exactly what's wrong (and which show), in plain language.
  Then go back to your file, click the pencil ✏️ again, fix it, and commit to the **same**
  branch/PR. The check re-runs. (See "If the check fails" below for common fixes.)

### Step 6 — Publish it
Once you see the green ✅:
1. Click **Merge pull request**, then **Confirm merge**.
2. Click the **Delete branch** button that appears (this just tidies up your draft copy — it
   does not delete anything important).

### Step 7 — Done! 🎉
The live site rebuilds automatically. Wait about a minute, then open
**https://13tilmidnight.com** (refresh the page) and you'll see your show. If it's an upcoming
date, it appears under "Upcoming Shows"; the site will move it to "Past Shows" by itself after
the date passes.

> **Want the admin to review first?** If Jeremy would rather check show additions before they go
> live, just stop after **Step 4** (creating the pull request) and let him know — he'll handle
> Steps 5–6.

---

## The show format — examples to copy

Each show is one line inside the list. Here are the common variations:

**Festival / show with an info link (most common):**
```json
    { "date": "2026-07-18", "title": "Covington Days Festival", "subtitle": "12:00 PM • All ages", "button": { "url": "https://www.covingtonwa.gov/covingtondays/", "text": "Info & Details" } },
```

**Ticketed show — just change the button wording to "Tickets":**
```json
    { "date": "2026-10-15", "title": "The Crocodile — Seattle, WA", "subtitle": "8:00 PM • 21+", "button": { "url": "https://example.com/tickets", "text": "Tickets" } },
```

**No link yet — leave off the whole `button` part:**
```json
    { "date": "2026-11-01", "title": "Private Event", "subtitle": "Invitation only" },
```

**Bare minimum — just a date and title:**
```json
    { "date": "2026-12-31", "title": "New Year's Eve Show" },
```

### What each piece means
| Field | Required? | What it is |
|-------|-----------|------------|
| `date` | **Yes** | The show date, `YYYY-MM-DD` (e.g. `2026-09-19`). Controls sorting and the upcoming/past split. |
| `title` | **Yes** | The headline. On upcoming shows it's the big text; once the show is past, this whole text becomes the past-list line — so include the venue/city if you want it to read well later (e.g. `"Tractor Tavern — Seattle, WA"`). |
| `subtitle` | No | A second line on upcoming cards — time, age policy, etc. Hidden once the show is past. |
| `button` | No | A link button on upcoming cards. Has two parts: `url` (a full web address starting with `https://`) and `text` (the words on the button, e.g. `"Tickets"`). Hidden once the show is past. Leave it out for no button. |

---

## The rules (so the automatic check passes)

These are the things the checker looks for. If you copied an existing line and only changed the
values, you'll almost always be fine.

1. **Dates must be `YYYY-MM-DD`** — four-digit year, two-digit month, two-digit day, with dashes.
   `2026-07-05` ✅. Not `7/5/26`, not `2026-7-5`. And it must be a real date (no `2026-13-40`).
2. **Commas between shows, but not after the last one.** Every show line ends with a comma `,`
   **except the very last show in the list**, which has no comma. (This is the single most common
   mistake. If you add your show at the *top* of the list — right under `"shows": [` — you never
   have to touch the last line, so this stays easy.)
3. **Use straight double quotes `"` — not "curly" ones.** If you type or paste from Word or
   Google Docs, you may get curly quotes (`"` `"`) which will fail the check. Copying an existing
   line (as suggested above) avoids this. The `•` dot in subtitles is fine — copy it from an
   existing line.
4. **Only use the field names shown here** — `date`, `title`, `subtitle`, `button`, and inside a
   button, `url` and `text`. A misspelled field name (like `tilte` or `buton`) will be caught as
   "an unexpected field."
5. **Button links must be full web addresses** starting with `http://` or `https://`.

---

## If the check fails (red ❌) — don't panic

Nothing went live. The site is unchanged and safe. The checker is just protecting you.

1. On the pull request, click **Details** next to the red ❌, then look for the lines that start
   with `✗`. They're written in plain language and **name the show** so you can find it, e.g.:
   - `✗ shows[3] ("Silverdale Whaling Days") "date" must be a real date in YYYY-MM-DD form...`
   - `✗ shows[0] has an unexpected field "titel" — probably a typo...`
2. Go back to the file (pencil ✏️), fix exactly what it described, and **Commit changes** to the
   **same** pull request. The check runs again automatically.
3. Repeat until it's green ✅, then merge (Step 6).

**Most common fixes:** a missing comma at the end of a line; a comma left on what is now the last
line; curly quotes from copy-paste; a date typed in the wrong format.

---

## FAQ

**Do I need to remove old shows?** No. Leave them — they automatically move to "Past Shows" after
their date. You can delete a past show's line if you ever want to, but it's optional.

**Where do I add the new show — top or bottom?** Anywhere. The site sorts by date automatically.
Top of the list (right under `"shows": [`) is easiest because you avoid the last-line comma rule.

**I made a typo and already published it.** No problem — just edit the file again the same way
(Steps 1–6) to correct it. You can do this as often as you like.

**How do I fix or change a show I already added?** Same process: open the file, find the line,
edit the values, save → PR → wait for green → merge.

**Can I practice without affecting the live site?** Yes — go through Steps 1–4 to create a pull
request, look at the result, and simply **don't merge it** (you can click "Close pull request"
to discard it). Nothing is live until you click Merge.

**It's been a couple minutes and I don't see my show on the site.** Refresh the page (or open it
in a private/incognito window). The site usually updates within a minute of merging.

**I'm stuck or something looks wrong.** Stop and email the admin. When in doubt, it's totally safe to just not merge.

---

*Reference: the shows file is `data/shows.json` in the `jeremydstone/13tm_web` repository. The
full technical details (how the site reads this file, the validation rules) are in `README.md`.*
