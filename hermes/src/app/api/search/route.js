import { NextResponse } from "next/server";
import { searchRawItems } from "@/lib/news/search";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    const stories = await searchRawItems({
      query: searchParams.get("q") || "",
      platform: searchParams.get("platform") || "",
      source: searchParams.get("source") || "",
      time: searchParams.get("time") || "",
    });

    return NextResponse.json({
      count: stories.length,
      stories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to search stories.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
