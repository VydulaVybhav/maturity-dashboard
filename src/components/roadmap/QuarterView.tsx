// components/roadmap/QuarterView.tsx
import { CheckCircle, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';

function getMaturityColor(level: number) {
  if (level >= 2.5) return 'from-emerald-500 to-teal-500';
  if (level >= 2.0) return 'from-yellow-500 to-amber-500';
  return 'from-orange-500 to-red-500';
}

const statusIcons = {
  compliant: CheckCircle,
  in_progress: RefreshCw,
  at_risk: AlertTriangle,
  non_compliant: XCircle,
};

const statusColors = {
  compliant: 'text-emerald-400',
  in_progress: 'text-blue-400',
  at_risk: 'text-yellow-400',
  non_compliant: 'text-red-400',
};

const typeColors = {
  metric: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checklist: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  activity: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

interface QuarterViewProps {
  quarter: string;
  items: any[];
}

export default function QuarterView({ quarter, items }: QuarterViewProps) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Quarter Header */}
      <div className="relative mb-6">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 bg-emerald-100 rounded-full mb-2 shadow-lg shadow-white-800/50" />
          <h3 className="text-lg font-bold text-white-400">{quarter}</h3>
          <div className="text-xs text-slate-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Items Stack */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-700/20 rounded-xl p-4 text-center text-slate-600 text-sm">
            No items
          </div>
        ) : (
          items.map((item) => {
            const teams = item.team_contributors?.map((tc: any) => tc.team) || [];
            const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
            const statusColor = statusColors[item.status as keyof typeof statusColors];

            return (
              <div
                key={item.id}
                className="group bg-gradient-to-br from-slate-900/70 to-slate-800/50 border border-slate-700/40 rounded-xl p-4
                           hover:scale-105 hover:border-slate-600/60 hover:shadow-xl hover:shadow-blue-500/10
                           transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <StatusIcon className={`w-4 h-4 ${statusColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 leading-tight mb-1 line-clamp-2">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${typeColors[item.type as keyof typeof typeColors]}`}>
                        {item.type}
                      </span>
                      <div className={`px-2 py-0.5 rounded-lg bg-gradient-to-br ${getMaturityColor(item.maturity_level)} text-[10px] font-bold text-white`}>
                        L{item.maturity_level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Domain */}
                <div className="text-[10px] text-slate-500 mb-2 truncate">
                  {item.domain?.name}
                </div>

                {/* Teams */}
                {teams.length > 0 && (
                  <div className="flex gap-1">
                    {teams.slice(0, 3).map((team: any) => (
                      <div
                        key={team.id}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${team.color_from || '#3b82f6'}, ${team.color_to || '#2563eb'})`,
                          color: 'white'
                        }}
                        title={team.name}
                      >
                        {team.name.charAt(0)}
                      </div>
                    ))}
                    {teams.length > 3 && (
                      <div className="w-6 h-6 rounded-md bg-slate-700/50 flex items-center justify-center text-slate-400 text-[10px]">
                        +{teams.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}