// src/components/navigation/NavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Activity, Calendar, Settings } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isAdminActive = () => pathname.startsWith('/admin');

  return (
    <nav className="border-b border-slate-800/30 bg-slate-950/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-light text-slate-100 hover:text-emerald-400 transition-colors">
            EDW
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                pathname === '/'
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                isActive('/dashboard')
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/contributors"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                isActive('/contributors')
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Contributors</span>
            </Link>

            <Link
              href="/roadmap"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                isActive('/roadmap')
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Roadmap</span>
            </Link>

            <div className="relative group">
              <Link
                href="/admin/teams"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  isAdminActive()
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Link>

              {/* Dropdown opens on hover */}
              <div className="absolute top-full right-0 mt-2 py-2 bg-slate-900/95 border border-slate-700/50 rounded-lg backdrop-blur-sm min-w-[140px] opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
                <Link
                  href="/admin/teams"
                  className={`block px-4 py-2 text-xs transition-colors ${
                    pathname === '/admin/teams'
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Teams
                </Link>
                <Link
                  href="/admin/domains"
                  className={`block px-4 py-2 text-xs transition-colors ${
                    pathname === '/admin/domains'
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Domains
                </Link>
                <Link
                  href="/admin/contributors"
                  className={`block px-4 py-2 text-xs transition-colors ${
                    pathname === '/admin/contributors'
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Contributors
                </Link>
                <Link
                  href="/admin/achievements"
                  className={`block px-4 py-2 text-xs transition-colors ${
                    pathname === '/admin/achievements'
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Achievements
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
