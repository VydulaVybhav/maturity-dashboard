// src/app/admin/teams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Team } from '@/lib/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color_from: 'blue-500',
    color_to: 'blue-600'
  });

  const supabase = createClient();

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching teams:', error);
    } else {
      setTeams(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingTeam) {
      // Update existing team
      const { error } = await supabase
        .from('teams')
        .update(formData)
        .eq('id', editingTeam.id);

      if (error) {
        console.error('Error updating team:', error);
        alert('Error updating team');
      }
    } else {
      // Create new team
      const { error } = await supabase
        .from('teams')
        .insert([formData]);

      if (error) {
        console.error('Error creating team:', error);
        alert('Error creating team');
      }
    }

    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', color_from: 'blue-500', color_to: 'blue-600' });
    fetchTeams();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this team?')) return;

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team');
    } else {
      fetchTeams();
    }
  }

  function openEditModal(team: Team) {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      color_from: team.color_from,
      color_to: team.color_to
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingTeam(null);
    setFormData({ name: '', color_from: 'blue-500', color_to: 'blue-600' });
    setIsModalOpen(true);
  }

  const colorOptions = [
    { from: 'blue-500', to: 'blue-600', label: 'Blue', gradient: 'linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))' },
    { from: 'purple-500', to: 'purple-600', label: 'Purple', gradient: 'linear-gradient(to right, rgb(168, 85, 247), rgb(147, 51, 234))' },
    { from: 'red-500', to: 'red-600', label: 'Red', gradient: 'linear-gradient(to right, rgb(239, 68, 68), rgb(220, 38, 38))' },
    { from: 'orange-500', to: 'orange-600', label: 'Orange', gradient: 'linear-gradient(to right, rgb(249, 115, 22), rgb(234, 88, 12))' },
    { from: 'green-500', to: 'green-600', label: 'Green', gradient: 'linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))' },
    { from: 'pink-500', to: 'pink-600', label: 'Pink', gradient: 'linear-gradient(to right, rgb(236, 72, 153), rgb(219, 39, 119))' },
    { from: 'cyan-500', to: 'cyan-600', label: 'Cyan', gradient: 'linear-gradient(to right, rgb(6, 182, 212), rgb(8, 145, 178))' },
    { from: 'yellow-500', to: 'yellow-600', label: 'Yellow', gradient: 'linear-gradient(to right, rgb(234, 179, 8), rgb(202, 138, 4))' },
    { from: 'indigo-500', to: 'indigo-600', label: 'Indigo', gradient: 'linear-gradient(to right, rgb(99, 102, 241), rgb(79, 70, 229))' },
    { from: 'teal-500', to: 'teal-600', label: 'Teal', gradient: 'linear-gradient(to right, rgb(20, 184, 166), rgb(13, 148, 136))' }
  ];

  const getColorGradient = (colorFrom: string, colorTo: string) => {
    const color = colorOptions.find(c => c.from === colorFrom && c.to === colorTo);
    return color?.gradient || 'linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Manage Teams</h1>
          <p className="text-sm text-slate-500">Create and manage platform teams</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-200 mb-2">{team.name}</h3>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ background: getColorGradient(team.color_from, team.color_to) }}
                >
                  Color Preview
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(team)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-blue-400 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(team.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-all text-rose-400 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500">No teams yet. Click "Add Team" to create one.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-light text-slate-100 mb-6">
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Team Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Platform Core"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Team Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.from}
                      type="button"
                      onClick={() => setFormData({ ...formData, color_from: color.from, color_to: color.to })}
                      style={{ background: color.gradient }}
                      className={`h-12 rounded-lg transition-all ${
                        formData.color_from === color.from
                          ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900'
                          : 'hover:scale-110'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTeam(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400 font-medium"
                >
                  {editingTeam ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}