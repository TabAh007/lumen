# Demo guide

Quick start (one command, two servers):

```bash
./dev.sh          # starts backend + frontend; Ctrl-C stops both
```

Then open **http://localhost:5173**.

> Tip: open it in your own Chrome/Safari, not an embedded preview — external
> result links (Instagram, TikTok, etc.) only open in a real browser.

## Tested inputs that demo well

### By handle (discover → analyze interests & stances)
- `natgeo` — rich result on both **Instagram** and **TikTok** (conservation, wildlife, science). Reliable showpiece.
- `nasa` — strong interests + clear pro-science stance.
- Any large public brand/creator handle works; pick accounts with lots of text captions.

### By email (which platforms have an account)
- Use a real email you control, or a throwaway. Common ones (e.g. an old Gmail)
  return a healthy list. Expect some "rate-limited / inconclusive" — that's normal.

### Social Analyser (rated detection + site category)
- `natgeo` — ~25 detected profiles, each with a confidence rate and a website
  category (News, Social, Adult, Gaming, …). Slower than the other tabs (~30–60s).

## Demo flow suggestion
1. **By handle → `natgeo` → Analyze TikTok.** Show the summary, interest tags, and
   especially the **stance cards** — point out the confidence bars and the quoted
   **evidence** under each. This is the differentiator.
2. **Social Analyser → `natgeo`.** Show the categorized footprint (note the category
   badges). Frames the breadth of someone's online presence.
3. **By email.** Show the email → accounts pivot.

## If something fails mid-demo
- **500 error** → the backend isn't running. Start it: `cd backend && npm start`
  (or just use `./dev.sh`).
- **A scrape returns empty** → the account may be private, or the scraper hit a
  rate limit. Fall back to a known-good handle (`natgeo`).
