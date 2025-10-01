// app/admin/achievements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Achievement, Team, Contributor } from '@/lib/types';
import { Plus, Trash2, Edit2, Trophy } from 'lucide-react';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    person_name: '',
    team_id: '',
    contributor_id: '',
    achieved_at: new Date().toISOString().split('T')[0],
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: achievementsData } = await supabase
      .from('achievements')
      .select(`
        *,
        team:teams(*),
        contributor:contributors(*)
      `)
      .order('achieved_at', { ascending: false });

    const { data: teamsData } = await supabase.from('teams').select('*');

    const { data: contributorsData } = await supabase
      .from('contributors')
      .select('*')
      .order('name');

    setAchievements(achievementsData || []);
    setTeams(teamsData || []);
    setContributors(contributorsData || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      team_id: formData.team_id || null,
      contributor_id: formData.contributor_id || null,
    };

    if (editingAchievement) {
      const { error } = await supabase
        .from('achievements')
        .update(dataToSubmit)
        .eq('id', editingAchievement.id);

      if (error) {
        alert('Error updating achievement: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('achievements').insert([dataToSubmit]);

      if (error) {
        alert('Error creating achievement: ' + error.message);
        return;
      }
    }

    closeModal();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    const { error } = await supabase.from('achievements').delete().eq('id', id);

    if (error) {
      alert('Error deleting achievement: ' + error.message);
    } else {
      fetchData();
    }
  }

  function openEditModal(achievement: Achievement) {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description || '',
      person_name: achievement.person_name || '',
      team_id: achievement.team_id || '',
      contributor_id: achievement.contributor_id || '',
      achieved_at: achievement.achieved_at.split('T')[0],
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingAchievement(null);
    setFormData({
      title: '',
      description: '',
      person_name: '',
      team_id: '',
      contributor_id: '',
      achieved_at: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingAchievement(null);
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Manage Achievements</h1>
          <p className="text-sm text-slate-500">Track team wins and celebrate success</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-medium text-slate-200">{achievement.title}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(achievement)}
                  className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-blue-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
                  className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-all text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {achievement.description && (
              <p className="text-sm text-slate-400 mb-4">{achievement.description}</p>
            )}

            <div className="space-y-2 text-xs">
              {achievement.person_name && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Achieved by:</span>
                  <span className="text-emerald-400 font-medium">{achievement.person_name}</span>
                </div>
              )}
              {achievement.team && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Team:</span>
                  <span className="text-slate-300">{achievement.team.name}</span>
                </div>
              )}
              {achievement.contributor && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Related to:</span>
                  <span className="text-slate-300">{achievement.contributor.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-300">
                  {new Date(achievement.achieved_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No achievements yet. Click "Add Achievement" to create one.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-light text-slate-100 mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Achieved 99.9% SLA Compliance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  placeholder="Describe the achievement..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Person/Team Member</label>
                  <input
                    type="text"
                    value={formData.person_name}
                    onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.achieved_at}
                    onChange={(e) => setFormData({ ...formData, achieved_at: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Team (optional)</label>
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">No team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Related Contributor (optional)</label>
                  <select
                    value={formData.contributor_id}
                    onChange={(e) => setFormData({ ...formData, contributor_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">No contributor</option>
                    {contributors.map((contributor) => (
                      <option key={contributor.id} value={contributor.id}>
                        {contributor.name}
                      </option>
                    ))}
                  </select>
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
                  {editingAchievement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
