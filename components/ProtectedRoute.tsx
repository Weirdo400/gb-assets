"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="metric-label">
          {timedOut ? "Connection slow — check Firestore rules and database exists" : "Loading…"}
        </div>
        {timedOut && (
          <button
            className="gb-btn"
            onClick={() => window.location.href = "/login"}
          >
            Back to Login
          </button>
        )}
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
