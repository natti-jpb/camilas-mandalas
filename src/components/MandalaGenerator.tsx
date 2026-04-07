"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import CamilaIcon from "./CamilaIcon";

const COLORS = [
  // Eraser + neutrals
  "#ffffff", "#3d3429", "#5c4a3a", "#8b7355", "#c4a882", "#e8ddd0",
  // Warm tones
  "#d4a574", "#e6c9a8", "#f5deb3", "#c8956c",
  // Pinks & roses
  "#f0b8a8", "#e8a0b0", "#d4817a", "#c06070", "#a8485c", "#f2c4d0",
  // Purples & lavenders
  "#9b59b6", "#8e6bbf", "#b8a9d4", "#d4c0e8", "#6a3d9a", "#c9a0dc",
  // Blues
  "#4a6fa5", "#6987a0", "#7fb3d3", "#a8d8ea", "#c4e0f0", "#3a5a8c",
  // Greens
  "#3d6b4f", "#5b8a6e", "#88b892", "#b8d4a8", "#d0e8c8", "#4a8c5c",
  // Yellows & golds
  "#d4cf8a", "#e8d574", "#f0c040", "#f5e090", "#c8a830",
  // Oranges & earthy
  "#e8a040", "#d07050", "#b85a3a", "#e0784a", "#c47840",
  // Special
  "#2c2c2c", "#f8f0e0", "#d4b8a0", "#a09080",
];

interface MandalaPath { d: string; id: string; }

interface GalleryMandala {
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

interface UserInfo {
  id: string;
  name: string;
}

// --- Mandala generation (unchanged) ---

function generateMandala(seed: number): MandalaPath[] {
  const paths: MandalaPath[] = [];
  const rng = createRNG(seed);
  const cx = 250, cy = 250;
  const folds = pick(rng, [6, 8, 10, 12]);
  const layers = 3 + Math.floor(rng() * 4);

  paths.push({ d: `M ${cx-240} ${cy} A 240 240 0 1 0 ${cx+240} ${cy} A 240 240 0 1 0 ${cx-240} ${cy} Z`, id: "bg-circle" });

  for (let layer = 0; layer < layers; layer++) {
    const innerR = 30 + layer * (200 / layers);
    const outerR = 30 + (layer + 1) * (200 / layers);
    const midR = (innerR + outerR) / 2;
    const shapeType = Math.floor(rng() * 5);
    for (let i = 0; i < folds; i++) {
      const sa = (i * 2 * Math.PI) / folds, ea = ((i + 1) * 2 * Math.PI) / folds, ma = (sa + ea) / 2;
      if (shapeType === 0) {
        const pw = (ea - sa) * 0.35;
        paths.push({ d: `M ${cx+innerR*Math.cos(ma)} ${cy+innerR*Math.sin(ma)} Q ${cx+midR*Math.cos(ma-pw)} ${cy+midR*Math.sin(ma-pw)} ${cx+outerR*Math.cos(ma)} ${cy+outerR*Math.sin(ma)} Q ${cx+midR*Math.cos(ma+pw)} ${cy+midR*Math.sin(ma+pw)} ${cx+innerR*Math.cos(ma)} ${cy+innerR*Math.sin(ma)} Z`, id: `petal-${layer}-${i}` });
      } else if (shapeType === 1) {
        const sp = (ea - sa) * 0.25;
        paths.push({ d: `M ${cx+innerR*Math.cos(ma)} ${cy+innerR*Math.sin(ma)} Q ${cx+midR*Math.cos(ma-sp)} ${cy+midR*Math.sin(ma-sp)} ${cx+outerR*0.95*Math.cos(ma)} ${cy+outerR*0.95*Math.sin(ma)} Q ${cx+midR*Math.cos(ma+sp)} ${cy+midR*Math.sin(ma+sp)} ${cx+innerR*Math.cos(ma)} ${cy+innerR*Math.sin(ma)} Z`, id: `tear-${layer}-${i}` });
      } else if (shapeType === 2) {
        const as2 = sa+(ea-sa)*0.1, ae2 = ea-(ea-sa)*0.1;
        paths.push({ d: `M ${cx+innerR*Math.cos(as2)} ${cy+innerR*Math.sin(as2)} L ${cx+outerR*Math.cos(as2)} ${cy+outerR*Math.sin(as2)} A ${outerR} ${outerR} 0 0 1 ${cx+outerR*Math.cos(ae2)} ${cy+outerR*Math.sin(ae2)} L ${cx+innerR*Math.cos(ae2)} ${cy+innerR*Math.sin(ae2)} A ${innerR} ${innerR} 0 0 0 ${cx+innerR*Math.cos(as2)} ${cy+innerR*Math.sin(as2)} Z`, id: `arc-${layer}-${i}` });
      } else if (shapeType === 3) {
        paths.push({ d: `M ${cx+outerR*Math.cos(ma)} ${cy+outerR*Math.sin(ma)} L ${cx+midR*Math.cos(ea-(ea-sa)*0.2)} ${cy+midR*Math.sin(ea-(ea-sa)*0.2)} L ${cx+innerR*Math.cos(ma)} ${cy+innerR*Math.sin(ma)} L ${cx+midR*Math.cos(sa+(ea-sa)*0.2)} ${cy+midR*Math.sin(sa+(ea-sa)*0.2)} Z`, id: `diamond-${layer}-${i}` });
      } else {
        const ha = (ea - sa) / 2;
        for (let s = 0; s < 2; s++) {
          const a = sa + s * ha + ha * 0.5, pw = ha * 0.3;
          paths.push({ d: `M ${cx+innerR*Math.cos(a)} ${cy+innerR*Math.sin(a)} Q ${cx+midR*Math.cos(a-pw)} ${cy+midR*Math.sin(a-pw)} ${cx+outerR*0.9*Math.cos(a)} ${cy+outerR*0.9*Math.sin(a)} Q ${cx+midR*Math.cos(a+pw)} ${cy+midR*Math.sin(a+pw)} ${cx+innerR*Math.cos(a)} ${cy+innerR*Math.sin(a)} Z`, id: `dpetal-${layer}-${i}-${s}` });
        }
      }
    }
    if (rng() > 0.4) {
      const dr = 3 + rng() * 4;
      for (let i = 0; i < folds; i++) {
        const a = (i * 2 * Math.PI) / folds + Math.PI / folds;
        const dx = cx + midR * Math.cos(a), dy = cy + midR * Math.sin(a);
        paths.push({ d: `M ${dx-dr} ${dy} A ${dr} ${dr} 0 1 0 ${dx+dr} ${dy} A ${dr} ${dr} 0 1 0 ${dx-dr} ${dy} Z`, id: `dot-${layer}-${i}` });
      }
    }
  }
  paths.push({ d: `M ${cx-18} ${cy} A 18 18 0 1 0 ${cx+18} ${cy} A 18 18 0 1 0 ${cx-18} ${cy} Z`, id: "center" });
  paths.push({ d: `M ${cx-8} ${cy} A 8 8 0 1 0 ${cx+8} ${cy} A 8 8 0 1 0 ${cx-8} ${cy} Z`, id: "inner-center" });
  return paths;
}

function createRNG(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function pick<T>(rng: () => number, arr: T[]): T { return arr[Math.floor(rng() * arr.length)]; }

// --- User identity helpers ---

function getUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("camilas-user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveUser(user: UserInfo) {
  localStorage.setItem("camilas-user", JSON.stringify(user));
}

// --- Sub-components ---

function MandalaPreview({ seed, fills }: { seed: number; fills: Record<string, string> }) {
  const paths = generateMandala(seed);
  return (
    <svg viewBox="0 0 500 500" className="w-full h-full">
      <rect width="500" height="500" fill="#faf8f5" rx="12" />
      {paths.map((p) => (
        <path key={p.id} d={p.d} fill={fills[p.id] || "transparent"} stroke="#3d3429" strokeWidth={p.id === "bg-circle" ? 1.5 : 0.8} />
      ))}
    </svg>
  );
}

function AuthScreen({ onAuth }: { onAuth: (user: UserInfo) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      const user: UserInfo = { id: data.id, name: data.name };
      saveUser(user);
      onAuth(user);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 fade-in">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#e8ddd0] opacity-20 blur-3xl breathing-bg" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#c4a882] opacity-15 blur-3xl breathing-bg" style={{ animationDelay: "4s" }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center">
        <div className="gentle-float"><CamilaIcon size={80} /></div>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-light tracking-wide text-[#3d3429]">Camilas Mandalas</h1>
          <p className="text-lg text-[#8b7355] font-light leading-relaxed">
            Take a deep breath.<br />Create something beautiful.
          </p>
        </div>

        {/* Login / Signup toggle */}
        <div className="flex items-center gap-1 bg-[#e8ddd0]/30 rounded-full p-1">
          <button onClick={() => { setMode("login"); setError(""); }} className={`px-5 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-300 ${mode === "login" ? "bg-white text-[#3d3429] shadow-sm" : "text-[#8b7355]"}`}>Sign In</button>
          <button onClick={() => { setMode("signup"); setError(""); }} className={`px-5 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-300 ${mode === "signup" ? "bg-white text-[#3d3429] shadow-sm" : "text-[#8b7355]"}`}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] uppercase tracking-widest text-[#b8a088] ml-5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Your name"
              maxLength={50}
              className="px-5 py-3 rounded-full border border-[#e8ddd0] bg-white/80 text-[#3d3429] text-sm focus:outline-none focus:border-[#c4a882] transition-colors"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] uppercase tracking-widest text-[#b8a088] ml-5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder={mode === "signup" ? "At least 4 characters" : "Your password"}
              maxLength={100}
              className="px-5 py-3 rounded-full border border-[#e8ddd0] bg-white/80 text-[#3d3429] text-sm focus:outline-none focus:border-[#c4a882] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-[#c06070] bg-[#f0b8a8]/15 rounded-xl px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || !password || loading}
            className="px-8 py-3 rounded-full bg-[#c4a882] text-white text-sm font-medium tracking-wider uppercase hover:bg-[#b89972] transition-all duration-500 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-[#c4a882]">
          {mode === "login" ? "No account yet? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="underline hover:text-[#8b7355] transition-colors">
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function SaveDialog({ onSave, onCancel, saving, authorName }: {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  saving: boolean;
  authorName: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm fade-in">
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim(), description.trim()); }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 flex flex-col gap-5"
      >
        <h2 className="text-xl font-light text-[#3d3429] tracking-wide">Share your mandala</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[#8b7355]">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunset Meditation" maxLength={100} className="px-4 py-2.5 rounded-xl border border-[#e8ddd0] bg-[#faf8f5] text-[#3d3429] text-sm focus:outline-none focus:border-[#c4a882] transition-colors" autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[#8b7355]">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What inspired this mandala?" maxLength={300} rows={2} className="px-4 py-2.5 rounded-xl border border-[#e8ddd0] bg-[#faf8f5] text-[#3d3429] text-sm focus:outline-none focus:border-[#c4a882] transition-colors resize-none" />
        </div>
        <p className="text-xs text-[#b8a088]">Sharing as <span className="font-medium text-[#8b7355]">{authorName}</span></p>
        <div className="flex gap-3 mt-2">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-full text-sm text-[#8b7355] hover:bg-[#e8ddd0]/50 transition-all">Cancel</button>
          <button type="submit" disabled={!name.trim() || saving} className="flex-1 px-4 py-2.5 rounded-full text-sm bg-[#c4a882] text-white hover:bg-[#b89972] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? "Sharing..." : "Share"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col gap-5 text-center">
        <p className="text-sm text-[#3d3429]">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-full text-sm text-[#8b7355] hover:bg-[#e8ddd0]/50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-full text-sm bg-[#c06070] text-white hover:bg-[#a84858] transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

// --- Main component ---

export default function MandalaGenerator() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [fills, setFills] = useState<Record<string, string>>({});
  const [selectedColor, setSelectedColor] = useState(COLORS[1]);
  const [tab, setTab] = useState<"paint" | "gallery">("paint");
  const [gallery, setGallery] = useState<GalleryMandala[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [undoStack, setUndoStack] = useState<Record<string, string>[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Load user from localStorage
  useEffect(() => {
    setUser(getUser());
    setUserLoaded(true);
  }, []);

  const handleAuth = useCallback((authedUser: UserInfo) => {
    setUser(authedUser);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("camilas-user");
    setUser(null);
  }, []);

  // Fetch gallery
  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch("/api/mandalas");
      if (res.ok) setGallery(await res.json());
    } catch { /* silent */ } finally { setGalleryLoading(false); }
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const paths = generateMandala(seed);

  const handlePathClick = useCallback((id: string) => {
    setUndoStack((prev) => [...prev.slice(-49), fills]);
    setFills((prev) => {
      const next = { ...prev };
      if (selectedColor === "#ffffff") delete next[id]; else next[id] = selectedColor;
      return next;
    });
  }, [selectedColor, fills]);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const s = [...prev]; const last = s.pop()!; setFills(last); return s;
    });
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo]);

  const regenerate = useCallback(() => { setSeed(Math.floor(Math.random() * 100000)); setFills({}); setUndoStack([]); }, []);
  const clearColors = useCallback(() => { setUndoStack((p) => [...p.slice(-49), fills]); setFills({}); }, [fills]);

  const downloadSVG = useCallback(() => {
    if (!svgRef.current) return;
    const d = new XMLSerializer().serializeToString(svgRef.current);
    const b = new Blob([d], { type: "image/svg+xml" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = u; a.download = `camilas-mandala-${seed}.svg`; a.click();
    URL.revokeObjectURL(u);
  }, [seed]);

  const saveToGallery = useCallback(async (name: string, description: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mandalas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, fills, name, description, author: user.name, userId: user.id }),
      });
      if (res.ok) {
        const entry = await res.json();
        setGallery((prev) => [entry, ...prev]);
        setShowSaveDialog(false);
        setTab("gallery");
      }
    } catch { /* silent */ } finally { setSaving(false); }
  }, [seed, fills, user]);

  const vote = useCallback(async (id: string) => {
    if (!user) return;
    // Optimistic toggle
    setGallery((p) => p.map((m) => {
      if (m.id !== id) return m;
      const votedBy = m.votedBy || [];
      const alreadyVoted = votedBy.includes(user.id);
      const newVotedBy = alreadyVoted ? votedBy.filter((u) => u !== user.id) : [...votedBy, user.id];
      return { ...m, votedBy: newVotedBy, votes: newVotedBy.length };
    }));
    try {
      const res = await fetch("/api/mandalas/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, userId: user.id }) });
      if (res.ok) {
        const { votes, voted } = await res.json();
        setGallery((p) => p.map((m) => {
          if (m.id !== id) return m;
          const newVotedBy = voted
            ? [...(m.votedBy || []).filter((u) => u !== user.id), user.id]
            : (m.votedBy || []).filter((u) => u !== user.id);
          return { ...m, votes, votedBy: newVotedBy };
        }));
      }
    } catch {
      fetchGallery(); // revert by refetching
    }
  }, [user, fetchGallery]);

  const deleteMandala = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/mandalas/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: user.id }),
      });
      if (res.ok) setGallery((p) => p.filter((m) => m.id !== id));
    } catch { /* silent */ }
    setDeleteTarget(null);
  }, [user]);

  // Show nothing until we check localStorage
  if (!userLoaded) return null;

  // Auth screen
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const sorted = [...gallery].sort((a, b) => b.votes - a.votes || b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col min-h-screen">
      {showSaveDialog && <SaveDialog onSave={saveToGallery} onCancel={() => setShowSaveDialog(false)} saving={saving} authorName={user.name} />}
      {deleteTarget && <ConfirmDialog message="Delete this mandala permanently?" onConfirm={() => deleteMandala(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-[#e8ddd0] opacity-15 blur-3xl breathing-bg" />
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-[#c4a882] opacity-10 blur-3xl breathing-bg" style={{ animationDelay: "3s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 grid grid-cols-3 items-center px-6 py-4 border-b border-[#e8ddd0]/50">
        <div className="flex items-center gap-3">
          <CamilaIcon size={36} />
          <h1 className="text-lg font-light tracking-wide text-[#3d3429] hidden sm:block">Camilas Mandalas</h1>
        </div>

        <div className="flex items-center justify-center gap-1 bg-[#e8ddd0]/30 rounded-full p-1 justify-self-center">
          <button onClick={() => setTab("paint")} className={`px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-300 ${tab === "paint" ? "bg-white text-[#3d3429] shadow-sm" : "text-[#8b7355] hover:text-[#3d3429]"}`}>Paint</button>
          <button onClick={() => { setTab("gallery"); fetchGallery(); }} className={`px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-300 ${tab === "gallery" ? "bg-white text-[#3d3429] shadow-sm" : "text-[#8b7355] hover:text-[#3d3429]"}`}>
            Gallery{gallery.length > 0 && ` (${gallery.length})`}
          </button>
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <span className="text-xs text-[#8b7355]">{user.name}</span>
          <button onClick={handleLogout} className="text-[10px] text-[#c4a882] hover:text-[#c06070] uppercase tracking-wider transition-colors" title="Sign out">out</button>
        </div>
      </header>

      {/* Paint tab */}
      {tab === "paint" && (
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 p-6">
          {/* Color palette */}
          <div className="grid grid-cols-12 gap-1.5 p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#e8ddd0]/60 max-w-[420px]">
            {COLORS.map((color) => (
              <button key={color} onClick={() => setSelectedColor(color)} className={`color-swatch w-6 h-6 rounded-full border-2 flex-shrink-0 ${selectedColor === color ? "active border-[#8b7355]" : "border-[#e8ddd0] hover:border-[#c4a882]"}`} style={{ backgroundColor: color }} title={color === "#ffffff" ? "Eraser" : color}>
                {color === "#ffffff" && (<svg viewBox="0 0 20 20" className="w-full h-full p-1 text-[#ccc]"><line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" /><line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" /></svg>)}
              </button>
            ))}
          </div>

          {/* Left buttons + Mandala + Undo */}
          <div className="flex items-center gap-4">
            {/* Action buttons on the left */}
            <div className="flex flex-col gap-2">
              <button onClick={regenerate} className="px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-[#8b7355] hover:text-[#3d3429] bg-white/60 hover:bg-[#e8ddd0]/50 backdrop-blur-sm border border-[#e8ddd0]/60 rounded-full transition-all duration-300 whitespace-nowrap">New</button>
              <button onClick={clearColors} className="px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-[#8b7355] hover:text-[#3d3429] bg-white/60 hover:bg-[#e8ddd0]/50 backdrop-blur-sm border border-[#e8ddd0]/60 rounded-full transition-all duration-300">Clear</button>
              <button onClick={() => setShowSaveDialog(true)} className="px-4 py-2.5 text-xs font-medium tracking-wider uppercase bg-[#c4a882] text-white hover:bg-[#b89972] rounded-full transition-all duration-300">Share</button>
              <button onClick={downloadSVG} className="px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-[#8b7355] hover:text-[#3d3429] bg-white/60 hover:bg-[#e8ddd0]/50 backdrop-blur-sm border border-[#e8ddd0]/60 rounded-full transition-all duration-300">&darr;</button>
            </div>

            {/* Mandala */}
            <div className="mandala-container fade-in flex-shrink-0">
              <svg ref={svgRef} viewBox="0 0 500 500" className="w-[min(70vw,500px)] h-[min(70vw,500px)]" xmlns="http://www.w3.org/2000/svg">
                <rect width="500" height="500" fill="#faf8f5" rx="12" />
                {paths.map((p) => (<path key={p.id} d={p.d} fill={fills[p.id] || "transparent"} stroke="#3d3429" strokeWidth={p.id === "bg-circle" ? 1.5 : 0.8} className="mandala-path" onClick={() => handlePathClick(p.id)} style={{ pointerEvents: "all" }} />))}
              </svg>
            </div>

            {/* Undo + current color on the right */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={undo} disabled={undoStack.length === 0} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm border border-[#e8ddd0]/60 text-[#8b7355] hover:text-[#3d3429] hover:bg-[#e8ddd0]/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
              </button>
              {undoStack.length > 0 && <span className="text-[10px] text-[#c4a882]">{undoStack.length}</span>}
              <div className="w-8 h-8 rounded-full border-2 border-[#e8ddd0] mt-2" style={{ backgroundColor: selectedColor }} title="Current color" />
            </div>
          </div>
        </main>
      )}

      {/* Gallery tab */}
      {tab === "gallery" && (
        <main className="relative z-10 flex-1 p-6 overflow-auto">
          {galleryLoading && gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#c4a882] border-t-transparent animate-spin" />
              <p className="text-sm text-[#b8a088]">Loading gallery...</p>
            </div>
          ) : gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-[#e8ddd0]/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#c4a882]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6a4 4 0 014-4h12a4 4 0 014 4v12a4 4 0 01-4 4H6a4 4 0 01-4-4V6z" /><circle cx="8.5" cy="8.5" r="2" /><path d="M14.5 9.5l5.5 8H4l4-6 3 4z" /></svg>
              </div>
              <p className="text-[#8b7355] font-light">No mandalas shared yet</p>
              <p className="text-sm text-[#b8a088]">Be the first to share a mandala!</p>
              <button onClick={() => setTab("paint")} className="mt-2 px-6 py-2 rounded-full bg-[#c4a882] text-white text-sm tracking-wider uppercase hover:bg-[#b89972] transition-all">Start Painting</button>
            </div>
          ) : (
            <div>
              <p className="text-center text-sm text-[#b8a088] mb-6">Community gallery — vote for your favorites</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {sorted.map((m) => {
                  const isOwner = m.userId === user.id;
                  return (
                    <div key={m.id} className="group flex flex-col gap-3 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#e8ddd0]/60 hover:border-[#c4a882]/60 transition-all duration-300 hover:shadow-lg">
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#faf8f5]">
                        <MandalaPreview seed={m.seed} fills={m.fills} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-medium text-[#3d3429] truncate">{m.name}</h3>
                        {m.description && <p className="text-xs text-[#b8a088] line-clamp-2">{m.description}</p>}
                      </div>
                      <div className="flex items-center justify-between">
                        {(() => {
                          const hasVoted = (m.votedBy || []).includes(user.id);
                          return (
                            <button onClick={() => vote(m.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs hover:bg-[#f0b8a8]/20 transition-all group/vote">
                              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#d4817a] group-hover/vote:scale-110 transition-transform" fill={hasVoted ? "#d4817a" : "none"} stroke="#d4817a" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                              <span className="text-[#8b7355] font-medium">{m.votes}</span>
                            </button>
                          );
                        })()}
                        <div className="flex items-center gap-2 text-[10px] text-[#c4a882]">
                          <span>by {m.author}</span>
                          <span>&middot;</span>
                          <span>{new Date(m.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      {isOwner && (
                        <button onClick={() => setDeleteTarget(m.id)} className="w-full py-2 text-xs uppercase tracking-wider text-[#c4a882] hover:text-[#c06070] hover:bg-[#f0b8a8]/20 rounded-full transition-all text-center">Delete</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="relative z-10 text-center py-4 border-t border-[#e8ddd0]/50">
        <p className="text-xs text-[#c4a882] font-light tracking-wider">breathe &middot; create &middot; be at peace</p>
      </footer>
    </div>
  );
}
