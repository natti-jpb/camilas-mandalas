import { list, put, del } from "@vercel/blob";

export type VotesMap = Record<string, string[]>;

/**
 * Vote storage: each vote is a separate blob at votes/{mandalaId}/{userId}.json
 * This avoids read-modify-write on a single blob (CDN stale read problem).
 * To vote: put a blob. To unvote: delete it. To count: list by prefix.
 */

export async function getVotesForMandala(mandalaId: string): Promise<string[]> {
  const { blobs } = await list({ prefix: `votes/${mandalaId}/` });
  return blobs.map((b) => {
    // Extract userId from pathname: votes/{mandalaId}/{userId}.json
    const parts = b.pathname.split("/");
    return parts[parts.length - 1].replace(".json", "");
  });
}

export async function getAllVotes(): Promise<VotesMap> {
  const { blobs } = await list({ prefix: "votes/" });
  const map: VotesMap = {};
  for (const blob of blobs) {
    // pathname: votes/{mandalaId}/{userId}.json
    const parts = blob.pathname.split("/");
    if (parts.length < 3) continue;
    const mandalaId = parts[1];
    const userId = parts[2].replace(".json", "");
    if (!map[mandalaId]) map[mandalaId] = [];
    map[mandalaId].push(userId);
  }
  return map;
}

export async function toggleVote(
  mandalaId: string,
  userId: string
): Promise<{ voted: boolean; count: number }> {
  const path = `votes/${mandalaId}/${userId}.json`;
  const { blobs } = await list({ prefix: path });

  if (blobs.length > 0) {
    // Already voted — remove
    await del(blobs[0].url);
    const remaining = await getVotesForMandala(mandalaId);
    return { voted: false, count: remaining.length };
  } else {
    // Not voted — add
    await put(path, JSON.stringify({ ts: Date.now() }), {
      contentType: "application/json",
      access: "public",
      addRandomSuffix: false,
    });
    const all = await getVotesForMandala(mandalaId);
    return { voted: true, count: all.length };
  }
}

export async function deleteVotesForMandala(mandalaId: string): Promise<void> {
  const { blobs } = await list({ prefix: `votes/${mandalaId}/` });
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url));
  }
}
