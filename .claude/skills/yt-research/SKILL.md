---
name: yt-research
description: Research what works on YouTube for the M-Play Zone channel (interactive "choose / survive" story Shorts). Pulls the channel's own stats and analytics, and searches competitors' top videos with real view and comment counts. Use when asked to research the niche, find trends, compare with competitors, or review how the channel's videos are doing.
---

# YouTube research (M-Play Zone)

Channel: **M-Play Zone** (`@m-playzone`, id `UCZfAUpE88vp9EUA2ESHk0KA`).
Data source: the Composio MCP server, YouTube toolkit (account is already connected).
Never make up numbers. Every number in a report must come from a tool call made in this run.

## 1. Own channel health

1. `COMPOSIO_SEARCH_TOOLS` (session `generate_id: true`) to get a session id.
2. `COMPOSIO_MULTI_EXECUTE_TOOL`:
   - `YOUTUBE_LIST_CHANNELS` `{mine: true, part: "snippet,statistics"}`
   - `YOUTUBE_LIST_CHANNEL_VIDEOS` `{mine: true, maxResults: 50}`
3. `YOUTUBE_GET_VIDEO_DETAILS_BATCH` on the video ids, parts `snippet,statistics,contentDetails,status`.
4. `YOUTUBE_QUERY_ANALYTICS` with `ids: "channel==MINE"`, last 28 days:
   - per video: `metrics=views,averageViewDuration,averageViewPercentage,subscribersGained,likes,comments,shares`, `dimensions=video`
   - traffic: `metrics=views`, `dimensions=insightTrafficSourceType`
   - countries: `metrics=views`, `dimensions=country`
   Analytics lag 1–3 days, so a video uploaded today has no rows yet. Say so instead of reporting zero.

**Benchmarks for Shorts:**

| Metric | Weak | OK | Strong |
|---|---|---|---|
| averageViewPercentage | < 60% | 60–80% | > 80% (> 100% = rewatches) |
| comments / views | < 0.3% | 0.3–1% | > 1% |
| subscribersGained / 1k views | < 1 | 1–3 | > 3 |

## 2. Competitor research

Use `COMPOSIO_REMOTE_WORKBENCH`, which runs Python with `run_composio_tool` and `ThreadPoolExecutor`:

- `YOUTUBE_SEARCH_YOU_TUBE` with `order: "viewCount"`, `type: "video"`, `publishedAfter` set to about 6 months ago, `maxResults` 12–15. Run 10–15 queries in parallel, for example: "choose a place to hide survive", "can you survive until the end", "pick a door", "choose your ending", "what would you do POV story", "hide and seek survival game".
- Remove duplicate ids, then `YOUTUBE_GET_VIDEO_DETAILS_BATCH` (50 ids per call) for views, comments and duration.
- `YOUTUBE_LIST_CHANNELS` with comma-separated ids to get each channel's subscribers and video count.
- For the 3–5 most relevant channels, `YOUTUBE_LIST_CHANNEL_VIDEOS` on the last 12 uploads. This shows whether a format works every time or was a one-off hit.

Report per format: median views, typical length, comment ratio, upload frequency, title pattern, and what the first second shows. Ignore long-form and kids content unless asked.

## 3. Output

A short report, in the user's language (Hebrew by default), covering:
1. Own numbers versus the benchmarks.
2. The 3 formats that win right now, with real example videos linked as `https://youtube.com/shorts/<id>`.
3. 3–5 concrete changes for the next upload.

Earlier findings are in `references/findings-2026-11.md`. Compare against them and note what changed.
