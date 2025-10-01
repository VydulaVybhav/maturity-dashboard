'use client';

import { Contributor, ContributorStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, RefreshCw, AlertTriangle, XCircle, Users } from 'lucide-react';
import { useState } from 'react';

interface ContributorCardProps {
  contributor: Contributor;
  onUpdate?: () => void;
}

const statusIcons = {
  compliant: CheckCircle,
  in_progress: RefreshCw,
  at_risk: AlertTriangle,
  non_compliant: XCircle,
};

const statusColors = {
  compliant: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  in_progress: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  at_risk: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  non_compliant: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const statusLabels = {
  compliant: 'Compliant',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  non_compliant: 'Non-Compliant',
};

const maturityLabels = {
  1: 'L1: Ad hoc',
  2: 'L2: Organized',
  3: 'L3: Adaptive',
};

const typeColors = {
  metric: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checklist: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  activity: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function ContributorCard({ contributor, onUpdate }: ContributorCardProps) {
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(contributor.status);
  const [maturityLevel, setMaturityLevel] = useState(contributor.maturity_level);

  const StatusIcon = statusIcons[status];
  const statusColor = statusColors[status];

  async function handleUpdate(updates: { status?: ContributorStatus; maturity_level?: number }) {
    setUpdating(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('contributors')
      .update(updates)
      .eq('id', contributor.id);

    if (error) {
      console.error('Error updating contributor:', error);
      alert('Failed to update contributor');
    } else {
      if (updates.status) setStatus(updates.status);
      if (updates.maturity_level) setMaturityLevel(updates.maturity_level);
      onUpdate?.();
    }

    setUpdating(false);
  }

  return (
    <div
      className={`bg-gradient-to-br from-slate-900/50 to-slate-800/30 border ${statusColor.border} rounded-xl p-5 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`w-5 h-5 ${statusColor.text}`} />
            <h3 className="text-base font-medium text-slate-100">{contributor.name}</h3>
          </div>
          {contributor.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{contributor.description}</p>
          )}
        </div>

        {/* Type Badge */}
        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${typeColors[contributor.type]}`}>
          {contributor.type}
        </span>
      </div>

      {/* Team Assignments */}
      {contributor.team_contributors && contributor.team_contributors.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <div className="flex flex-wrap gap-1">
            {contributor.team_contributors.map((tc: any) => (
              <span
                key={tc.team.id}
                className="px-2 py-1 bg-slate-700/30 rounded text-[10px] text-slate-400"
              >
                {tc.team.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status and Maturity Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Status Selector */}
        <div>
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleUpdate({ status: e.target.value as ContributorStatus })}
            disabled={updating}
            className={`w-full bg-slate-900/50 border ${statusColor.border} rounded-lg px-3 py-2 text-sm ${statusColor.text} focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 cursor-pointer`}
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
          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
            Maturity Level
          </label>
          <select
            value={maturityLevel}
            onChange={(e) => handleUpdate({ maturity_level: parseInt(e.target.value) })}
            disabled={updating}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {Object.entries(maturityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Quarter */}
      {contributor.target_quarter && (
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target</div>
          <div className="text-xs text-slate-300">{contributor.target_quarter}</div>
        </div>
      )}

      {/* Updating Indicator */}
      {updating && (
        <div className="mt-3 pt-3 border-t border-slate-700/30 text-xs text-blue-400 flex items-center gap-2">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Updating...
        </div>
      )}
    </div>
  );
}
