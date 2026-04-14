import { toggleVote } from "@/lib/votes";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, userId } = await req.json();
    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const { voted, count } = await toggleVote(id, userId);
    return NextResponse.json({ votes: count, voted });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Failed to vote:", msg);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
