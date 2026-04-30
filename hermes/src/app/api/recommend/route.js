import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const GROQ_MODEL = "llama-3.1-8b-instant";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

function normalizeStory(story) {
  return {
    id: story.id,
    headline: story.headline,
    summary: story.summary,
    topic: story.topic,
    sourceCount: story.sourceCount,
    sources: story.sources,
    trend: story.trend,
    score: story.score,
    timestamp: story.timestamp,
  };
}

function buildPrompt(stories, preferences) {
  const storyContext = stories
    .slice(0, 20)
    .map((story, index) => {
      return [
        `Story ${index + 1}`,
        `ID: ${story.id}`,
        `Topic: ${story.topic}`,
        `Headline: ${story.headline}`,
        `Summary: ${story.summary}`,
        `Sources: ${(story.sources || []).join(", ")}`,
        `Score: ${story.score}`,
        `Trend: ${story.trend}`,
      ].join("\n");
    })
    .join("\n\n");

  return `You rank news stories for a personal news app.

User preferences:
- Preferred topics: ${(preferences.preferredTopics || []).join(", ") || "none"}
- Blocked sources: ${(preferences.blockedSources || []).join(", ") || "none"}
- Region: ${preferences.region || "unknown"}

Rules:
- Rank the stories from most relevant to least relevant for this user.
- If preferences are sparse, favor broadly interesting, fresh, high-signal stories.
- Do not invent facts.
- Return JSON only with a key "ranked" containing an array of objects with "id" and "reason".
- Include at most 10 stories in the ranked array.

Stories:
${storyContext}`;
}

function parseResponse(text) {
  try {
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed.ranked)) {
      return [];
    }

    return parsed.ranked
      .filter((item) => item && typeof item.id === "string")
      .map((item, index) => ({
        id: item.id,
        reason:
          typeof item.reason === "string" && item.reason.trim()
            ? item.reason.trim()
            : "Matched your interests.",
        rank: index,
      }));
  } catch {
    return [];
  }
}

function fallbackRankStories(stories, preferences) {
  const preferredTopics = new Set(preferences.preferredTopics || []);
  const blockedSources = (preferences.blockedSources || [])
    .flatMap((value) => String(value).split(","))
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);

  return stories
    .filter((story) => {
      if (blockedSources.length === 0) {
        return true;
      }

      return !story.sources?.some((source) =>
        blockedSources.some((blockedSource) =>
          String(source).toLowerCase().includes(blockedSource)
        )
      );
    })
    .sort((a, b) => {
      const aPreferred = preferredTopics.has(a.topic);
      const bPreferred = preferredTopics.has(b.topic);

      if (aPreferred !== bPreferred) {
        return aPreferred ? -1 : 1;
      }

      return Number(b.score || 0) - Number(a.score || 0);
    })
    .slice(0, 10)
    .map((story) => ({
      id: story.id,
      reason:
        preferredTopics.size > 0 && preferredTopics.has(story.topic)
          ? `Matches your preferred ${story.topic} topic.`
          : "Strong overall relevance and freshness.",
    }));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const stories = Array.isArray(body?.stories) ? body.stories.map(normalizeStory) : [];
    const preferredTopics = Array.isArray(body?.preferences?.preferredTopics)
      ? body.preferences.preferredTopics
      : typeof body?.preferences?.preferredTopics === "string"
        ? body.preferences.preferredTopics
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];
    const blockedSources = Array.isArray(body?.preferences?.blockedSources)
      ? body.preferences.blockedSources
      : typeof body?.preferences?.blockedSources === "string"
        ? body.preferences.blockedSources
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];
    const preferences = {
      preferredTopics,
      blockedSources,
      region: body?.preferences?.region || "us",
    };

    if (stories.length === 0) {
      return NextResponse.json({
        mode: "empty",
        ranked: [],
      });
    }

    const groq = getGroqClient();

    if (!groq) {
      return NextResponse.json({
        mode: "fallback",
        ranked: fallbackRankStories(stories, preferences),
      });
    }

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You rank news stories for a personal news app. Return only valid JSON.",
        },
        {
          role: "user",
          content: buildPrompt(stories, preferences),
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const ranked = parseResponse(response.choices[0]?.message?.content || "");

    return NextResponse.json({
      mode: "groq",
      ranked: ranked.length > 0 ? ranked : fallbackRankStories(stories, preferences),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to rank stories.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
