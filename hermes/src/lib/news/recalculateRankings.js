import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateStoryScore } from "@/lib/news/rank";

export async function recalculateStoryRankings({ limit = 100 } = {}) {
  const { data: clusters, error } = await supabaseAdmin
    .from("story_clusters")
    .select(
      `
        id,
        topic,
        source_count,
        first_seen_at,
        last_seen_at
      `
    )
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const updates = [];

  for (const cluster of clusters) {
    const score = calculateStoryScore({
      firstSeenAt: cluster.first_seen_at,
      lastSeenAt: cluster.last_seen_at,
      sourceCount: cluster.source_count,
      topic: cluster.topic,
    });

    const { error: updateError } = await supabaseAdmin
      .from("story_clusters")
      .update({ score })
      .eq("id", cluster.id);

    if (updateError) {
      throw updateError;
    }

    updates.push({
      id: cluster.id,
      score,
    });
  }

  return {
    updated: updates.length,
    rankings: updates,
  };
}
