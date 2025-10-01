// app/dashboard/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import DomainHealth from '@/components/dashboard/DomainHealth';
import { DashboardMetrics, Contributor } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedTeamId]);

  async function loadDashboardData() {
    setLoading(true);
    const supabase = createClient();

    // Get all contributors with their domains and teams
    let query = supabase
      .from('contributors')
      .select(`
        *,
        domain:operational_domains(*),
        team_contributors(
          team:teams(*)
        )
      `);

    const { data: contributorsData, error: contributorsError } = await query;

    if (contributorsError) {
      console.error('Error fetching contributors:', contributorsError);
      // Don't stop - just log and continue with empty data
    }

    const allContributors = contributorsData || [];

    // Filter by team if selected
    let filteredContributors = allContributors;
    if (selectedTeamId) {
      filteredContributors = allContributors.filter((c: any) =>
        c.team_contributors?.some((tc: any) => tc.team?.id === selectedTeamId)
      );
    }

    // Get all teams
    const { data: teamsData } = await supabase.from('teams').select('*');
    setTeams(teamsData || []);

    // Get achievements count
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id')
      .gte('achieved_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    // Calculate metrics
    const statusCounts = {
      compliant: filteredContributors.filter((c: any) => c.status === 'compliant').length,
      inProgress: filteredContributors.filter((c: any) => c.status === 'in_progress').length,
      atRisk: filteredContributors.filter((c: any) => c.status === 'at_risk').length,
      nonCompliant: filteredContributors.filter((c: any) => c.status === 'non_compliant').length,
    };

    // Calculate SLA compliance (based on Operational Reliability contributors)
    const slaContributors = filteredContributors.filter((c: any) =>
      c.domain?.name === 'Operational Reliability'
    );

    const calculateSLA = (name: string) => {
      const contributor = slaContributors.find((c: any) => c.name.includes(name));
      if (!contributor) return 0;
      return contributor.status === 'compliant' ? 100 :
             contributor.status === 'in_progress' ? 75 :
             contributor.status === 'at_risk' ? 50 : 25;
    };

    const slaCompliance = {
      requests: calculateSLA('Requests'),
      changeTasks: calculateSLA('Change Tasks'),
      incidents: calculateSLA('Incidents'),
      overall: Math.round((calculateSLA('Requests') + calculateSLA('Change Tasks') + calculateSLA('Incidents')) / 3),
    };

    // Calculate domain health (average maturity level per domain)
    const getDomainHealth = (domainName: string) => {
      const domainContributors = filteredContributors.filter((c: any) =>
        c.domain?.name === domainName
      );
      if (domainContributors.length === 0) return 0;
      const avg = domainContributors.reduce((acc: number, c: any) => acc + c.maturity_level, 0) / domainContributors.length;
      return Math.round(avg * 10) / 10; // Round to 1 decimal
    };

    const domainHealth = {
      operationalReliability: getDomainHealth('Operational Reliability'),
      resilienceRecovery: getDomainHealth('Resilience & Recovery'),
      continuousImprovement: getDomainHealth('Continuous Improvement'),
      overall: 0,
    };
    domainHealth.overall = Math.round(
      ((domainHealth.operationalReliability + domainHealth.resilienceRecovery + domainHealth.continuousImprovement) / 3) * 10
    ) / 10;

    setMetrics({
      slaCompliance,
      domainHealth,
      statusCounts,
      totalTeams: teamsData?.length || 0,
      activeContributors: filteredContributors.length,
      recentAchievements: achievements?.length || 0,
    });

    setContributors(filteredContributors);
    setLoading(false);
  }

  if (loading || !metrics) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Operational metrics and organizational health</p>
        </div>

        {/* Team Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedTeamId || ''}
            onChange={(e) => setSelectedTeamId(e.target.value || null)}
            className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8">
        <MetricsGrid metrics={metrics} />
        <DomainHealth contributors={contributors} selectedTeamId={selectedTeamId} />
      </div>
    </div>
  );
}
