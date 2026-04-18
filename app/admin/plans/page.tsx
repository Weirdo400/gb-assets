"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plan } from "@/lib/types";
import { fmtCurrency } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY_PLAN: Omit<Plan, "id"> = {
  name: "", description: "", minDeposit: 100, maxDeposit: 10000,
  returnRate: 5, duration: 30, enabled: true, sortOrder: 0,
};

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<Omit<Plan, "id">>(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const snap = await getDocs(collection(db, "plans"));
    setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)).sort((a, b) => a.sortOrder - b.sortOrder));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_PLAN); };
  const openEdit = (p: Plan) => { setEditing(p); setForm({ ...p }); };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await updateDoc(doc(db, "plans", editing.id), { ...form });
      toast.success("Plan updated");
    } else {
      await addDoc(collection(db, "plans"), { ...form });
      toast.success("Plan created");
    }
    setSaving(false);
    setEditing(null);
    await load();
  };

  const deletePlan = async (id: string) => {
    await deleteDoc(doc(db, "plans", id));
    toast.success("Plan deleted");
    await load();
  };

  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="px-10 py-8 border-b border-border flex items-center justify-between">
        <div>
          <div className="metric-label mb-1">Investment Plans</div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">{plans.length} Plans</h1>
        </div>
        <button onClick={() => { openNew(); setShowForm(true); }} className="gb-btn gb-btn-primary">
          + New Plan
        </button>
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 80px 100px 100px 80px 80px 100px" }}>
        <div>Name</div>
        <div className="text-right">Min</div>
        <div className="text-right">Max</div>
        <div className="text-right">Return %</div>
        <div className="text-right">Days</div>
        <div>Status</div>
        <div />
      </div>

      {plans.map(p => (
        <div key={p.id} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 80px 100px 100px 80px 80px 100px" }}>
          <div>
            <div className="text-[12px] font-medium">{p.name}</div>
            <div className="metric-label text-[10px]">{p.description}</div>
          </div>
          <div className="text-right tabular text-[11px]">{fmtCurrency(p.minDeposit, 0)}</div>
          <div className="text-right tabular text-[11px]">{fmtCurrency(p.maxDeposit, 0)}</div>
          <div className="text-right tabular text-[11px]">{p.returnRate}%</div>
          <div className="text-right text-[11px]">{p.duration}d</div>
          <div className={`text-[11px] uppercase ${!p.enabled ? "underline" : ""}`}>{p.enabled ? "Active" : "Disabled"}</div>
          <div className="flex gap-1 justify-end">
            <button onClick={() => { openEdit(p); setShowForm(true); }} className="gb-btn text-[10px] py-1 px-2">Edit</button>
            <button onClick={() => deletePlan(p.id)} className="gb-btn text-[10px] py-1 px-2">Del</button>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-background border border-border p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="metric-label mb-1">{editing ? "Edit Plan" : "New Plan"}</div>
            <div className="flex flex-col gap-4 mt-4">
              {[
                { label: "Plan Name", key: "name", type: "text" },
                { label: "Description", key: "description", type: "text" },
                { label: "Min Deposit", key: "minDeposit", type: "number" },
                { label: "Max Deposit", key: "maxDeposit", type: "number" },
                { label: "Return Rate (%)", key: "returnRate", type: "number" },
                { label: "Duration (days)", key: "duration", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="metric-label">{label}</label>
                  <input
                    className="gb-input"
                    type={type}
                    value={(form as unknown as Record<string, unknown>)[key] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 metric-label cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} />
                Enabled
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={save} disabled={saving} className="gb-btn gb-btn-primary flex-1">
                {saving ? "Saving…" : "Save Plan"}
              </button>
              <button onClick={() => setShowForm(false)} className="gb-btn flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
