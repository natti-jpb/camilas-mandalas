import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface UserAccount {
  id: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

// Simple hash — not cryptographic, but fine for a fun mandala app
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "camilas-mandalas-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Normalize username to filesystem-safe key
function userKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

// POST /api/auth — signup or login
export async function POST(req: NextRequest) {
  try {
    const { action, name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    if (name.length > 50 || password.length > 100) {
      return NextResponse.json({ error: "Name or password too long" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const key = userKey(name);
    const prefix = `users/${key}.json`;
    const { blobs } = await list({ prefix });
    const existing = blobs.length > 0 ? blobs[0] : null;

    if (action === "signup") {
      if (existing) {
        return NextResponse.json({ error: "This name is already taken" }, { status: 409 });
      }

      const hash = await hashPassword(password);
      const account: UserAccount = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        passwordHash: hash,
        createdAt: Date.now(),
      };

      await put(`users/${key}.json`, JSON.stringify(account), {
        contentType: "application/json",
        access: "public",
      });

      return NextResponse.json({ id: account.id, name: account.name }, { status: 201 });
    }

    if (action === "login") {
      if (!existing) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      const res = await fetch(existing.url);
      const account = (await res.json()) as UserAccount;
      const hash = await hashPassword(password);

      if (account.passwordHash !== hash) {
        return NextResponse.json({ error: "Wrong password" }, { status: 401 });
      }

      return NextResponse.json({ id: account.id, name: account.name });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
