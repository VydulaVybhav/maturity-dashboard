// src/app/page.tsx
import Link from 'next/link';
import { Target, Activity, Calendar, Settings, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import FloatingAchievements from '@/components/FloatingAchievements';

async function getRecentAchievements() {
  const supabase = createClient();

  const { data: achievements } = await supabase
    .from('achievements')
    .select(`
      *,
      team:teams(*),
      contributor:contributors(*)
    `)
    .order('achieved_at', { ascending: false })
    .limit(8);

  return achievements || [];
}

export default async function HomePage() {
  const achievements = await getRecentAchievements();
  const sections = [
    {
      href: '/dashboard',
      icon: Target,
      title: 'Dashboard',
      description: 'View high-level metrics and organizational health indicators',
      color: 'emerald',
    },
    {
      href: '/contributors',
      icon: Activity,
      title: 'Contributors',
      description: 'Track operational contributors across all domains and teams',
      color: 'emerald',
    },
    {
      href: '/roadmap',
      icon: Calendar,
      title: 'Roadmap',
      description: 'Plan and visualize capability improvements over time',
      color: 'emerald',
    },
    {
      href: '/admin/teams',
      icon: Settings,
      title: 'Admin',
      description: 'Configure teams, domains, and platform capabilities',
      color: 'emerald',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Floating Achievements */}
      <FloatingAchievements achievements={achievements} />

      <div className="max-w-6xl w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-7xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="bg-gradient-to-r from-teal-100 to-teal-100 bg-clip-text text-transparent">
                EDW Platform Engineering Hub
              </span>
            </h1>
            <h2 className="text-4xl font-medium text-slate-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              
            </h2>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Comprehensive platform maturity tracking, capability management, and strategic roadmap planning
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    section.color === 'emerald'
                      ? 'bg-white-500/10 border border-teal-100/20'
                      : 'bg-blue-500/10 border border-blue-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      section.color === 'emerald' ? 'text-teal-100' : 'text-blue-400'
                    }`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-teal-100 group-hover:translate-x-1 transition-all" />
                </div>

                <h2 className="text-xl font-medium text-slate-100 mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {section.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/0 transition-all duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-600">
            Platform maturity tracking and strategic planning system
          </p>
        </div>
      </div>
    </div>
  );
}
