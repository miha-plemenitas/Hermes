import { NextResponse } from "next/server";
import {
  getClustersWithoutSummaries,
  summarizeCluster,
} from "@/lib/ai/summarizeStory";

export async function GET() {
  try {
    const clusters = await getClustersWithoutSummaries();
    const summaries = [];

    for (const cluster of clusters) {
      const summary = await summarizeCluster(cluster);

      summaries.push(summary);
    }

    return NextResponse.json({
      scanned: clusters.length,
      created: summaries.length,
      summaries,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to summarize story clusters.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
