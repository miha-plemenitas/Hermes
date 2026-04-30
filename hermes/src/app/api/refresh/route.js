import { NextResponse } from "next/server";
import { runDailyRefresh } from "@/lib/news/runDailyRefresh";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await runDailyRefresh();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to run daily refresh.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
