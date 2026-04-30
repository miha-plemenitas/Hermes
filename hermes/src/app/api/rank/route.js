import { NextResponse } from "next/server";
import { recalculateStoryRankings } from "@/lib/news/recalculateRankings";

export async function GET() {
  try {
    const result = await recalculateStoryRankings();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to recalculate rankings.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
