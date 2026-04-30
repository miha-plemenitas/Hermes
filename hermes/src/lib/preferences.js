export const PREFERENCES_STORAGE_KEY = "hermes.preferences";

export const defaultPreferences = {
  blockedSources: "",
  preferredTopics: [],
  region: "us",
};

export function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
