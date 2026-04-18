"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function KYCPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <KYC />
      </DashboardShell>
    </ProtectedRoute>
  );
}

function KYC() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const status = profile?.kycStatus ?? "none";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        kycStatus: "pending",
        kycData: { fullName, dob, country, address, idType, idNumber },
        kycSubmittedAt: new Date().toISOString(),
      });
      await refreshProfile();
      toast.success("KYC submitted successfully. Under review.");
    } catch {
      toast.error("Submission failed. Please try again.");
    }
    setLoading(false);
  };

  if (status === "approved") {
    return (
      <div className="px-10 py-12 max-w-xl">
        <div className="metric-label mb-2">KYC Verification</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-4">Identity Verified</h1>
        <p className="text-[12px]" style={{ lineHeight: "1.6" }}>
          Your identity has been verified. You have full access to all account features.
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="px-10 py-12 max-w-xl">
        <div className="metric-label mb-2">KYC Verification</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-4">Under Review</h1>
        <p className="text-[12px]" style={{ lineHeight: "1.6" }}>
          Your KYC documents are under review. This typically takes 1–3 business days.
          You will receive an alert when the review is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[calc(100vh-200px)]">
      <section className="border-r border-border px-10 py-10">
        <div className="metric-label mb-2">Identity Verification</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-8">KYC Submission</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
          {[
            { label: "Full Legal Name", value: fullName, onChange: setFullName, type: "text", placeholder: "As on ID document" },
            { label: "Date of Birth", value: dob, onChange: setDob, type: "date", placeholder: "" },
            { label: "Country of Residence", value: country, onChange: setCountry, type: "text", placeholder: "United Kingdom" },
            { label: "Residential Address", value: address, onChange: setAddress, type: "text", placeholder: "123 High Street, London" },
            { label: "ID Number", value: idNumber, onChange: setIdNumber, type: "text", placeholder: "Passport / ID card number" },
          ].map(({ label, value, onChange, type, placeholder }) => (
            <div key={label} className="flex flex-col gap-2">
              <label className="metric-label">{label}</label>
              <input
                className="gb-input"
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <label className="metric-label">ID Document Type</label>
            <select className="gb-select" value={idType} onChange={e => setIdType(e.target.value)}>
              <option>Passport</option>
              <option>National ID Card</option>
              <option>Driver's Licence</option>
            </select>
          </div>

          <button
            type="submit"
            className="gb-btn gb-btn-primary"
            style={{ padding: "18px", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "Submitting…" : "Submit for Review"}
          </button>
        </form>
      </section>

      <aside className="px-10 py-10">
        <div className="metric-label mb-6">Why KYC?</div>
        <div className="flex flex-col gap-5">
          {[
            { title: "Regulatory Compliance", body: "We are required by law to verify the identity of all clients before processing transactions above regulatory thresholds." },
            { title: "Account Security", body: "Identity verification protects your account from unauthorised access and fraudulent activity." },
            { title: "Withdrawal Access", body: "KYC approval is required for withdrawals exceeding $2,500 and all wire transfers." },
            { title: "Processing Time", body: "Reviews typically complete within 1–3 business days. You'll receive an in-app notification on completion." },
          ].map(({ title, body }) => (
            <div key={title} className="border border-border p-4">
              <div className="metric-label mb-1">{title}</div>
              <p className="text-[11px]" style={{ lineHeight: "1.6" }}>{body}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
