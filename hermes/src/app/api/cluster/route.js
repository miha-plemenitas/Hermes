import { NextResponse } from "next/server";
import { clusterRawItems } from "@/lib/news/cluster";

export async function GET() {
  try {
    const result = await clusterRawItems();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to cluster raw items.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
