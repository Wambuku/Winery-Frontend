'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { CartIcon } from '../cart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const timer = window.setTimeout(() => setIsMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname, isMenuOpen]);

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/wines', label: 'Browse Wines' },
    { href: '/knowledge', label: 'Knowledge' },
  ];

  const isStaff = user?.roles?.some((role) => role === 'staff' || role === 'admin');
  const isAdmin = user?.roles?.includes('admin');

  if (isStaff) {
    navigationLinks.push(
      { href: '/pos', label: 'POS' },
      { href: '/inventory', label: 'Inventory' }
    );
  }

  if (isAdmin) {
    navigationLinks.push({ href: '/admin', label: 'Admin' });
  }

  const handleToggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-800/60">
            <span className="text-2xl">🍷</span>
            <span className="text-lg font-semibold uppercase tracking-[0.4rem] text-yellow-300 sm:text-xl">
              Winery
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CartIcon variant="compact" className="md:hidden" />

            <div className="hidden items-center gap-3 md:flex">
              <CartIcon />
              {user ? (
                <>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.roles?.join(' • ') ?? 'Member'}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Sign In
                </Link>
              )}
            </div>

            <button
              onClick={handleToggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-white transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 md:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18 18 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={handleCloseMenu}
          aria-hidden="true"
        />
        <div
          id="mobile-nav"
          className={`fixed inset-y-0 right-0 z-40 w-full max-w-xs transform border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-200 md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍷</span>
              <span className="text-sm font-semibold uppercase tracking-[0.4rem] text-yellow-300">
                Winery
              </span>
            </div>
            <CartIcon className="hidden sm:inline-flex" />
            <button
              onClick={handleCloseMenu}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              aria-label="Close navigation menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18 18 6" />
              </svg>
            </button>
          </div>
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-2 px-4 py-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleCloseMenu}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="space-y-4 border-t border-slate-800 px-4 py-6">
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3">
                <span className="text-sm font-medium text-slate-200">Cart</span>
                <CartIcon />
              </div>
              {user ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.roles?.join(' • ') ?? 'Member'}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      handleCloseMenu();
                    }}
                    className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={handleCloseMenu}
                  className="block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
