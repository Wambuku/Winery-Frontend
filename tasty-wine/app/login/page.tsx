import Link from "next/link";
import { LoginForm, RegisterForm } from "../../components/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#2b0909] to-red-900 text-white">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:px-8">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-yellow-400">
            Secure Access
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">Sign in to the Winery Console</h1>
          <p className="text-sm text-white/80">
            Use your winery-issued credentials. Customers can request access below.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-yellow-400">Existing members</h2>
            <LoginForm />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-yellow-400">Request access</h2>
            <RegisterForm />
            <p className="text-xs text-white/70">
              Need help?{" "}
              <Link href="/" className="text-yellow-300 underline">
                Return home
              </Link>{" "}
              or contact HQ for support.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
