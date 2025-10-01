// src/app/admin/capabilities/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Capability, CapabilityDomain, Team } from '@/lib/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminCapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [domains, setDomains] = useState<CapabilityDomain[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCapability, setEditingCapability] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    domain_id: '',
    name: '',
    description: '',
    current_maturity: 3.0,
    target_maturity: 4.5,
    trend: 'stable' as 'up' | 'down' | 'stable',
    velocity: 0.5,
    target_quarter: 'Q2 2025',
    team_ids: [] as string[]
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch capabilities with domains and teams
    const { data: capData } = await supabase
      .from('capabilities')
      .select(`
        *,
        domain:capability_domains(*),
        team_capabilities(team:teams(*))
      `);

    setCapabilities(capData || []);

    // Fetch domains
    const { data: domainData } = await supabase
      .from('capability_domains')
      .select('*')
      .order('display_order');

    setDomains(domainData || []);

    // Fetch teams
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    setTeams(teamData || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const capabilityData = {
      domain_id: formData.domain_id,
      name: formData.name,
      description: formData.description,
      current_maturity: formData.current_maturity,
      target_maturity: formData.target_maturity,
      trend: formData.trend,
      velocity: formData.velocity,
      target_quarter: formData.target_quarter
    };

    if (editingCapability) {
      // Update capability
      const { error } = await supabase
        .from('capabilities')
        .update(capabilityData)
        .eq('id', editingCapability.id);

      if (error) {
        console.error('Error updating capability:', error);
        alert('Error updating capability');
        return;
      }

      // Update team assignments
      await supabase
        .from('team_capabilities')
        .delete()
        .eq('capability_id', editingCapability.id);

      if (formData.team_ids.length > 0) {
        const teamAssignments = formData.team_ids.map(team_id => ({
          capability_id: editingCapability.id,
          team_id
        }));

        await supabase.from('team_capabilities').insert(teamAssignments);
      }
    } else {
      // Create new capability
      const { data, error } = await supabase
        .from('capabilities')
        .insert([capabilityData])
        .select()
        .single();

      if (error) {
        console.error('Error creating capability:', error);
        alert('Error creating capability');
        return;
      }

      // Create team assignments
      if (formData.team_ids.length > 0 && data) {
        const teamAssignments = formData.team_ids.map(team_id => ({
          capability_id: data.id,
          team_id
        }));

        await supabase.from('team_capabilities').insert(teamAssignments);
      }
    }

    setIsModalOpen(false);
    setEditingCapability(null);
    resetForm();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this capability?')) return;

    const { error } = await supabase
      .from('capabilities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting capability:', error);
      alert('Error deleting capability');
    } else {
      fetchData();
    }
  }

  function openEditModal(capability: any) {
    setEditingCapability(capability);
    setFormData({
      domain_id: capability.domain_id,
      name: capability.name,
      description: capability.description || '',
      current_maturity: capability.current_maturity,
      target_maturity: capability.target_maturity,
      trend: capability.trend,
      velocity: capability.velocity,
      target_quarter: capability.target_quarter,
      team_ids: capability.team_capabilities?.map((tc: any) => tc.team.id) || []
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingCapability(null);
    resetForm();
    setIsModalOpen(true);
  }

  function resetForm() {
    setFormData({
      domain_id: domains[0]?.id || '',
      name: '',
      description: '',
      current_maturity: 3.0,
      target_maturity: 4.5,
      trend: 'stable',
      velocity: 0.5,
      target_quarter: 'Q2 2025',
      team_ids: []
    });
  }

  function toggleTeam(teamId: string) {
    setFormData(prev => ({
      ...prev,
      team_ids: prev.team_ids.includes(teamId)
        ? prev.team_ids.filter(id => id !== teamId)
        : [...prev.team_ids, teamId]
    }));
  }

  function getMaturityColor(level: number) {
    if (level >= 4.5) return 'from-emerald-500 to-teal-500';
    if (level >= 3.5) return 'from-lime-500 to-emerald-500';
    if (level >= 2.5) return 'from-yellow-500 to-amber-500';
    return 'from-orange-500 to-amber-600';
  }

  function getMaturityBorder(level: number) {
    if (level >= 4.5) return 'border-emerald-500/30';
    if (level >= 3.5) return 'border-lime-500/30';
    if (level >= 2.5) return 'border-yellow-500/30';
    return 'border-orange-500/30';
  }

  // Group capabilities by domain
  const groupedCapabilities = domains.map(domain => ({
    domain,
    capabilities: capabilities.filter(c => c.domain_id === domain.id)
  }));

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Manage Capabilities</h1>
          <p className="text-sm text-slate-500">Create and track capability maturity</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={domains.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Capability
        </button>
      </div>

      {domains.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500">Please create domains first before adding capabilities.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedCapabilities.map(({ domain, capabilities: domainCaps }) => (
            <div key={domain.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
                <h2 className="text-lg text-emerald-400 uppercase tracking-widest font-medium">{domain.name}</h2>
                <span className="text-xs text-slate-600">({domainCaps.length})</span>
              </div>

              {domainCaps.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-slate-700/20 rounded-xl">
                  <p className="text-slate-600 text-sm">No capabilities in this domain yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domainCaps.map((capability) => {
                    const capabilityTeams = capability.team_capabilities?.map((tc: any) => tc.team) || [];

                    return (
                      <div
                        key={capability.id}
                        className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl p-5 hover:border-slate-600/50 transition-all"
>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-slate-200 mb-2">{capability.name}</h3>
                            {capability.description && (
                              <p className="text-xs text-slate-500 mb-3">{capability.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1 rounded-lg bg-gradient-to-br ${getMaturityColor(capability.current_maturity)} border ${getMaturityBorder(capability.current_maturity)}`}>
                                <span className="text-sm font-bold text-white">{capability.current_maturity.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-slate-600">→</span>
                              <span className="text-xs text-slate-500">Target: {capability.target_maturity}</span>
                            </div>
                          </div>
                        </div>

                        {capabilityTeams.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {capabilityTeams.map((team: Team) => (
                                <div
                                  key={team.id}
                                  className={`px-2 py-1 rounded text-xs text-white bg-gradient-to-r from-${team.color_from} to-${team.color_to}`}
                                >
                                  {team.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-800/50">
                          <span>Velocity: +{capability.velocity.toFixed(1)}</span>
                          <span>{capability.target_quarter}</span>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => openEditModal(capability)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-blue-400 text-sm"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(capability.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/20 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-all text-rose-400 text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-light text-slate-100 mb-6">
              {editingCapability ? 'Edit Capability' : 'Create New Capability'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Domain</label>
                  <select
                    value={formData.domain_id}
                    onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select a domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Capability Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="e.g., Authentication"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Brief description"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Current Maturity (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.current_maturity}
                    onChange={(e) => setFormData({ ...formData, current_maturity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Target Maturity (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.target_maturity}
                    onChange={(e) => setFormData({ ...formData, target_maturity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Trend</label>
                  <select
                    value={formData.trend}
                    onChange={(e) => setFormData({ ...formData, trend: e.target.value as 'up' | 'down' | 'stable' })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="up">📈 Improving</option>
                    <option value="stable">➡️ Stable</option>
                    <option value="down">📉 Declining</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Velocity (6mo growth)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.velocity}
                    onChange={(e) => setFormData({ ...formData, velocity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="e.g., 0.8"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Target Quarter</label>
                  <select
                    value={formData.target_quarter}
                    onChange={(e) => setFormData({ ...formData, target_quarter: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="Q1 2025">Q1 2025</option>
                    <option value="Q2 2025">Q2 2025</option>
                    <option value="Q3 2025">Q3 2025</option>
                    <option value="Q4 2025">Q4 2025</option>
                    <option value="Q1 2026">Q1 2026</option>
                    <option value="Q2 2026">Q2 2026</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-3">Assigned Teams</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900/30 rounded-xl border border-slate-800">
                    {teams.map((team) => (
                      <label
                        key={team.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          formData.team_ids.includes(team.id)
                            ? `bg-gradient-to-r from-${team.color_from} to-${team.color_to} text-white`
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.team_ids.includes(team.id)}
                          onChange={() => toggleTeam(team.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{team.name}</span>
                      </label>
                    ))}
                  </div>
                  {teams.length === 0 && (
                    <p className="text-xs text-slate-600 mt-2">No teams available. Create teams first.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCapability(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400 font-medium"
                >
                  {editingCapability ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}