import { supabaseAdmin } from "@/lib/supabase/admin";
import { clusterToStory, rawItemToStory } from "@/lib/news/format";

export async function getClusterFeedStories({ limit = 50 } = {}) {
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
    .order("score", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data.map(clusterToStory).filter((story) => story.url);
}

export async function getFeedStories({ limit = 50 } = {}) {
  const clusterStories = await getClusterFeedStories({ limit });

  if (clusterStories.length > 0) {
    return {
      mode: "story_clusters",
      stories: clusterStories,
    };
  }

  return {
    mode: "raw_items",
    stories: await getRawFeedStories({ limit }),
  };
}

export async function getRawFeedStories({ limit = 50 } = {}) {
  const { data, error } = await supabaseAdmin
    .from("raw_items")
    .select(
      `
        id,
        title,
        url,
        snippet,
        platform,
        published_at,
        created_at,
        raw_payload,
        score,
        sources (
          name
        )
      `
    )
    .eq("platform", "reddit")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data.map(rawItemToStory);
}
