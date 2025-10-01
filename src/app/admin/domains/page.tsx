// src/app/admin/domains/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OperationalDomain } from '@/lib/types';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<OperationalDomain[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<OperationalDomain | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0
  });

  const supabase = createClient();

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    const { data, error} = await supabase
      .from('operational_domains')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching domains:', error);
    } else {
      setDomains(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingDomain) {
      const { error } = await supabase
        .from('operational_domains')
        .update(formData)
        .eq('id', editingDomain.id);

      if (error) {
        console.error('Error updating domain:', error);
        alert('Error updating domain');
      }
    } else {
      const { error } = await supabase
        .from('operational_domains')
        .insert([{ ...formData, display_order: domains.length }]);

      if (error) {
        console.error('Error creating domain:', error);
        alert('Error creating domain');
      }
    }

    setIsModalOpen(false);
    setEditingDomain(null);
    setFormData({ name: '', description: '', display_order: 0 });
    fetchDomains();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This will delete all contributors in this domain!')) return;

    const { error } = await supabase
      .from('operational_domains')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting domain:', error);
      alert('Error deleting domain');
    } else {
      fetchDomains();
    }
  }

  async function moveOrder(domain: OperationalDomain, direction: 'up' | 'down') {
    const currentIndex = domains.findIndex(d => d.id === domain.id);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= domains.length) return;

    const swapDomain = domains[swapIndex];

    // Swap display_order
    await supabase
      .from('operational_domains')
      .update({ display_order: swapDomain.display_order })
      .eq('id', domain.id);

    await supabase
      .from('operational_domains')
      .update({ display_order: domain.display_order })
      .eq('id', swapDomain.id);

    fetchDomains();
  }

  function openEditModal(domain: OperationalDomain) {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      description: domain.description || '',
      display_order: domain.display_order
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingDomain(null);
    setFormData({ name: '', description: '', display_order: 0 });
    setIsModalOpen(true);
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Manage Domains</h1>
          <p className="text-sm text-slate-500">Create and organize capability domains</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      <div className="space-y-3">
        {domains.map((domain, index) => (
          <div
            key={domain.id}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-200 mb-2">{domain.name}</h3>
                {domain.description && (
                  <p className="text-sm text-slate-500 mb-4">{domain.description}</p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => moveOrder(domain, 'up')}
                  disabled={index === 0}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveOrder(domain, 'down')}
                  disabled={index === domains.length - 1}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(domain)}
                  className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-blue-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(domain.id)}
                  className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-all text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {domains.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-xl">
          <p className="text-slate-500">No domains yet. Click "Add Domain" to create one.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-light text-slate-100 mb-6">
              {editingDomain ? 'Edit Domain' : 'Create New Domain'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Domain Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Security & Compliance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  placeholder="Brief description of this domain"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDomain(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-emerald-400 font-medium"
                >
                  {editingDomain ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}