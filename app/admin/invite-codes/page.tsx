"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, getDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { InviteCode } from "@/lib/types";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function InviteCodesPage() {
  const { profile } = useAuth();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchCodes = async () => {
    setFetching(true);
    try {
      const snap = await getDocs(query(collection(db, "inviteCodes"), orderBy("createdAt", "desc")));
      setCodes(snap.docs.map(d => d.data() as InviteCode));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) { toast.error("Enter a code"); return; }
    if (code.length < 4) { toast.error("Code must be at least 4 characters"); return; }

    const existing = await getDoc(doc(db, "inviteCodes", code));
    if (existing.exists()) { toast.error("That code already exists"); return; }

    setLoading(true);
    try {
      await setDoc(doc(db, "inviteCodes", code), {
        code,
        createdAt: new Date().toISOString(),
        createdBy: profile?.fullName ?? profile?.email ?? "Admin",
        used: false,
      });
      toast.success(`Code "${code}" created`);
      setNewCode("");
      fetchCodes();
    } catch {
      toast.error("Failed to create code");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete code "${code}"?`)) return;
    try {
      await deleteDoc(doc(db, "inviteCodes", code));
      toast.success("Code deleted");
      fetchCodes();
    } catch {
      toast.error("Failed to delete code");
    }
  };

  const activeCodes = codes.filter(c => !c.used);
  const usedCodes = codes.filter(c => c.used);

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl">
      <div className="section-header mb-8 px-0 border-0" style={{ padding: 0, borderBottom: "none" }}>
        <div className="metric-label mb-2">Access Control</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Invite Codes</h1>
      </div>

      {/* Create form */}
      <div className="border border-border p-6 mb-8">
        <div className="metric-label mb-4">Create New Code</div>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            className="gb-input flex-1"
            placeholder="e.g. GB-ALPHA-2026"
            value={newCode}
            onChange={e => setNewCode(e.target.value.toUpperCase())}
            maxLength={32}
          />
          <button
            type="submit"
            className="gb-btn gb-btn-primary"
            style={{ padding: "10px 24px", whiteSpace: "nowrap" }}
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Code"}
          </button>
        </form>
        <p className="metric-label mt-3 text-[10px]">
          Codes are single-use. Share the code with the client before they register. Codes are case-insensitive on entry but stored in uppercase.
        </p>
      </div>

      {/* Active codes */}
      <div className="mb-8">
        <div className="section-header flex justify-between items-center">
          <span>Active Codes ({activeCodes.length})</span>
        </div>
        {fetching ? (
          <div className="gb-row metric-label" style={{ cursor: "default" }}>Loading…</div>
        ) : activeCodes.length === 0 ? (
          <div className="gb-row metric-label" style={{ cursor: "default" }}>No active codes.</div>
        ) : (
          <>
            <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 160px 40px" }}>
              <div>Code</div>
              <div>Created By</div>
              <div />
            </div>
            {activeCodes.map(c => (
              <div key={c.code} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 160px 40px", cursor: "default" }}>
                <div className="font-bold tracking-widest text-[13px]">{c.code}</div>
                <div className="text-[11px] text-muted-foreground">{c.createdBy}</div>
                <button
                  onClick={() => handleDelete(c.code)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Used codes */}
      <div>
        <div className="section-header">Used Codes ({usedCodes.length})</div>
        {usedCodes.length === 0 ? (
          <div className="gb-row metric-label" style={{ cursor: "default" }}>No used codes yet.</div>
        ) : (
          <>
            <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 1fr 140px" }}>
              <div>Code</div>
              <div>Used By (UID)</div>
              <div>Used At</div>
            </div>
            {usedCodes.map(c => (
              <div key={c.code} className="gb-row grid" style={{ gridTemplateColumns: "1fr 1fr 140px", cursor: "default" }}>
                <div className="font-bold tracking-widest text-[13px] opacity-40">{c.code}</div>
                <div className="text-[11px] text-muted-foreground truncate">{c.usedBy ?? "—"}</div>
                <div className="text-[11px] text-muted-foreground">{c.usedAt ? new Date(c.usedAt).toLocaleDateString() : "—"}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
