import { NextResponse } from "next/server";
import { getFeedStories } from "@/lib/news/feed";

export async function GET() {
  try {
    const feed = await getFeedStories({ limit: 50 });

    return NextResponse.json({
      mode: feed.mode,
      count: feed.stories.length,
      stories: feed.stories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load feed.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
