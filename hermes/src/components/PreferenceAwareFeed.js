"use client";

import { useEffect, useMemo, useState } from "react";
import StoryCard from "@/components/StoryCard";
import {
  defaultPreferences,
  parseList,
  PREFERENCES_STORAGE_KEY,
} from "@/lib/preferences";

function getStoredPreferences() {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);

    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function storyMatchesTab(story, activeTab, preferredTopics) {
  if (activeTab === "tech") {
    return story.topic === "Tech";
  }

  if (activeTab === "gaming") {
    return story.topic === "Gaming";
  }

  if (activeTab === "for-you") {
    if (preferredTopics.length === 0) {
      return true;
    }

    return preferredTopics.includes(story.topic);
  }

  return true;
}

function sortStoriesByScore(stories, preferredTopics = []) {
  return stories.slice().sort((a, b) => {
    const aPreferred = preferredTopics.includes(a.topic);
    const bPreferred = preferredTopics.includes(b.topic);

    if (aPreferred === bPreferred) {
      return Number(b.score || 0) - Number(a.score || 0);
    }

    return aPreferred ? -1 : 1;
  });
}

function mergeRankedStories(stories, ranked) {
  if (ranked.length === 0) {
    return stories;
  }

  const ranking = new Map(
    ranked.map((entry, index) => [
      entry.id,
      {
        index,
        reason: entry.reason,
      },
    ])
  );

  return stories
    .map((story) => {
      const rankedEntry = ranking.get(story.id);

      return {
        ...story,
        matchReason: rankedEntry?.reason,
        _rankIndex:
          typeof rankedEntry?.index === "number" ? rankedEntry.index : Number.POSITIVE_INFINITY,
      };
    })
    .sort((a, b) => {
      if (a._rankIndex !== b._rankIndex) {
        return a._rankIndex - b._rankIndex;
      }

      return Number(b.score || 0) - Number(a.score || 0);
    })
    .map(({ _rankIndex, ...story }) => story);
}

export default function PreferenceAwareFeed({ stories, activeTab = "top" }) {
  const [preferences] = useState(getStoredPreferences);
  const [rankedStories, setRankedStories] = useState([]);
  const [rankingMode, setRankingMode] = useState("idle");

  const filteredStories = useMemo(() => {
    const blockedSources = parseList(preferences.blockedSources.toLowerCase());
    const preferredTopics = preferences.preferredTopics;
    const filtered = stories.filter((story) =>
      storyMatchesTab(story, activeTab, preferredTopics)
    );

    return filtered.filter((story) => {
      if (blockedSources.length === 0) {
        return true;
      }

      return !story.sources.some((source) =>
        blockedSources.some((blockedSource) =>
          source.toLowerCase().includes(blockedSource)
        )
      );
    });
  }, [activeTab, preferences, stories]);

  useEffect(() => {
    if (activeTab !== "for-you" || filteredStories.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadRecommendations() {
      setRankingMode("loading");

      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stories: filteredStories,
            preferences: {
              preferredTopics: preferences.preferredTopics,
              blockedSources: parseList(preferences.blockedSources),
              region: preferences.region,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Recommendation request failed.");
        }

        const payload = await response.json();

        if (!cancelled) {
          setRankedStories(Array.isArray(payload.ranked) ? payload.ranked : []);
          setRankingMode(payload.mode || "fallback");
        }
      } catch {
        if (!cancelled) {
          setRankedStories([]);
          setRankingMode("fallback");
        }
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    filteredStories,
    preferences.blockedSources,
    preferences.preferredTopics,
    preferences.region,
  ]);

  const visibleStories = useMemo(() => {
    const sorted = sortStoriesByScore(
      filteredStories,
      activeTab === "for-you" ? preferences.preferredTopics : []
    );

    if (activeTab !== "for-you") {
      return sorted;
    }

    return mergeRankedStories(sorted, rankedStories);
  }, [activeTab, filteredStories, preferences.preferredTopics, rankedStories]);

  return (
    <div className="space-y-4" aria-label="Story feed">
      {visibleStories.length > 0 ? (
        <>
          {activeTab === "for-you" ? (
            <div className="ink-panel-dark p-3 text-sm font-medium leading-6 text-white/80">
              <p className="font-black uppercase text-white">Groq picks</p>
              <p className="mt-1">
                {rankingMode === "loading"
                  ? "Personalizing this tab with Groq..."
                  : "Stories are ranked against your saved topics and current feed signal."}
              </p>
            </div>
          ) : null}
          {visibleStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </>
      ) : (
        <div className="ink-panel-yellow p-4">
          <h2 className="text-xl font-black">No stories match preferences.</h2>
          <p className="mt-2 text-sm font-bold">
            Try a different tab, or adjust blocked sources and preferred topics in Settings.
          </p>
        </div>
      )}
    </div>
  );
}
