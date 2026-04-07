import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { MandalaEntry } from "../route";

export const dynamic = "force-dynamic";

// POST /api/mandalas/vote — vote for a mandala
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { blobs } = await list({ prefix: `mandalas/${id}.json` });
    const blob = blobs[0];
    if (!blob) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const res = await fetch(blob.url);
    const entry = (await res.json()) as MandalaEntry;
    entry.votes += 1;

    await put(`mandalas/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "public",
    });

    return NextResponse.json({ votes: entry.votes });
  } catch (error) {
    console.error("Failed to vote:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
