const TOPIC_WEIGHTS = {
  Business: 8,
  News: 6,
  Science: 6,
  Tech: 8,
  Gaming: 7,
  World: 8,
};

function hoursSince(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return 24;
  }

  return Math.max(0, (Date.now() - date.getTime()) / 36e5);
}

function getRecencyScore(lastSeenAt) {
  const hours = hoursSince(lastSeenAt);

  if (hours <= 1) {
    return 50;
  }

  if (hours <= 6) {
    return 42;
  }

  if (hours <= 24) {
    return 30;
  }

  if (hours <= 72) {
    return 16;
  }

  return 5;
}

function getSourceScore(sourceCount) {
  return Math.min(30, Math.max(1, sourceCount) * 8);
}

function getTrendScore({ firstSeenAt, lastSeenAt, sourceCount }) {
  const spreadHours = Math.max(1, hoursSince(firstSeenAt) - hoursSince(lastSeenAt));

  if (sourceCount > 1 && spreadHours <= 6) {
    return 12;
  }

  if (sourceCount > 1) {
    return 8;
  }

  return 2;
}

function getTopicScore(topic) {
  return TOPIC_WEIGHTS[topic] || 4;
}

export function calculateStoryScore({
  firstSeenAt,
  lastSeenAt,
  sourceCount,
  topic,
}) {
  return Math.round(
    getRecencyScore(lastSeenAt) +
      getSourceScore(sourceCount) +
      getTrendScore({ firstSeenAt, lastSeenAt, sourceCount }) +
      getTopicScore(topic)
  );
}

export function getTrendLabel({ score, sourceCount }) {
  if (sourceCount > 1 && score >= 80) {
    return "Trending";
  }

  if (sourceCount > 1) {
    return "Clustered";
  }

  if (score >= 70) {
    return "Important";
  }

  return "Latest";
}
