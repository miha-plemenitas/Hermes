import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateStoryScore } from "@/lib/news/rank";
import { getTopicFromRawItem } from "@/lib/news/topics";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "in",
  "is",
  "it",
  "its",
  "new",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
]);

function getTimeBucket(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getTitleKeywords(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 6);
}

function getClusterKey(item) {
  const keywords = getTitleKeywords(item.title);
  const bucket = getTimeBucket(item.published_at || item.created_at);

  if (keywords.length === 0) {
    return `${bucket}:${item.id}`;
  }

  return `${bucket}:${keywords.slice(0, 4).sort().join("-")}`;
}

function groupItems(items) {
  const groups = new Map();

  for (const item of items) {
    const key = getClusterKey(item);
    const existingGroup = groups.get(key) || [];

    existingGroup.push(item);
    groups.set(key, existingGroup);
  }

  return Array.from(groups.values());
}

function getClusterTitle(items) {
  return items
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.published_at || a.created_at).getTime();
      const bTime = new Date(b.published_at || b.created_at).getTime();

      return bTime - aTime;
    })[0].title;
}

function getDateRange(items) {
  const timestamps = items
    .map((item) => new Date(item.published_at || item.created_at).getTime())
    .filter((time) => !Number.isNaN(time));

  if (timestamps.length === 0) {
    const now = new Date().toISOString();

    return {
      firstSeenAt: now,
      lastSeenAt: now,
    };
  }

  return {
    firstSeenAt: new Date(Math.min(...timestamps)).toISOString(),
    lastSeenAt: new Date(Math.max(...timestamps)).toISOString(),
  };
}

function getClusterTopic(items) {
  const topicCounts = new Map();

  for (const item of items) {
    const topic = getTopicFromRawItem(item);

    if (topic === "Top") {
      continue;
    }

    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  }

  if (topicCounts.size === 0) {
    return "Top";
  }

  return Array.from(topicCounts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  })[0][0];
}

export async function clusterRawItems({ limit = 100 } = {}) {
  const { data: rawItems, error: rawItemsError } = await supabaseAdmin
    .from("raw_items")
    .select(
      `
        id,
        title,
        platform,
        published_at,
        created_at,
        raw_payload,
        sources (
          name
        ),
        story_sources (
          id
        )
      `
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (rawItemsError) {
    throw rawItemsError;
  }

  const unclusteredItems = rawItems.filter(
    (item) => !item.story_sources || item.story_sources.length === 0
  );
  const groups = groupItems(unclusteredItems);
  let createdClusters = 0;
  let linkedItems = 0;

  for (const group of groups) {
    const { firstSeenAt, lastSeenAt } = getDateRange(group);
    const topic = getClusterTopic(group);
    const score = calculateStoryScore({
      firstSeenAt,
      lastSeenAt,
      sourceCount: group.length,
      topic,
    });

    const { data: cluster, error: clusterError } = await supabaseAdmin
      .from("story_clusters")
      .insert({
        title: getClusterTitle(group),
        topic,
        score,
        source_count: group.length,
        first_seen_at: firstSeenAt,
        last_seen_at: lastSeenAt,
      })
      .select("id")
      .single();

    if (clusterError) {
      throw clusterError;
    }

    createdClusters += 1;

    const links = group.map((item) => ({
      story_cluster_id: cluster.id,
      raw_item_id: item.id,
    }));

    const { error: linksError } = await supabaseAdmin
      .from("story_sources")
      .upsert(links, {
        onConflict: "story_cluster_id,raw_item_id",
      });

    if (linksError) {
      throw linksError;
    }

    linkedItems += links.length;
  }

  return {
    createdClusters,
    linkedItems,
    scannedItems: rawItems.length,
    unclusteredItems: unclusteredItems.length,
  };
}
