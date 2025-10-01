// app/contributors/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import ContributorCard from '@/components/contributors/ContributorCard';
import { Contributor } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Filter, Search } from 'lucide-react';

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();

    // Get domains
    const { data: domainsData } = await supabase
      .from('operational_domains')
      .select('*')
      .order('display_order');

    // Get contributors with relationships
    const { data: contributorsData } = await supabase
      .from('contributors')
      .select(`
        *,
        domain:operational_domains(*),
        team_contributors(
          team:teams(*)
        )
      `)
      .order('name');

    // Get teams
    const { data: teamsData } = await supabase.from('teams').select('*');

    setDomains(domainsData || []);
    setContributors(contributorsData || []);
    setTeams(teamsData || []);
    setLoading(false);
  }

  // Filter contributors
  const filteredContributors = contributors.filter((contributor) => {
    // Domain filter
    if (selectedDomain && contributor.domain_id !== selectedDomain) return false;

    // Team filter
    if (selectedTeam) {
      const hasTeam = contributor.team_contributors?.some(
        (tc: any) => tc.team?.id === selectedTeam
      );
      if (!hasTeam) return false;
    }

    // Status filter
    if (selectedStatus && contributor.status !== selectedStatus) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contributor.name.toLowerCase().includes(query) ||
        contributor.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Group by domain
  const contributorsByDomain = domains.map((domain) => ({
    domain,
    contributors: filteredContributors.filter((c) => c.domain_id === domain.id),
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-100 mb-2">Contributors</h1>
        <p className="text-sm text-slate-500">
          Manage operational contributors across all domains and teams
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contributors..."
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
              Domain
            </label>
            <select
              value={selectedDomain || ''}
              onChange={(e) => setSelectedDomain(e.target.value || null)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="">All Domains</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
              Team
            </label>
            <select
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(e.target.value || null)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
              Status
            </label>
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="in_progress">In Progress</option>
              <option value="at_risk">At Risk</option>
              <option value="non_compliant">Non-Compliant</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-slate-700/30 text-xs text-slate-500">
          Showing {filteredContributors.length} of {contributors.length} contributors
        </div>
      </div>

      {/* Contributors by Domain */}
      <div className="space-y-8">
        {contributorsByDomain.map(({ domain, contributors: domainContributors }) => {
          if (domainContributors.length === 0 && selectedDomain) return null;

          return (
            <div key={domain.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
                <h2 className="text-lg text-emerald-400 uppercase tracking-widest font-medium">
                  {domain.name}
                </h2>
                <span className="text-xs text-slate-600">
                  ({domainContributors.length})
                </span>
              </div>

              {domainContributors.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-slate-700/30 rounded-xl p-8 text-center">
                  <p className="text-slate-500 text-sm">No contributors in this domain</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domainContributors.map((contributor) => (
                    <ContributorCard
                      key={contributor.id}
                      contributor={contributor}
                      onUpdate={loadData}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredContributors.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">No contributors match your filters</p>
          <button
            onClick={() => {
              setSelectedDomain(null);
              setSelectedTeam(null);
              setSelectedStatus(null);
              setSearchQuery('');
            }}
            className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
