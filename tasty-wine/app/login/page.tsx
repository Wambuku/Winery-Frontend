"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { LoginForm, RegisterForm } from "../../components/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    const roles = user.roles?.map((role) => role.toLowerCase()) ?? [];
    const isAdmin =
      roles.includes("admin") ||
      roles.includes("staff") ||
      (user.name ? user.name.toLowerCase().includes("admin") : false) ||
      (user.email ? user.email.toLowerCase().includes("admin") : false);

    router.replace(isAdmin ? "/admin" : "/");
  }, [router, status, user]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0812] via-[#1b0c17] to-[#240c17] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-16 rounded-[48px] bg-gradient-to-br from-[#d72b62]/40 via-[#7b1a37]/30 to-transparent blur-3xl" />
        <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-6 left-10 h-72 w-72 rounded-full bg-purple-700/20 blur-3xl" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:py-16">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-2">
          <div className="relative hidden min-h-[560px] items-end bg-black/60 lg:flex">
            <img
              src="/assets/wine.png"
              alt="Wine glass pouring"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#140914]/80 to-transparent" />
            <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 ring-1 ring-white/30 backdrop-blur">
                Winery
              </span>
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
              >
                <span>Back to website</span>
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
            <div className="relative z-10 flex w-full flex-col gap-3 px-8 pb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
                Crafted for connoisseurs
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-white">
                Capture every pour, tasting note, and cellar milestone.
              </h2>
              <p className="text-sm text-white/75">
                Manage allocations, track members, and keep your vineyard experiences in one place.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-[6px] w-10 rounded-full bg-white" />
                <span className="h-[6px] w-10 rounded-full bg-white/50" />
                <span className="h-[6px] w-10 rounded-full bg-white/30" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#0f0a16]/80 px-6 py-10 sm:px-10">
            <div className="w-full max-w-md space-y-6">
              <div className="space-y-2 text-left">
                
                <h1 className="text-3xl font-semibold leading-tight text-red-600">Winery Management Portal</h1>
                <p className="text-sm text-white">
                  Sign in to securely access inventory, orders, customer data, and staff tools.
                </p>
              </div>

              <LoginForm />

             

              
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
