import { list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import type { MandalaEntry } from "../route";
import { deleteVotesForMandala } from "@/lib/votes";

export const dynamic = "force-dynamic";

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

    // Verify ownership
    const res = await fetch(blob.url);
    const entry = (await res.json()) as MandalaEntry;
    if (entry.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await Promise.all([
      del(blob.url),
      deleteVotesForMandala(id),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete mandala:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
