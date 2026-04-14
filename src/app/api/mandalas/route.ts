import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getAllVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

export interface MandalaEntry {
  id: string;
  seed: number;
  fills: Record<string, string>;
  name: string;
  description: string;
  author: string;
  userId: string;
  votes: number;
  votedBy: string[];
  timestamp: number;
}

// GET /api/mandalas — list all saved mandalas with vote counts
export async function GET() {
  try {
    const [{ blobs }, votesMap] = await Promise.all([
      list({ prefix: "mandalas/" }),
      getAllVotes(),
    ]);

    const mandalas: MandalaEntry[] = [];
    for (const blob of blobs) {
      try {
        const res = await fetch(blob.url);
        const data = (await res.json()) as MandalaEntry;
        // Merge votes from separate vote blobs
        data.votedBy = votesMap[data.id] || [];
        data.votes = data.votedBy.length;
        mandalas.push(data);
      } catch {
        // skip corrupted entries
      }
    }

    mandalas.sort((a, b) => b.votes - a.votes || b.timestamp - a.timestamp);

    return NextResponse.json(mandalas, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("Failed to list mandalas:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/mandalas — save a new mandala (immutable)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seed, fills, name, description, author, userId } = body;

    if (!seed || !name || !author || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = `${seed}-${Date.now()}`;
    const entry: MandalaEntry = {
      id,
      seed,
      fills: fills || {},
      name: name.slice(0, 100),
      description: (description || "").slice(0, 300),
      author: author.slice(0, 50),
      userId,
      votes: 0,
      votedBy: [],
      timestamp: Date.now(),
    };

    await put(`mandalas/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to save mandala:", error);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
