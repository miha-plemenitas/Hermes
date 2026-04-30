import { supabaseAdmin } from "@/lib/supabase/admin";
import { rawItemToStory } from "@/lib/news/format";

const TIME_RANGE_DAYS = {
  day: 1,
  week: 7,
  month: 30,
};

function getSinceDate(range) {
  const days = TIME_RANGE_DAYS[range];

  if (!days) {
    return null;
  }

  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesQuery(item, query) {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return true;
  }

  const haystack = `${item.title || ""} ${item.snippet || ""}`.toLowerCase();

  if (trimmedQuery.length <= 3) {
    return new RegExp(`\\b${escapeRegex(trimmedQuery)}\\b`, "i").test(haystack);
  }

  return haystack.includes(trimmedQuery);
}

export async function searchRawItems({
  query = "",
  platform = "",
  source = "",
  time = "",
  limit = 30,
} = {}) {
  let builder = supabaseAdmin
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
    );

  builder = builder.eq("platform", platform || "reddit");

  if (source) {
    builder = builder.ilike("sources.name", `%${source}%`);
  }

  const sinceDate = getSinceDate(time);

  if (sinceDate) {
    builder = builder.gte("published_at", sinceDate);
  }

  const fetchLimit = query.trim() ? Math.max(limit * 5, 100) : limit;
  const { data, error } = await builder
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  if (error) {
    throw error;
  }

  return data
    .filter((item) => matchesQuery(item, query))
    .slice(0, limit)
    .map(rawItemToStory);
}
