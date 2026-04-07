import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { MandalaEntry } from "../route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, userId } = await req.json();
    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const { blobs } = await list({ prefix: `mandalas/${id}` });
    const blob = blobs[0];
    if (!blob) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const res = await fetch(blob.url, { cache: "no-store" });
    const entry = (await res.json()) as MandalaEntry;

    if (!entry.votedBy) entry.votedBy = [];

    const alreadyVoted = entry.votedBy.includes(userId);

    if (alreadyVoted) {
      entry.votedBy = entry.votedBy.filter((u) => u !== userId);
    } else {
      entry.votedBy.push(userId);
    }
    entry.votes = entry.votedBy.length;

    // Overwrite in place — never delete first, to avoid data loss
    await put(blob.pathname, JSON.stringify(entry), {
      contentType: "application/json",
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ votes: entry.votes, voted: !alreadyVoted, votedBy: entry.votedBy });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Failed to vote:", msg);
    return NextResponse.json({ error: "Failed to vote", detail: msg }, { status: 500 });
  }
}
