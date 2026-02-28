import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Zap, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search,
  Loader2,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Plus
} from 'lucide-react';

export const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their subscriptions
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_subscriptions (
            *,
            plans (*)
          )
        `);
      
      if (profilesError) throw profilesError;

      const { data: plansData, error: plansError } = await supabase.from('plans').select('*');
      if (plansError) throw plansError;
      
      if (profiles) setUsers(profiles);
      if (plansData) setPlans(plansData);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
      alert('Error fetching admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ is_active: !currentStatus })
      .eq('user_id', userId);
    
    if (!error) fetchData();
    else alert('Error updating status: ' + error.message);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will remove their profile and subscription. Note: This does not delete their Auth account.')) return;
    
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) fetchData();
    else alert('Error deleting user: ' + error.message);
  };

  const updateCredits = async (userId: string) => {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ credits_remaining: newCredits })
      .eq('user_id', userId);
    
    if (!error) {
      setEditingCredits(null);
      fetchData();
    } else {
      alert('Error updating credits: ' + error.message);
    }
  };

  const upgradeUserPlan = async (userId: string, planId: string) => {
    const plan = plans.find(p => p.id === planId);
    // Default credits if not specified in plan
    const credits = plan.name === 'Pro' ? 500 : (plan.name === 'Enterprise' ? 9999 : 5);
    
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        plan_id: planId,
        credits_remaining: credits,
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .eq('user_id', userId);
    
    if (!error) fetchData();
    else alert('Error updating plan: ' + error.message);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
        <p className="text-slate-400 animate-pulse">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="text-brand-purple w-8 h-8" />
            Admin Control Center
          </h1>
          <p className="text-slate-400">Manage users, activate plans, and control system access</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh Data"
          >
            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 w-64 md:w-80"
            />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Details</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Plan</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Credits</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const sub = user.user_subscriptions?.[0];
                const isEditing = editingCredits === user.id;

                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-bold border border-brand-purple/30">
                          {user.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.full_name || 'Anonymous User'}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <select 
                          className="bg-transparent text-sm text-brand-blue font-bold focus:outline-none cursor-pointer hover:text-white transition-colors"
                          value={sub?.plan_id || ''}
                          onChange={(e) => upgradeUserPlan(user.id, e.target.value)}
                        >
                          <option value="" disabled>Select Plan</option>
                          {plans.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#030014]">{p.name}</option>
                          ))}
                        </select>
                        <div className="text-[10px] text-slate-500">
                          {sub?.plans?.name ? `Current: ${sub.plans.name}` : 'No active plan'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            value={newCredits}
                            onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                            className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none"
                          />
                          <button onClick={() => updateCredits(user.id)} className="text-emerald-400 hover:text-emerald-300">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingCredits(null)} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/credits">
                          <div className="text-sm text-white font-medium flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-purple" />
                            {sub?.credits_remaining || 0}
                          </div>
                          <button 
                            onClick={() => {
                              setEditingCredits(user.id);
                              setNewCredits(sub?.credits_remaining || 0);
                            }}
                            className="opacity-0 group-hover/credits:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                          >
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => togglePlanStatus(user.id, sub?.is_active)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          sub?.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {sub?.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sub?.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete User Profile"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users className="w-12 h-12 text-slate-700" />
                      <p className="text-slate-500">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/10">
          <div className="text-sm text-slate-400 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-white">{users.length}</div>
        </div>
        <div className="glass-card p-6 border-white/10">
          <div className="text-sm text-slate-400 mb-1">Active Subscriptions</div>
          <div className="text-3xl font-bold text-emerald-400">
            {users.filter(u => u.user_subscriptions?.[0]?.is_active).length}
          </div>
        </div>
        <div className="glass-card p-6 border-white/10">
          <div className="text-sm text-slate-400 mb-1">Pro Users</div>
          <div className="text-3xl font-bold text-brand-blue">
            {users.filter(u => u.user_subscriptions?.[0]?.plans?.name === 'Pro').length}
          </div>
        </div>
      </div>
    </div>
  );
};
