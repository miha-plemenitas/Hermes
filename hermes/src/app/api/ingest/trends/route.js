import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hermes is configured for Reddit-first ingestion.",
    sources: [
      {
        name: "Reddit trends",
        endpoint: "/api/ingest/reddit",
        status: "available",
        notes: "Uses public subreddit JSON from selected subreddits.",
      },
    ],
    suggestedFlow: [
      "/api/ingest/reddit",
      "/api/cluster",
      "/api/rank",
      "/api/feed",
    ],
  });
}
