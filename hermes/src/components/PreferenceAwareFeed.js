"use client";

import { useMemo, useState } from "react";
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

export default function PreferenceAwareFeed({ stories }) {
  const [preferences] = useState(getStoredPreferences);

  const filteredStories = useMemo(() => {
    const blockedSources = parseList(preferences.blockedSources.toLowerCase());
    const preferredTopics = preferences.preferredTopics;

    return stories
      .filter((story) => {
        if (blockedSources.length === 0) {
          return true;
        }

        return !story.sources.some((source) =>
          blockedSources.some((blockedSource) =>
            source.toLowerCase().includes(blockedSource)
          )
        );
      })
      .sort((a, b) => {
        const aPreferred = preferredTopics.includes(a.topic);
        const bPreferred = preferredTopics.includes(b.topic);

        if (aPreferred === bPreferred) {
          return b.score - a.score;
        }

        return aPreferred ? -1 : 1;
      });
  }, [preferences, stories]);

  return (
    <div className="space-y-4" aria-label="Story feed">
      {filteredStories.length > 0 ? (
        filteredStories.map((story) => <StoryCard key={story.id} story={story} />)
      ) : (
        <div className="ink-panel-yellow p-4">
          <h2 className="text-xl font-black">No stories match preferences.</h2>
          <p className="mt-2 text-sm font-bold">
            Adjust blocked sources or preferred topics in Settings.
          </p>
        </div>
      )}
    </div>
  );
}
