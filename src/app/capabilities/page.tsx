// app/capabilities/page.tsx
import { createClient } from '@/lib/supabase/server';
import CapabilityCard from '@/components/capabilities/CapabilityCard';

export default async function CapabilitiesPage() {
  const supabase = createClient();

  const { data: domains } = await supabase
    .from('capability_domains')
    .select(`
      *,
      capabilities(
        *,
        team_capabilities(
          team:teams(*)
        )
      )
    `)
    .order('display_order');

  if (!domains || domains.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-2xl p-8 text-center">
          <p className="text-slate-500">No capabilities configured yet. Add them in the Admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-100 mb-2">Capability Matrix</h1>
        <p className="text-sm text-slate-500">Detailed capability tracking with team assignments</p>
      </div>

      <div className="space-y-8">
        {domains.map((domain) => (
          <div key={domain.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
              <h2 className="text-lg text-emerald-400 uppercase tracking-widest font-medium">{domain.name}</h2>
            </div>

            <div className="space-y-3">
              {domain.capabilities.map((capability: any) => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}