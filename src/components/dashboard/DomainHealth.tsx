'use client';

import { Contributor, ContributorStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, RefreshCw, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DomainHealthProps {
  contributors: Contributor[];
  selectedTeamId: string | null;
}

const statusIcons = {
  compliant: CheckCircle,
  in_progress: RefreshCw,
  at_risk: AlertTriangle,
  non_compliant: XCircle,
};

const statusColors = {
  compliant: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  in_progress: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  at_risk: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  non_compliant: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const statusLabels = {
  compliant: 'Compliant',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  non_compliant: 'Non-Compliant',
};

const maturityLabels = {
  1: 'Ad hoc',
  2: 'Organized',
  3: 'Adaptive',
};

export default function DomainHealth({ contributors, selectedTeamId }: DomainHealthProps) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const domains = [
    { name: 'Operational Reliability', key: 'operational' },
    { name: 'Resilience & Recovery', key: 'resilience' },
    { name: 'Continuous Improvement', key: 'improvement' },
  ];

  const getContributorsByDomain = (domainName: string) => {
    return contributors.filter((c) => c.domain?.name === domainName);
  };

  const getDomainHealth = (domainName: string) => {
    const domainContributors = getContributorsByDomain(domainName);
    if (domainContributors.length === 0) return 0;
    const avg = domainContributors.reduce((acc, c) => acc + c.maturity_level, 0) / domainContributors.length;
    return Math.round(avg * 10) / 10;
  };

  const getMaturityColor = (level: number) => {
    if (level >= 2.5) return 'from-emerald-500 to-teal-500';
    if (level >= 2.0) return 'from-yellow-500 to-amber-500';
    return 'from-orange-500 to-red-500';
  };

  const getMaturityBorder = (level: number) => {
    if (level >= 2.5) return 'border-emerald-500/30';
    if (level >= 2.0) return 'border-yellow-500/30';
    return 'border-orange-500/30';
  };

  async function updateContributor(contributorId: string, updates: { status?: ContributorStatus; maturity_level?: number }) {
    setUpdating(contributorId);
    const supabase = createClient();

    const { error } = await supabase
      .from('contributors')
      .update(updates)
      .eq('id', contributorId);

    if (error) {
      console.error('Error updating contributor:', error);
      alert('Failed to update contributor');
    } else {
      // Trigger a refresh by reloading the page data
      window.location.reload();
    }

    setUpdating(null);
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-slate-200 mb-4">Domain Health</h2>
      {domains.map((domain) => {
        const domainContributors = getContributorsByDomain(domain.name);
        const domainAvg = getDomainHealth(domain.name);
        const isExpanded = expandedDomain === domain.key;

        return (
          <div key={domain.key} className="bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-slate-700/30 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedDomain(isExpanded ? null : domain.key)}
              className="w-full p-4 hover:bg-slate-800/20 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-200">{domain.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{domainContributors.length} contributors</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-lg bg-gradient-to-br ${getMaturityColor(domainAvg)} border ${getMaturityBorder(domainAvg)}`}
                >
                  <span className="text-sm font-bold text-white">{domainAvg.toFixed(1)}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {domainContributors.map((contributor) => {
                  const StatusIcon = statusIcons[contributor.status];
                  const statusColor = statusColors[contributor.status];
                  const isUpdating = updating === contributor.id;

                  return (
                    <div
                      key={contributor.id}
                      className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4 hover:border-slate-600/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-200">{contributor.name}</div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px]">
                              {contributor.type}
                            </span>
                            {contributor.team_contributors && contributor.team_contributors.length > 0 && (
                              <span className="text-[10px]">
                                {contributor.team_contributors.map((tc: any) => tc.team.name).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Status Selector */}
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                            Status
                          </label>
                          <select
                            value={contributor.status}
                            onChange={(e) => updateContributor(contributor.id, { status: e.target.value as ContributorStatus })}
                            disabled={isUpdating}
                            className={`w-full bg-slate-900/50 border ${statusColor.border} rounded-lg px-3 py-2 text-sm ${statusColor.text} focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50`}
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Maturity Selector */}
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                            Maturity Level
                          </label>
                          <select
                            value={contributor.maturity_level}
                            onChange={(e) => updateContributor(contributor.id, { maturity_level: parseInt(e.target.value) })}
                            disabled={isUpdating}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
                          >
                            {Object.entries(maturityLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                Level {value}: {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {isUpdating && (
                        <div className="mt-3 text-xs text-blue-400 flex items-center gap-2">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Updating...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
