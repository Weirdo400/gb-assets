"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function SignOutPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    Promise.all([
      signOut(),
      new Promise(r => setTimeout(r, 3000)),
    ]).then(() => router.replace("/login"));
  }, [signOut, router]);

  return <LoadingScreen message="Signing out…" />;
}
