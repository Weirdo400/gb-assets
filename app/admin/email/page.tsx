"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { toast } from "sonner";

export default function AdminEmail() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [targetUid, setTargetUid] = useState("__all__");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap =>
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)))
    );
  }, []);

  const recipients = targetUid === "__all__"
    ? users.map(u => u.email)
    : [users.find(u => u.uid === targetUid)?.email ?? ""];

  const send = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body required"); return; }
    setSending(true);
    try {
      // Log the email intent as an alert so the user sees it in-app
      // In production, wire this to an email API (SendGrid, Resend, etc.)
      const { addDoc, collection: col } = await import("firebase/firestore");
      const targets = targetUid === "__all__" ? users.map(u => u.uid) : [targetUid];
      await Promise.all(targets.map(uid =>
        addDoc(col(db, "alerts"), {
          uid,
          title: subject.trim(),
          message: body.trim(),
          type: "info",
          read: false,
          fromAdmin: true,
          createdAt: new Date().toISOString(),
        })
      ));
      toast.success(`Message sent to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""} as in-app notification`);
      setSubject("");
      setBody("");
    } catch {
      toast.error("Failed to send");
    }
    setSending(false);
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Email Users</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Compose Message</h1>
      </div>

      <div className="px-10 py-8 max-w-xl flex flex-col gap-5">
        <div className="border border-border p-4 metric-label text-[10px]">
          Messages are delivered as in-app notifications. To enable real email delivery, connect a provider (Resend, SendGrid) to <code>/api/send-email</code>.
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">To</label>
          <select className="gb-select" value={targetUid} onChange={e => setTargetUid(e.target.value)}>
            <option value="__all__">All Users ({users.length})</option>
            {users.map(u => <option key={u.uid} value={u.uid}>{u.fullName} — {u.email}</option>)}
          </select>
          {recipients.length > 0 && (
            <div className="metric-label text-[10px]">
              {targetUid === "__all__" ? `${recipients.length} recipients` : recipients[0]}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Subject</label>
          <input className="gb-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Important account update" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Message</label>
          <textarea
            className="gb-input"
            rows={8}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message here…"
            style={{ resize: "vertical" }}
          />
        </div>

        <button className="gb-btn gb-btn-primary" onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send Message →"}
        </button>
      </div>
    </div>
  );
}
