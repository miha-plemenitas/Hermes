# Hermes Plan

## Product Goal

Hermes is a personal AI-powered news web app that surfaces the latest and most important stories from news sites, Reddit, X.com, and other public trend sources. The app should help a user quickly understand what is happening, why it matters, and which sources are discussing it.

The first version should behave like a focused news command center, not a generic social feed. It should prioritize clarity, source attribution, freshness, and fast scanning.

## Core Experience

- Show a personalized front page of current stories ranked by relevance, recency, and trend strength.
- Group duplicate or related reports into a single story cluster.
- Summarize each cluster with AI in plain language.
- Link back to original sources for verification.
- Separate hard news, tech, business, politics, culture, sports, science, and local news.
- Let the user filter by topic, source, region, time range, and mood such as "important", "fast rising", or "deep dive".
- Provide a daily briefing view with the most important updates since the last visit.

## MVP Scope

The MVP should avoid trying to solve every news platform at once. Start with a reliable pipeline and expand sources after the core loop works.

### MVP Features

- Home feed with latest and trending story clusters.
- Article ingestion from one or more news APIs.
- Reddit trend ingestion from selected subreddits.
- AI summaries for each story cluster.
- Source list for every summarized story.
- Topic filters.
- Search.
- Basic saved preferences.
- Refresh status showing when data was last updated.
- Mobile-first layout that works well as a daily phone news app.

### MVP Non-Goals

- No fully automated social media scraping.
- No reposting full copyrighted articles.
- No paywall bypassing.
- No claim that AI summaries are authoritative without source links.
- No complex recommendation engine until basic ranking works.

## Tech Stack

Hermes will use:

- Frontend: Next.js with React and JavaScript.
- Styling: Tailwind CSS or a small component system built on CSS modules.
- Backend: Next.js API routes and server actions where useful.
- Database: Supabase Postgres.
- Auth: Supabase Auth, if user accounts are needed.
- Storage: Supabase Storage, if cached images or generated assets are needed.
- Realtime: Supabase Realtime only if live updates become necessary.
- Background jobs: BullMQ with Redis, or a managed scheduled job service.
- AI: OpenAI API for summarization, clustering labels, briefings, and topic extraction.
- Search: Supabase Postgres full-text search for MVP, Meilisearch or Typesense later.
- Deployment: Vercel for the Next.js app.

Supabase should be the primary backend data platform. The app should keep the database schema, row-level security policies, and API access patterns simple at first, then harden them as user accounts and personalization are added.

## Data Sources

### News APIs

Good initial candidates:

- NewsAPI, GNews, The Guardian Open Platform, NYT APIs, AP, Reuters Connect, or MediaStack.
- RSS feeds from reputable publishers.
- Google News RSS for broad discovery, if acceptable for the product use case.

Evaluation criteria:

- API terms allow this use case.
- Provides title, URL, publisher, timestamp, image, snippet, and topic metadata.
- Has enough rate limit for scheduled refreshes.
- Supports regional and category filters.

### Reddit

Use Reddit's official API where possible.

Initial approach:

- Track configured subreddits.
- Pull hot, rising, and top posts over selected time windows.
- Use post title, URL, score, comment count, created time, subreddit, and permalink.
- Treat Reddit as a trend signal, not as a primary factual source.

### X.com

X data is harder because official API access, pricing, and restrictions can change. The initial product should support X as an optional integration rather than depending on it.

Possible approaches:

- Official X API if access and terms fit.
- Third-party trend providers if compliant.
- Manual user-provided feeds or lists.
- Defer X until the rest of the pipeline is solid.

## AI Features

AI should enhance reading and organization, not replace sources.

### Initial AI Tasks

- Summarize article clusters in 3-5 sentences.
- Generate a short headline for a cluster.
- Extract topics, entities, countries, companies, and people.
- Detect whether multiple articles describe the same event.
- Produce a daily briefing from top clusters.
- Explain why a story is trending based on source count, social activity, and recency.

### Guardrails

- Always show source links next to AI summaries.
- Store the prompt version used for generated summaries.
- Regenerate stale summaries when source clusters change significantly.
- Avoid summarizing full article text unless the source license allows it.
- Prefer summaries from titles, snippets, metadata, and permitted article content.
- Mark generated content clearly in the UI.

## Ranking Model

The first ranking model can be simple and transparent.

Inputs:

- Recency.
- Number of sources covering the same story.
- Publisher credibility or user preference.
- Reddit score and comment velocity.
- Topic match with user preferences.
- Whether the story is still developing.

Example score:

```text
score = recency_weight
  + source_count_weight
  + social_velocity_weight
  + preference_match_weight
  + publisher_weight
```

Later versions can add learning from user behavior, but the MVP should start with explicit rules.

## Data Model Draft

Core tables:

- `Source`: publisher, platform, URL, credibility metadata, API configuration.
- `RawItem`: raw article, post, or trend item from a source.
- `StoryCluster`: group of related raw items.
- `StorySource`: join table between clusters and raw items.
- `AISummary`: generated summary, model, prompt version, source item IDs, timestamps.
- `Topic`: normalized topic labels.
- `UserPreference`: selected topics, regions, blocked sources, saved filters.
- `SavedStory`: user bookmarks.

## Design Direction

Hermes should look simple, sharp, and readable. The interface should feel like a fast personal news tool, not a crowded media homepage.

### Visual Style

- Use a strict black, white, and yellow color scheme.
- Black should be used for text, navigation, strong dividers, and high-emphasis UI.
- White should be the main reading background.
- Yellow should be reserved for highlights, active states, trend indicators, badges, and key actions.
- Avoid decorative gradients, heavy shadows, glass effects, and large marketing-style sections.
- Keep cards compact with clear hierarchy, strong spacing, and readable typography.
- Prioritize source names, timestamps, summaries, and topic labels over decorative imagery.

### Mobile-First UX

- Design the main feed for one-handed mobile browsing first.
- Use a bottom navigation or compact sticky header for primary sections.
- Keep story cards scannable with headline, short AI summary, source count, timestamp, and trend marker.
- Make filters usable on small screens with horizontal topic tabs or a filter sheet.
- Ensure tap targets are large enough for mobile use.
- Avoid dense multi-column layouts on mobile.
- Make story detail pages readable with clear source links and a clean update timeline.

### Desktop UX

- Keep desktop simple and content-focused.
- Use the wider screen for filters, topic navigation, and source context.
- Avoid making desktop feel like a completely different product from mobile.

## App Views

### Home

- Trending now.
- Latest updates.
- Important stories.
- Topic tabs.
- Compact story cards with summary, source count, timestamp, and source links.
- Mobile-first feed layout using black, white, and yellow UI accents.

### Story Detail

- AI summary.
- Timeline of updates.
- Source comparison.
- Reddit/social discussion signals.
- Related stories.
- Original source links.

### Daily Briefing

- Top stories since last visit.
- What changed overnight.
- Stories to watch.

### Search

- Search by keyword, topic, entity, source, or date range.

### Settings

- Topic preferences.
- Region preferences.
- Source allow/block list.
- API integration status.

## Implementation Phases

### Phase 1: Foundation

- Create the Next.js JavaScript app skeleton.
- Connect the app to Supabase.
- Add the initial Supabase database schema.
- Add source ingestion abstraction.
- Add one news API or RSS source.
- Render latest articles in the UI.

### Phase 2: Clustering and Summaries

- Add story clustering.
- Add AI summaries.
- Store generated summaries.
- Display clusters instead of raw articles.
- Add source attribution.

### Phase 3: Trends

- Add Reddit ingestion.
- Add trend scoring.
- Add ranking explanations.
- Add topic and time filters.

### Phase 4: Personalization

- Add user preferences.
- Add saved stories.
- Add daily briefing.
- Add blocked sources and preferred topics.

### Phase 5: Expansion

- Evaluate X.com integration.
- Add more news APIs and RSS feeds.
- Add notifications.
- Add better search.
- Add multilingual or regional feeds.

## Key Risks

- API cost and rate limits may shape what data can be refreshed.
- X.com access may be expensive or limited.
- AI summaries can hallucinate if source context is weak.
- Copyright rules limit how much article content can be stored or displayed.
- Ranking can create bias if source weighting is not transparent.
- Duplicate detection can be noisy without careful clustering.

## Open Questions

- Should Hermes be personal-only or multi-user from the start?
- Which region and language should be supported first?
- Should the app optimize for breaking news, daily briefings, or deep analysis?
- Which sources should be trusted or prioritized by default?
- Should social trends influence ranking heavily, or only annotate stories?
- What budget is acceptable for APIs and AI calls?

## First Build Checklist

- Create the Next.js JavaScript project.
- Configure Vercel deployment.
- Create the Supabase project.
- Add Supabase environment variables.
- Define the black, white, and yellow design tokens.
- Build the mobile-first app shell.
- Pick first news source.
- Define the Supabase database schema.
- Build ingestion job.
- Build home feed.
- Add basic cluster model.
- Add AI summary generation.
- Add source attribution.
- Add Reddit trend signal.
- Add settings for topics and sources.
