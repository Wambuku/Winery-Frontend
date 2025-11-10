"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = dynamic(() => import("../../components/admin/AdminDashboard"), {
  ssr: false,
});

export default function AdminPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user && !user.roles?.includes("admin")) {
      router.replace("/forbidden");
    }
  }, [user, status, router]);

  if (status === "initializing" || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading admin tools…</p>
      </main>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (user && !user.roles?.includes("admin")) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0d0303] to-red-950 px-4 py-16 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <AdminDashboard />
      </div>
    </main>
  );
}
