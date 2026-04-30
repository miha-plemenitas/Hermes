const REDDIT_TOPIC_MATCHERS = [
  { topic: "Tech", matchers: ["technology", "tech", "programming", "computing"] },
  { topic: "Gaming", matchers: ["gaming", "games", "pcgaming", "gamedev"] },
  { topic: "Business", matchers: ["business", "finance", "stocks", "investing", "economy"] },
  { topic: "Science", matchers: ["science", "space", "astronomy", "physics"] },
  { topic: "World", matchers: ["worldnews", "news", "politics", "europe", "ukpolitics"] },
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^r\//, "")
    .trim();
}

function matchesAny(value, matchers) {
  return matchers.some((matcher) => value.includes(matcher));
}

export function getTopicFromRedditSource(sourceName = "") {
  const normalizedSource = normalizeText(sourceName);

  for (const entry of REDDIT_TOPIC_MATCHERS) {
    if (matchesAny(normalizedSource, entry.matchers)) {
      return entry.topic;
    }
  }

  return "Top";
}

export function getTopicFromRawItem(item = {}) {
  if (item.platform !== "reddit") {
    return "Top";
  }

  const sourceName = item.sources?.name || item.raw_payload?.subreddit || "";

  return getTopicFromRedditSource(sourceName);
}

export function getPreferredTopicLabel(topic = "") {
  const normalized = normalizeText(topic);

  if (normalized === "for-you" || normalized === "you may like") {
    return "You may like";
  }

  if (normalized === "top" || normalized === "top news") {
    return "Top news";
  }

  if (normalized === "tech") {
    return "Tech";
  }

  if (normalized === "gaming") {
    return "Gaming";
  }

  return topic;
}
