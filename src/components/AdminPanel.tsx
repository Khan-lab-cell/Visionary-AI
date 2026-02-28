import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  Users, 
  Zap, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`
        *,
        user_subscriptions (
          *,
          plans (*)
        )
      `);
    
    const { data: plansData } = await supabase.from('plans').select('*');
    
    if (profiles) setUsers(profiles);
    if (plansData) setPlans(plansData);
    setLoading(false);
  };

  const togglePlanStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ is_active: !currentStatus })
      .eq('user_id', userId);
    
    if (!error) fetchData();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    // Note: In a real app, you'd use a service role to delete from auth.users
    // Here we delete from profiles which cascades if set up correctly
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) fetchData();
  };

  const upgradeUserPlan = async (userId: string, planId: string) => {
    const plan = plans.find(p => p.id === planId);
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        plan_id: planId,
        credits_remaining: plan.credit_limit,
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .eq('user_id', userId);
    
    if (!error) fetchData();
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.id.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="text-brand-purple" />
            Admin Control Center
          </h1>
          <p className="text-slate-400">Manage users, plans, and system access</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 w-64"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-white/5 bg-white/5">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan / Credits</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const sub = user.user_subscriptions?.[0];
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-bold">
                          {user.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.full_name || 'Anonymous'}</div>
                          <div className="text-xs text-slate-500 truncate w-32">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <select 
                          className="bg-transparent text-sm text-brand-blue font-bold focus:outline-none"
                          value={sub?.plan_id || ''}
                          onChange={(e) => upgradeUserPlan(user.id, e.target.value)}
                        >
                          <option value="" disabled>Select Plan</option>
                          {plans.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#030014]">{p.name}</option>
                          ))}
                        </select>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-brand-purple" />
                          {sub?.credits_remaining || 0} Credits
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => togglePlanStatus(user.id, sub?.is_active)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          sub?.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {sub?.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sub?.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
