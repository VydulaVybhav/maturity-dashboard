// components/dashboard/MetricsGrid.tsx
import { Target, AlertTriangle, CheckCircle2, Activity, Users, Trophy } from 'lucide-react';
import { DashboardMetrics } from '@/lib/types';

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricCards = [
    {
      icon: Target,
      label: 'SLA Compliance',
      value: `${metrics.slaCompliance.overall}%`,
      subtitle: 'overall adherence',
      color: metrics.slaCompliance.overall >= 90 ? 'text-emerald-400' :
             metrics.slaCompliance.overall >= 75 ? 'text-yellow-400' : 'text-orange-400',
      details: [
        { label: 'Requests', value: `${metrics.slaCompliance.requests}%` },
        { label: 'Changes', value: `${metrics.slaCompliance.changeTasks}%` },
        { label: 'Incidents', value: `${metrics.slaCompliance.incidents}%` }
      ]
    },
    {
      icon: Activity,
      label: 'Operational Health',
      value: metrics.domainHealth.operationalReliability.toFixed(1),
      subtitle: 'out of 3.0',
      color: metrics.domainHealth.operationalReliability >= 2.5 ? 'text-emerald-400' :
             metrics.domainHealth.operationalReliability >= 2.0 ? 'text-yellow-400' : 'text-orange-400'
    },
    {
      icon: CheckCircle2,
      label: 'Compliant',
      value: metrics.statusCounts.compliant,
      subtitle: 'contributors',
      color: 'text-emerald-400'
    },
    {
      icon: AlertTriangle,
      label: 'At Risk',
      value: metrics.statusCounts.atRisk + metrics.statusCounts.nonCompliant,
      subtitle: 'need attention',
      color: 'text-orange-400'
    },
    {
      icon: Users,
      label: 'Teams',
      value: metrics.totalTeams,
      subtitle: 'active teams',
      color: 'text-purple-400'
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: metrics.recentAchievements,
      subtitle: 'last 30 days',
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {metricCards.map((metric, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-500 hover:scale-105"
        >
          <div className="flex items-center gap-2 mb-3">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <span className="text-xs text-slate-500 uppercase tracking-wider">{metric.label}</span>
          </div>
          <div className={`text-4xl font-semibold ${metric.color} mb-1`}>{metric.value}</div>
          <div className="text-xs text-slate-600">{metric.subtitle}</div>

          {/* SLA breakdown details */}
          {metric.details && (
            <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-1">
              {metric.details.map((detail, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">{detail.label}</span>
                  <span className="text-xs font-medium text-slate-300">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
