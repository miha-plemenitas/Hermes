import { ingestRedditPosts } from "@/lib/news/ingestReddit";
import { clusterRawItems } from "@/lib/news/cluster";
import { recalculateStoryRankings } from "@/lib/news/recalculateRankings";
import {
  getClustersWithoutSummaries,
  summarizeCluster,
} from "@/lib/ai/summarizeStory";
import { getFeedStories } from "@/lib/news/feed";

export async function runDailyRefresh() {
  const steps = [];

  const ingestResult = await ingestRedditPosts();
  steps.push({ step: "ingest", ...ingestResult });

  const clusterResult = await clusterRawItems({ limit: 250 });
  steps.push({ step: "cluster", ...clusterResult });

  const summaryCandidates = await getClustersWithoutSummaries({ limit: 50 });
  const summaries = [];

  for (const cluster of summaryCandidates) {
    const summary = await summarizeCluster(cluster);
    summaries.push(summary);
  }

  steps.push({
    step: "summarize",
    scanned: summaryCandidates.length,
    created: summaries.length,
  });

  const rankingResult = await recalculateStoryRankings({ limit: 250 });
  steps.push({ step: "rank", ...rankingResult });

  const feed = await getFeedStories({ limit: 50 });

  return {
    refreshedAt: new Date().toISOString(),
    feedMode: feed.mode,
    feedCount: feed.stories.length,
    steps,
  };
}
