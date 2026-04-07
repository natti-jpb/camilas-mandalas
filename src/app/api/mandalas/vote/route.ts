import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { MandalaEntry } from "../route";

export const dynamic = "force-dynamic";

// POST /api/mandalas/vote — toggle vote for a mandala (one per user)
export async function POST(req: NextRequest) {
  try {
    const { id, userId } = await req.json();
    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const { blobs } = await list({ prefix: `mandalas/${id}.json` });
    const blob = blobs[0];
    if (!blob) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const res = await fetch(blob.url);
    const entry = (await res.json()) as MandalaEntry;

    // Ensure votedBy exists (backward compat with old entries)
    if (!entry.votedBy) entry.votedBy = [];

    const alreadyVoted = entry.votedBy.includes(userId);

    if (alreadyVoted) {
      // Unlike
      entry.votedBy = entry.votedBy.filter((u) => u !== userId);
      entry.votes = entry.votedBy.length;
    } else {
      // Like
      entry.votedBy.push(userId);
      entry.votes = entry.votedBy.length;
    }

    await put(`mandalas/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "public",
    });

    return NextResponse.json({ votes: entry.votes, voted: !alreadyVoted });
  } catch (error) {
    console.error("Failed to vote:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
