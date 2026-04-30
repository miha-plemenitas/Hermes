"use client";

import { useState } from "react";
import { topics } from "@/data/mockStories";
import {
  defaultPreferences,
  PREFERENCES_STORAGE_KEY,
} from "@/lib/preferences";
import { Ban, Check, MapPin, SlidersHorizontal } from "lucide-react";

function readPreferences() {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);

    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export default function SettingsForm() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [saved, setSaved] = useState(false);

  function updatePreference(key, value) {
    setSaved(false);
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleTopic(topic) {
    const selectedTopics = preferences.preferredTopics.includes(topic)
      ? preferences.preferredTopics.filter((item) => item !== topic)
      : [...preferences.preferredTopics, topic];

    updatePreference("preferredTopics", selectedTopics);
  }

  function savePreferences(event) {
    event.preventDefault();
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
    setSaved(true);
  }

  return (
    <form className="space-y-6" onSubmit={savePreferences}>
      <section className="ink-panel-yellow p-4">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <SlidersHorizontal size={22} strokeWidth={3} />
          Preferences
        </h2>
        <p className="mt-2 text-sm font-bold">
          These settings are saved locally in this browser.
        </p>
      </section>

      <section className="ink-panel p-4">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase">
          <Check size={16} strokeWidth={3} />
          Preferred topics
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics
            .filter((topic) => topic !== "Top")
            .map((topic) => {
              const selected = preferences.preferredTopics.includes(topic);

              return (
                <button
                  className={`ink-button px-4 py-2 text-sm font-black ${
                    selected ? "bg-black text-white" : "bg-white text-black"
                  }`}
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  type="button"
                >
                  {topic}
                </button>
              );
            })}
        </div>
      </section>

      <section className="ink-panel grid gap-4 p-4 sm:grid-cols-2">
        <label>
          <span className="flex items-center gap-2 text-sm font-black uppercase">
            <MapPin size={16} strokeWidth={3} />
            Region
          </span>
          <select
            className="mt-2 h-12 w-full border-2 border-black bg-white px-3 text-base font-bold"
            onChange={(event) => updatePreference("region", event.target.value)}
            value={preferences.region}
          >
            <option value="us">United States</option>
            <option value="gb">United Kingdom</option>
            <option value="eu">Europe</option>
            <option value="global">Global</option>
          </select>
        </label>

        <label>
          <span className="flex items-center gap-2 text-sm font-black uppercase">
            <Ban size={16} strokeWidth={3} />
            Blocked sources
          </span>
          <input
            className="mt-2 h-12 w-full border-2 border-black bg-white px-3 text-base font-bold"
            onChange={(event) =>
              updatePreference("blockedSources", event.target.value)
            }
            placeholder="r/news, r/worldnews"
            value={preferences.blockedSources}
          />
        </label>
      </section>

      <button
        className="ink-button h-12 w-full bg-black text-sm font-black uppercase text-white sm:w-auto sm:px-8"
        type="submit"
      >
        Save preferences
      </button>

      {saved ? (
        <p className="ink-panel-yellow p-3 text-sm font-black">
          Preferences saved.
        </p>
      ) : null}
    </form>
  );
}
