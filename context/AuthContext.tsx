"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { isDemoMode, disableDemo, DEMO_USER, DEMO_PROFILE } from "@/lib/demo-data";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, extra?: { username?: string; country?: string }) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string): Promise<void> => {
    try {
      const snapPromise = getDoc(doc(db, "users", uid));
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("profile fetch timeout")), 8000)
      );
      const snap = await Promise.race([snapPromise, timeout]);
      if (snap.exists()) {
        setProfile({ uid, ...snap.data() } as UserProfile);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.uid);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (isDemoMode()) {
      setUser(DEMO_USER as unknown as User);
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, extra?: { username?: string; country?: string }): Promise<string | null> => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName: fullName });

      const profileWrite = setDoc(doc(db, "users", newUser.uid), {
        email,
        fullName,
        username: extra?.username ?? "",
        country: extra?.country ?? "",
        availableBalance: 0,
        investedBalance: 0,
        isAdmin: false,
        kycStatus: "none",
        createdAt: new Date().toISOString(),
        otpEnabled: false,
        withdrawalDetails: null,
        overrideInvestedFunds: null,
        overrideTodaysPL: null,
        overrideTotalReturn: null,
      });

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timed out — check your database is created and rules allow writes.")), 10000)
      );

      await Promise.race([profileWrite, timeout]);
      return null;
    } catch (e: unknown) {
      console.error("signUp error:", e);
      return e instanceof Error ? e.message : "Sign up failed";
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      if (msg.includes("wrong-password") || msg.includes("user-not-found") || msg.includes("invalid-credential")) {
        return "Invalid email or password";
      }
      return msg;
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
    disableDemo();
    await fbSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
