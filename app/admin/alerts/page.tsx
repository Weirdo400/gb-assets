"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { toast } from "sonner";

export default function AdminAlerts() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [targetUid, setTargetUid] = useState("__all__");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap =>
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)))
    );
  }, []);

  const send = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Title and message required"); return; }
    setSending(true);
    try {
      const targets = targetUid === "__all__" ? users.map(u => u.uid) : [targetUid];
      await Promise.all(targets.map(uid =>
        addDoc(collection(db, "alerts"), {
          uid,
          title: title.trim(),
          message: message.trim(),
          type,
          read: false,
          fromAdmin: true,
          createdAt: new Date().toISOString(),
        })
      ));
      toast.success(`Alert sent to ${targets.length === 1 ? "1 user" : `${targets.length} users`}`);
      setTitle("");
      setMessage("");
    } catch {
      toast.error("Failed to send alert");
    }
    setSending(false);
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Alerts</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Send Notification</h1>
      </div>

      <div className="px-10 py-8 max-w-xl flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="metric-label">Recipient</label>
          <select className="gb-select" value={targetUid} onChange={e => setTargetUid(e.target.value)}>
            <option value="__all__">All Users ({users.length})</option>
            {users.map(u => (
              <option key={u.uid} value={u.uid}>{u.fullName} — {u.email}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Type</label>
          <select className="gb-select" value={type} onChange={e => setType(e.target.value as typeof type)}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Title</label>
          <input className="gb-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Account Update" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Message</label>
          <textarea
            className="gb-input"
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message here…"
            style={{ resize: "vertical" }}
          />
        </div>

        <button className="gb-btn gb-btn-primary" onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send Alert →"}
        </button>
      </div>
    </div>
  );
}
