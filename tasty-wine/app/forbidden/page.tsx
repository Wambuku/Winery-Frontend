import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-[#2b0909] to-red-900 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-red-500/60 bg-black/80 p-8 text-center text-white shadow-2xl shadow-red-900/30 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35rem] text-yellow-400">
          Access denied
        </p>
        <h1 className="text-3xl font-black">Administration clearance required</h1>
        <p className="text-sm text-white/80">
          Your account does not have the required role to view this area. Switch to an
          admin profile or contact HQ to request elevated access.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-600"
          >
            Switch account
          </Link>
          <Link
            href="/"
            className="block rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-yellow-300 hover:text-yellow-300"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
