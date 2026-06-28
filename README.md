# Luminaries

**Highlight a name. Right-click. Get a full research brief.**

Luminaries is a Chrome extension that turns researching people into a two-second action. Highlight any name on any webpage, right-click, and it launches a structured, AI-powered deep-dive on that person via Perplexity — while quietly saving the name to a running log so you never lose track of who you've looked up.

I built this because I research people constantly — founders, investors, authors, podcast guests — and the loop of *copy name → open new tab → type a good prompt → search* was friction I did a dozen times a day. Now it's one right-click.

<!-- TODO: Add a GIF here showing highlight → right-click → Perplexity results. A 10-second screen recording converted at ezgif.com works great. -->

## How it works

1. **Highlight** a person's name anywhere on the web
2. **Right-click** → *"Research '[name]' with Perplexity"*
3. A new tab opens with a pre-structured Perplexity query that returns:
   - Who they are and their current role
   - Career history and notable achievements
   - Key projects, publications, and companies
   - Reputation and impact in their field
   - Verified links: LinkedIn, Twitter/X, YouTube, personal site

The name is simultaneously saved to your **Luminaries Log** — click the toolbar icon to see everyone you've researched. From the popup you can:

- **Search** your saved luminaries
- **Click a name** to re-research them on Perplexity
- **Add notes** to any luminary (click "+ note")
- **Copy** a name to clipboard (with visual confirmation)
- **Delete** individual entries or clear the whole list
- **Export** to CSV (includes name, date, and notes)

## Why pre-prompting matters

Searching just a name gets you a Wikipedia-flavored summary. Luminaries wraps every search in a detailed instruction set, so the result reads like a one-page diligence brief instead of a search result. The prompt lives in `background.js` — fork it and tune it to your own workflow (e.g., add "recent funding rounds" or "recent talks and interviews").

## Install (from source)

1. Clone or download this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the repo folder
5. Highlight a name anywhere and right-click

No accounts, no API keys, no setup.

## Privacy

- Saved names live in `chrome.storage.local` — **on your machine only**
- The extension requests just two permissions: `contextMenus` and `storage`
- No analytics, no tracking, no external servers (other than the Perplexity tab you open)

## Architecture

Deliberately minimal — Manifest V3, vanilla JS, no build step:

| File | Role |
|---|---|
| `manifest.json` | MV3 config: context menu + local storage permissions |
| `background.js` | Service worker: registers the menu, builds the Perplexity URL, saves the name |
| `popup.html/js/css` | The Luminaries Log: list, search, notes, copy, delete, clear-all, CSV export |

## Ideas / roadmap

- [x] One-click export of the log to CSV (for building contact lists)
- [x] Per-name notes in the popup
- [x] Search/filter luminaries in the popup
- [x] Re-research from popup (click a name)
- [x] Timestamps and visual copy feedback
- [ ] Configurable prompt templates (investor mode, hiring mode, journalist mode)
- [ ] Optional Claude / ChatGPT as alternate research engines

## License

MIT — use it, fork it, make it yours.

---

*Built by [Tatva Desai](https://tatvadesai.github.io) 
