"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Settings {
  siteName: string;
  maintenanceMode: boolean;
  supportEmail: string;
  minDeposit: number;
  minWithdrawal: number;
  kycThreshold: number;
  depositInstructions: string;
}

const DEFAULTS: Settings = {
  siteName: "Global Assets",
  maintenanceMode: false,
  supportEmail: "support@globalassets.io",
  minDeposit: 100,
  minWithdrawal: 50,
  kycThreshold: 2500,
  depositInstructions: "Send funds to the wallet address provided and submit your transaction hash.",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "settings", "platform"));
      if (snap.exists()) setSettings({ ...DEFAULTS, ...snap.data() } as Settings);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    await setDoc(doc(db, "settings", "platform"), settings);
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Platform Settings</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Configuration</h1>
      </div>

      <div className="px-10 py-8 max-w-xl flex flex-col gap-5">
        {[
          { label: "Platform Name", key: "siteName", type: "text" },
          { label: "Support Email", key: "supportEmail", type: "email" },
          { label: "Min Deposit (USD)", key: "minDeposit", type: "number" },
          { label: "Min Withdrawal (USD)", key: "minWithdrawal", type: "number" },
          { label: "KYC Required Above (USD)", key: "kycThreshold", type: "number" },
        ].map(({ label, key, type }) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="metric-label">{label}</label>
            <input
              className="gb-input"
              type={type}
              value={(settings as unknown as Record<string, unknown>)[key] as string}
              onChange={e => setSettings(s => ({
                ...s,
                [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
              }))}
            />
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <label className="metric-label">Deposit Instructions</label>
          <textarea
            className="gb-input"
            rows={4}
            value={settings.depositInstructions}
            onChange={e => setSettings(s => ({ ...s, depositInstructions: e.target.value }))}
            style={{ resize: "vertical" }}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={e => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))}
          />
          <span className="metric-label">Maintenance Mode (disables client login)</span>
        </label>

        <button onClick={save} disabled={saving} className="gb-btn gb-btn-primary" style={{ padding: "14px" }}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
