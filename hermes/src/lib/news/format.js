import { getTrendLabel } from "@/lib/news/rank";
import {
  getTopicFromRawItem,
  getTopicFromRedditSource,
} from "@/lib/news/topics";

export function formatRelativeTime(value) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Just now";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} hr ago`;
  }

  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function rawItemToStory(item) {
  const sourceName = item.sources?.name || "Unknown source";
  const articleUrl = item.raw_payload?.linked_article_url || item.url;
  const topic = getTopicFromRawItem(item);

  return {
    id: item.id,
    headline: item.title,
    summary: item.snippet || "No summary is available yet.",
    topic,
    sourceCount: 1,
    sources: [sourceName],
    timestamp: formatRelativeTime(item.published_at || item.created_at),
    trend: "Latest",
    score: Math.round(Number(item.score || 0)),
    url: articleUrl,
    detailUrl: articleUrl,
  };
}

function normalizeSummaryText(value) {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  if (typeof value !== "string") {
    return value ? String(value) : "";
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.join(" ");
    }
  } catch {
    return value;
  }

  return value;
}

export function clusterToStory(cluster) {
  const latestSummary = cluster.ai_summaries
    ?.slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  const rawItems = cluster.story_sources
    .map((storySource) => storySource.raw_items)
    .filter((item) => item?.platform === "reddit");
  const sources = Array.from(
    new Set(
      rawItems.map((item) => item.sources?.name).filter((sourceName) => sourceName)
    )
  );
  const leadItem = rawItems[0];
  const leadUrl = leadItem?.raw_payload?.linked_article_url || leadItem?.url;
  const sourceCount = sources.length || cluster.source_count || rawItems.length;
  const hasRedditSignal = rawItems.some((item) => item.platform === "reddit");
  const inferredTopic = hasRedditSignal
    ? getTopicFromRedditSource(sources[0])
    : "Top";
  const topic =
    cluster.topic && cluster.topic !== "News" ? cluster.topic : inferredTopic;

  return {
    id: cluster.id,
    headline: latestSummary?.headline || cluster.title,
    summary:
      normalizeSummaryText(latestSummary?.summary) ||
      leadItem?.snippet ||
      `${rawItems.length} related article${rawItems.length === 1 ? "" : "s"} grouped into this story.`,
    topic,
    sourceCount,
    sources: sources.length > 0 ? sources : ["Unknown source"],
    timestamp: formatRelativeTime(cluster.last_seen_at || cluster.created_at),
    score: Math.round(Number(cluster.score || 0)),
    trend: getTrendLabel({
      score: Math.round(Number(cluster.score || 0)),
      sourceCount,
    }),
    url: leadUrl,
    detailUrl: leadUrl,
  };
}
