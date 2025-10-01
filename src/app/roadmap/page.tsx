// app/roadmap/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import QuarterView from '@/components/roadmap/QuarterView';
import { Contributor, Team, OperationalDomain } from '@/lib/types';
import { Filter } from 'lucide-react';

export default function RoadmapPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [domains, setDomains] = useState<OperationalDomain[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Convert vertical scroll to horizontal scroll & initial centering
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    // Center timeline initially
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;

    return () => el.removeEventListener('wheel', handleWheel);
  }, [contributors]);

  async function fetchData() {
    const [contributorsRes, teamsRes, domainsRes] = await Promise.all([
      supabase
        .from('contributors')
        .select(`
          *,
          domain:operational_domains(*),
          team_contributors(
            team:teams(*)
          )
        `)
        .not('target_quarter', 'is', null)
        .order('target_quarter'),
      supabase.from('teams').select('*'),
      supabase.from('operational_domains').select('*').order('display_order'),
    ]);

    setContributors(contributorsRes.data || []);
    setTeams(teamsRes.data || []);
    setDomains(domainsRes.data || []);
    setLoading(false);
  }

  // Filter contributors
  const filteredContributors = contributors.filter((contributor) => {
    if (selectedDomain !== 'all' && contributor.domain_id !== selectedDomain) return false;
    if (selectedTeam !== 'all') {
      const hasTeam = contributor.team_contributors?.some((tc: any) => tc.team.id === selectedTeam);
      if (!hasTeam) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center py-12 text-slate-500">
        Loading roadmap...
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-2xl">
        No scheduled contributors yet. Add target quarters in the Admin panel.
      </div>
    );
  }

  // Group by quarter
  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];
  const groupedByQuarter = quarters.map((quarter) => ({
    quarter,
    contributors: filteredContributors.filter((c) => c.target_quarter === quarter),
  }));

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-light text-slate-100 mb-2">Operational Roadmap</h1>
        <p className="text-sm text-slate-500">Quarterly contributor timeline and milestones</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl p-4 mb-6">
        <Filter className="w-5 h-5 text-slate-400" />

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
        >
          <option value="all">All Domains</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
        >
          <option value="all">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-slate-500">
          {filteredContributors.length} contributor{filteredContributors.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-white scrollbar-track-slate-800"
      >
        <div className="relative flex gap-8 min-w-max pb-8">
          {/* Timeline line */}
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-white" />

          {/* Quarters */}
          {groupedByQuarter.map(({ quarter, contributors }) => {
            const [qLabel, year] = quarter.split(' ');
            return (
              <div key={quarter} className="flex flex-col items-center">
                {/* Q# at the top */}
                <div className="text-white font-medium mb-2">{qLabel}</div>

                {/* QuarterView items */}
                <QuarterView quarter={year} items={contributors} />
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}
