import { supabaseAdmin } from "@/lib/supabase/admin";
import { clusterToStory, formatRelativeTime } from "@/lib/news/format";

export async function getStoryDetail(id) {
  const { data, error } = await supabaseAdmin
    .from("story_clusters")
    .select(
      `
        id,
        title,
        topic,
        score,
        source_count,
        first_seen_at,
        last_seen_at,
        created_at,
        ai_summaries (
          headline,
          summary,
          created_at
        ),
        story_sources (
          raw_items (
            id,
            title,
            url,
            snippet,
            platform,
            published_at,
            created_at,
            raw_payload,
            sources (
              name
            )
          )
        )
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const story = clusterToStory(data);
  const sourceItems = data.story_sources
    .map((storySource) => storySource.raw_items)
    .filter(Boolean)
    .map((item) => ({
      id: item.id,
      title: item.title,
      url: item.raw_payload?.linked_article_url || item.url,
      snippet: item.snippet,
      source: item.sources?.name || "Unknown source",
      timestamp: formatRelativeTime(item.published_at || item.created_at),
    }));

  return {
    ...story,
    sourceItems,
    firstSeen: formatRelativeTime(data.first_seen_at),
    lastSeen: formatRelativeTime(data.last_seen_at),
  };
}
