import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase/admin";

const GEMINI_SUMMARY_MODEL = "gemini-2.0-flash";
const GROQ_SUMMARY_MODEL = "llama-3.1-8b-instant";
const OPENAI_SUMMARY_MODEL = "gpt-4.1-mini";
const PROMPT_VERSION = "story-summary-v1";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

function buildSummaryPrompt(cluster) {
  const items = cluster.story_sources
    .slice(0, 8)
    .map((storySource, index) => {
      const item = storySource.raw_items;
      const source = item?.sources?.name || "Unknown source";

      return [
        `Article ${index + 1}`,
        `Title: ${item?.title || "Untitled"}`,
        `Source: ${source}`,
        `Published: ${item?.published_at || "Unknown"}`,
        `Snippet: ${item?.snippet || "No snippet available."}`,
      ].join("\n");
    })
    .join("\n\n");

  return `Summarize this news story cluster for a personal news dashboard.

Rules:
- Use only the article titles, snippets, source names, and timestamps below.
- Do not add facts that are not present in the source context.
- Write a concise headline.
- Write a neutral 3 sentence summary as one plain string, not an array.
- Return JSON only with keys "headline" and "summary".

Cluster title: ${cluster.title}

Source context:
${items}`;
}

function normalizeSummaryText(value) {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  if (typeof value !== "string") {
    return value ? String(value) : "No summary generated.";
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

function parseSummaryResponse(text, fallbackHeadline) {
  try {
    const parsed = JSON.parse(text);

    return {
      headline: parsed.headline || fallbackHeadline,
      summary: normalizeSummaryText(parsed.summary),
    };
  } catch {
    return {
      headline: fallbackHeadline,
      summary: normalizeSummaryText(text),
    };
  }
}

async function generateSummaryWithGemini(prompt) {
  const gemini = getGeminiClient();

  if (!gemini) {
    return null;
  }

  const response = await gemini.models.generateContent({
    model: GEMINI_SUMMARY_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          summary: { type: Type.STRING },
        },
        required: ["headline", "summary"],
      },
    },
  });

  return {
    model: `gemini:${GEMINI_SUMMARY_MODEL}`,
    text: response.text,
  };
}

async function generateSummaryWithGroq(prompt) {
  const groq = getGroqClient();

  if (!groq) {
    return null;
  }

  const response = await groq.chat.completions.create({
    model: GROQ_SUMMARY_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You summarize news story clusters. Respond only with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  return {
    model: `groq:${GROQ_SUMMARY_MODEL}`,
    text: response.choices[0]?.message?.content || "",
  };
}

async function generateSummaryWithOpenAI(prompt) {
  const openai = getOpenAIClient();

  if (!openai) {
    return null;
  }

  const response = await openai.responses.create({
    model: OPENAI_SUMMARY_MODEL,
    input: prompt,
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  return {
    model: `openai:${OPENAI_SUMMARY_MODEL}`,
    text: response.output_text,
  };
}

async function generateSummary(prompt) {
  const groqResult = await generateSummaryWithGroq(prompt);

  if (groqResult) {
    return groqResult;
  }

  const geminiResult = await generateSummaryWithGemini(prompt);

  if (geminiResult) {
    return geminiResult;
  }

  const openaiResult = await generateSummaryWithOpenAI(prompt);

  if (openaiResult) {
    return openaiResult;
  }

  throw new Error("Missing GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY.");
}

export async function getClustersWithoutSummaries({ limit = 5 } = {}) {
  const { data, error } = await supabaseAdmin
    .from("story_clusters")
    .select(
      `
        id,
        title,
        ai_summaries (
          id
        ),
        story_sources (
          raw_items (
            id,
            title,
            snippet,
            published_at,
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

  return data.filter(
    (cluster) => !cluster.ai_summaries || cluster.ai_summaries.length === 0
  );
}

export async function summarizeCluster(cluster) {
  const prompt = buildSummaryPrompt(cluster);
  const generated = await generateSummary(prompt);
  const parsed = parseSummaryResponse(generated.text, cluster.title);
  const sourceItemIds = cluster.story_sources
    .map((storySource) => storySource.raw_items?.id)
    .filter(Boolean);

  const { data, error } = await supabaseAdmin
    .from("ai_summaries")
    .insert({
      story_cluster_id: cluster.id,
      headline: parsed.headline,
      summary: parsed.summary,
      model: generated.model,
      prompt_version: PROMPT_VERSION,
      source_item_ids: sourceItemIds,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    storyClusterId: cluster.id,
  };
}
