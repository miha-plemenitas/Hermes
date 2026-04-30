import { getFeedStories } from "@/lib/news/feed";

function uniqueById(stories) {
  const seen = new Set();

  return stories.filter((story) => {
    if (seen.has(story.id)) {
      return false;
    }

    seen.add(story.id);
    return true;
  });
}

export async function getDailyBriefing() {
  const feed = await getFeedStories({ limit: 30 });
  const stories = feed.stories;
  const topStories = stories.slice(0, 5);
  const fastRisingStories = stories
    .filter((story) => ["Trending", "Important", "Clustered"].includes(story.trend))
    .slice(0, 5);
  const watchlistStories = stories
    .filter((story) => story.sourceCount > 1 || story.score >= 70)
    .slice(0, 5);
  const briefingStories = uniqueById([
    ...topStories,
    ...fastRisingStories,
    ...watchlistStories,
  ]).slice(0, 8);

  return {
    mode: feed.mode,
    topStories,
    fastRisingStories,
    watchlistStories,
    briefingStories,
  };
}
