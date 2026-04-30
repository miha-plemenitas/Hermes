import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const REDDIT_BASE_URL = "https://www.reddit.com";
const SUBREDDITS = ["worldnews", "news", "technology", "science", "business"];

function getRedditSource(subreddit) {
  return {
    name: `r/${subreddit}`,
    platform: "reddit",
    url: `${REDDIT_BASE_URL}/r/${subreddit}`,
  };
}

async function getOrCreateRedditSource(subreddit) {
  const source = getRedditSource(subreddit);
  const { data: existingSources, error: selectError } = await supabaseAdmin
    .from("sources")
    .select("id")
    .eq("name", source.name)
    .eq("platform", source.platform)
    .limit(1);

  if (selectError) {
    throw selectError;
  }

  if (existingSources.length > 0) {
    return existingSources[0];
  }

  const { data: createdSource, error: insertError } = await supabaseAdmin
    .from("sources")
    .insert(source)
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return createdSource;
}

function normalizePost(post, subreddit) {
  const linkedArticleUrl = post.url?.startsWith("http")
    ? post.url
    : `${REDDIT_BASE_URL}${post.permalink}`;
  const redditUrl = `${REDDIT_BASE_URL}${post.permalink}`;
  const createdAt = new Date(post.created_utc * 1000).toISOString();

  return {
    external_id: post.id,
    platform: "reddit",
    title: post.title,
    url: redditUrl,
    snippet: `Reddit discussion in r/${subreddit}: ${post.num_comments || 0} comments, ${post.score || 0} score.`,
    author: post.author || null,
    image_url: post.thumbnail?.startsWith("http") ? post.thumbnail : null,
    published_at: createdAt,
    score: Math.round((post.score || 0) / 20 + (post.num_comments || 0) / 5),
    raw_payload: {
      ...post,
      reddit_url: redditUrl,
      linked_article_url: linkedArticleUrl,
    },
  };
}

async function fetchSubredditPosts(subreddit) {
  const response = await fetch(
    `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=10`,
    {
      cache: "no-store",
      headers: {
        "User-Agent": "HermesNewsMVP/0.1",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Reddit request failed for r/${subreddit}: ${response.status}`);
  }

  const payload = await response.json();
  const children = payload?.data?.children;

  if (!Array.isArray(children)) {
    return [];
  }

  return children
    .map((child) => child.data)
    .filter((post) => post?.id && post?.title && !post.stickied);
}

export async function GET() {
  try {
    let inserted = 0;
    const perSubreddit = [];

    for (const subreddit of SUBREDDITS) {
      const source = await getOrCreateRedditSource(subreddit);
      const posts = await fetchSubredditPosts(subreddit);
      const rows = posts.map((post) => ({
        ...normalizePost(post, subreddit),
        source_id: source.id,
      }));

      if (rows.length === 0) {
        perSubreddit.push({ subreddit, inserted: 0 });
        continue;
      }

      const { data, error } = await supabaseAdmin
        .from("raw_items")
        .upsert(rows, {
          onConflict: "url",
        })
        .select("id");

      if (error) {
        throw error;
      }

      inserted += data.length;
      perSubreddit.push({ subreddit, inserted: data.length });
    }

    return NextResponse.json({
      inserted,
      source: "reddit",
      subreddits: perSubreddit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to ingest Reddit posts.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
