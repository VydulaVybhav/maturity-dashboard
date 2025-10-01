// app/admin/contributors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Contributor, OperationalDomain, Team } from '@/lib/types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function AdminContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [domains, setDomains] = useState<OperationalDomain[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain_id: '',
    type: 'metric' as 'metric' | 'checklist' | 'activity',
    status: 'in_progress' as 'compliant' | 'in_progress' | 'at_risk' | 'non_compliant',
    maturity_level: 1,
    target_quarter: '',
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: domainsData } = await supabase
      .from('operational_domains')
      .select('*')
      .order('display_order');

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

    const { data: teamsData } = await supabase.from('teams').select('*');

    setDomains(domainsData || []);
    setContributors(contributorsData || []);
    setTeams(teamsData || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingContributor) {
      // Update contributor
      const { error } = await supabase
        .from('contributors')
        .update(formData)
        .eq('id', editingContributor.id);

      if (error) {
        alert('Error updating contributor: ' + error.message);
        return;
      }

      // Update team assignments
      await supabase
        .from('team_contributors')
        .delete()
        .eq('contributor_id', editingContributor.id);

      if (selectedTeams.length > 0) {
        await supabase.from('team_contributors').insert(
          selectedTeams.map((team_id) => ({
            contributor_id: editingContributor.id,
            team_id,
          }))
        );
      }
    } else {
      // Create contributor
      const { data: newContributor, error } = await supabase
        .from('contributors')
        .insert([formData])
        .select()
        .single();

      if (error) {
        alert('Error creating contributor: ' + error.message);
        return;
      }

      // Add team assignments
      if (selectedTeams.length > 0 && newContributor) {
        await supabase.from('team_contributors').insert(
          selectedTeams.map((team_id) => ({
            contributor_id: newContributor.id,
            team_id,
          }))
        );
      }
    }

    closeModal();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This will delete the contributor and all its history.')) return;

    const { error } = await supabase.from('contributors').delete().eq('id', id);

    if (error) {
      alert('Error deleting contributor: ' + error.message);
    } else {
      fetchData();
    }
  }

  function openEditModal(contributor: Contributor) {
    setEditingContributor(contributor);
    setFormData({
      name: contributor.name,
      description: contributor.description || '',
      domain_id: contributor.domain_id,
      type: contributor.type,
      status: contributor.status,
      maturity_level: contributor.maturity_level,
      target_quarter: contributor.target_quarter || '',
    });
    setSelectedTeams(
      contributor.team_contributors?.map((tc: any) => tc.team.id) || []
    );
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingContributor(null);
    setFormData({
      name: '',
      description: '',
      domain_id: domains[0]?.id || '',
      type: 'metric',
      status: 'in_progress',
      maturity_level: 1,
      target_quarter: '',
    });
    setSelectedTeams([]);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingContributor(null);
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Manage Contributors</h1>
          <p className="text-sm text-slate-500">Create and manage operational contributors</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400"
        >
          <Plus className="w-4 h-4" />
          Add Contributor
        </button>
      </div>

      <div className="space-y-3">
        {contributors.map((contributor) => (
          <div
            key={contributor.id}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-slate-200">{contributor.name}</h3>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs">
                    {contributor.type}
                  </span>
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                    L{contributor.maturity_level}
                  </span>
                </div>
                {contributor.description && (
                  <p className="text-sm text-slate-500 mb-3">{contributor.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-500">
                    Domain: <span className="text-slate-300">{contributor.domain?.name}</span>
                  </span>
                  <span className="text-slate-500">
                    Status: <span className="text-slate-300">{contributor.status}</span>
                  </span>
                  {contributor.target_quarter && (
                    <span className="text-slate-500">
                      Target: <span className="text-slate-300">{contributor.target_quarter}</span>
                    </span>
                  )}
                </div>
                {contributor.team_contributors && contributor.team_contributors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {contributor.team_contributors.map((tc: any) => (
                      <span
                        key={tc.team.id}
                        className="px-2 py-1 bg-slate-700/30 text-slate-400 rounded text-xs"
                      >
                        {tc.team.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openEditModal(contributor)}
                  className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-blue-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(contributor.id)}
                  className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-all text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contributors.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500">No contributors yet. Click "Add Contributor" to create one.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-light text-slate-100 mb-6">
              {editingContributor ? 'Edit Contributor' : 'Create New Contributor'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., SLA Adherence - Requests"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Domain *</label>
                  <select
                    value={formData.domain_id}
                    onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="metric">Metric</option>
                    <option value="checklist">Checklist</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="compliant">Compliant</option>
                    <option value="in_progress">In Progress</option>
                    <option value="at_risk">At Risk</option>
                    <option value="non_compliant">Non-Compliant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Maturity Level *</label>
                  <select
                    value={formData.maturity_level}
                    onChange={(e) => setFormData({ ...formData, maturity_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="1">Level 1: Ad hoc</option>
                    <option value="2">Level 2: Organized</option>
                    <option value="3">Level 3: Adaptive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Target Quarter (optional)</label>
                <input
                  type="text"
                  value={formData.target_quarter}
                  onChange={(e) => setFormData({ ...formData, target_quarter: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Q2 2025"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Assigned Teams</label>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((team) => (
                    <label
                      key={team.id}
                      className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeams([...selectedTeams, team.id]);
                          } else {
                            setSelectedTeams(selectedTeams.filter((id) => id !== team.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400 font-medium"
                >
                  {editingContributor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
