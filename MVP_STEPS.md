# Hermes MVP Steps

The Next.js app is inside the `hermes/` folder. Run app commands from there.

## 1. Create the Next.js App

Status: already done.

Use a Next.js JavaScript app with the App Router, Tailwind CSS, and ESLint.

Before continuing, confirm the app runs locally with `npm run dev`.

## 2. Create the Supabase Project

Status: mostly done.

Create a Supabase project and add the Supabase values to `hermes/.env`.

Required values:

- Supabase project URL.
- Supabase publishable key.
- Supabase secret key.
- OpenAI API key, can be added later.
- News API key, can be added later.

Keep secret keys server-side only.

## 3. Set Up Supabase Client Helpers

Install the Supabase JavaScript package.

Create two helper files:

- A browser Supabase client that uses the project URL and publishable key.
- A server/admin Supabase client that uses the project URL and secret key.

Use the browser client only for safe frontend reads and user-level actions.

Use the server/admin client only in server routes, server actions, ingestion jobs, and other backend-only code.

Run lint after the files are added.

## 4. Add the Database Schema

Create the initial tables in Supabase:

- `sources`
- `raw_items`
- `story_clusters`
- `story_sources`
- `ai_summaries`
- `topics`
- `user_preferences`
- `saved_stories`

For the MVP, focus first on:

- `sources`
- `raw_items`
- `story_clusters`
- `story_sources`
- `ai_summaries`

Enable Row Level Security on all tables.

During early development, use server routes with the admin client for feed reads and ingestion writes.

## 5. Build the App Shell

Build the first mobile-first layout.

Include:

- Sticky top header.
- App name.
- Refresh status.
- Horizontal topic tabs.
- Main feed area.
- Bottom mobile navigation.

Use the black, white, and yellow design direction from `PLAN.md`.

## 6. Build Static Feed UI First

Before connecting real APIs, build the UI using mock story data.

Create:

- Story card component.
- Topic tabs component.
- Bottom navigation component.
- Mock story data.
- Story detail page.

Each story card should show:

- Headline.
- Short summary.
- Source count.
- Timestamp.
- Topic.
- Trend marker.

## 7. Add the First News Source

Pick one news source first.

Good first options:

- NewsAPI.
- GNews.
- A trusted RSS feed.

Create an ingestion endpoint or server function that:

- Fetches recent articles.
- Normalizes article data.
- Saves source information.
- Saves raw article items.

Do not add Reddit or X.com yet.

## 8. Render Real Articles

Replace mock feed data with articles from Supabase.

At this stage, it is fine to show individual raw articles before clustering is ready.

Each article should show:

- Headline.
- Source.
- Published time.
- Snippet.
- Link to original article.

## 9. Add Basic Story Clustering

Group related articles into story clusters.

Start simple:

- Compare title keywords.
- Group articles from the same time window.
- Avoid advanced AI clustering at first.

Save clusters and connect raw articles to them.

## 10. Add AI Summaries

Add AI summaries for story clusters.

For each cluster, send only safe context to the AI model:

- Article titles.
- Snippets.
- Source names.
- Published timestamps.

Store:

- AI headline.
- AI summary.
- Model name.
- Prompt version.

Do not send or display full copyrighted article text unless the source license allows it.

## 11. Show Clustered Feed

Update the homepage to show story clusters instead of raw articles.

Each clustered story should show:

- AI-generated headline.
- AI summary.
- Source count.
- Top sources.
- Last updated time.
- Topic tags.
- Trend marker.

## 12. Add Ranking

Rank stories using a simple, explainable score.

Use:

- Recency.
- Number of sources.
- Topic match.
- Trend signal.
- Source quality or user preference.

Keep the ranking logic easy to understand before adding anything more advanced.

## 13. Add Reddit Trends

After the news pipeline works, add Reddit as a trend signal.

Track selected subreddits and store hot or rising posts.

Use Reddit to detect momentum and discussion, not as a verified news source.

## 14. Add Search and Filters

Add basic search and filtering.

Support:

- Search by headline.
- Search by summary.
- Filter by topic.
- Filter by source.
- Filter by time range.

Use Supabase/Postgres search for the MVP.

## 15. Add Preferences

Start with simple preferences:

- Preferred topics.
- Blocked sources.
- Region.
- Saved stories.

If user accounts are needed, use Supabase Auth.

## 16. Add Daily Briefing

Create a briefing page from existing story clusters.

Show:

- Top stories since last visit.
- Major updates.
- Fast-rising stories.
- Stories from preferred topics.

Do not create a separate data pipeline just for the briefing.

## 17. Prepare Vercel Deployment

Before deploying, confirm the app builds locally.

In Vercel:

- Import the GitHub repository.
- Set the project root to `hermes`.
- Add all environment variables.
- Deploy the app.

After deployment, confirm:

- The app loads on desktop.
- The app loads on mobile.
- Supabase connection works.
- Feed endpoint works.
- Ingestion endpoint works.
- AI summary flow works.

Use Vercel Cron Jobs later for scheduled ingestion.

## 18. MVP Acceptance Checklist

The MVP is ready when:

- The app loads on desktop and mobile.
- The design uses only black, white, and yellow.
- Real news items are ingested.
- Story clusters are displayed.
- Each cluster has source links.
- AI summaries are generated and stored.
- Ranking favors recent and widely covered stories.
- At least one trend signal is included.
- Search or topic filtering works.
- The app is deployed on Vercel.

## Recommended Build Order

1. App shell.
2. Static mobile feed.
3. Supabase client helpers.
4. Supabase schema.
5. First news ingestion.
6. Real feed.
7. Clustering.
8. AI summaries.
9. Ranking.
10. Reddit trend signal.
11. Search and filters.
12. Preferences.
13. Vercel deployment.
