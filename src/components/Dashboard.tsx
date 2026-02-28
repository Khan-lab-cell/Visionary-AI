import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Image as ImageIcon, 
  History, 
  LogOut, 
  User, 
  Calendar, 
  Zap, 
  Plus, 
  Search,
  LayoutDashboard,
  Settings,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Type,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GenerationView } from './GenerationView';
import { AdminPanel } from './AdminPanel';

type View = 'main' | 'video-select' | 'video-gen' | 'image-gen' | 'history' | 'admin' | 'plans';

export const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('main');
  const [videoSubType, setVideoSubType] = useState<'text-to-video' | 'image-to-video' | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Fetch Subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .single();
      setSubscription(subData);

      // Fetch Projects (only non-expired)
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      setProjects(projectData || []);

      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { 
      label: 'Plan', 
      value: subscription?.plans?.name || 'No Plan', 
      icon: <Zap className="w-5 h-5 text-brand-purple" />,
      clickable: true,
      onClick: () => setCurrentView('plans')
    },
    { 
      label: 'Credits', 
      value: `${subscription?.credits_remaining || 0} Left`, 
      icon: <Sparkles className="w-5 h-5 text-brand-blue" /> 
    },
    { 
      label: 'Projects', 
      value: projects.length.toString(), 
      icon: <History className="w-5 h-5 text-emerald-400" /> 
    },
  ];

  const actions = [
    { id: 'video', label: 'Generate Video', icon: <Video className="w-8 h-8" />, color: 'from-brand-purple to-brand-blue' },
    { id: 'image', label: 'Generate Image', icon: <ImageIcon className="w-8 h-8" />, color: 'from-brand-blue to-emerald-400' },
    { id: 'history', label: 'Projects History', icon: <History className="w-8 h-8" />, color: 'from-brand-purple/50 to-brand-blue/50' },
  ];

  const renderMainView = () => (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!</h1>
          <p className="text-slate-400">What will you create today?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 w-64"
            />
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center">
            <User className="w-5 h-5 text-brand-purple" />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={stat.clickable ? stat.onClick : undefined}
            className={`glass-card p-6 border-white/10 ${stat.clickable ? 'cursor-pointer hover:border-brand-purple/50 transition-colors' : ''}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-sm text-slate-400">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (action.id === 'video') setCurrentView('video-select');
              else if (action.id === 'image') setCurrentView('image-gen');
              else if (action.id === 'history') setCurrentView('history');
            }}
            className={`relative overflow-hidden rounded-3xl p-8 text-left group h-48`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-auto text-white group-hover:scale-110 transition-transform origin-left">
                {action.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{action.label}</h3>
                <p className="text-sm text-slate-300 opacity-80">Start a new project</p>
              </div>
              <Plus className="absolute top-8 right-8 w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Projects Placeholder */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Projects</h2>
          <button 
            onClick={() => setCurrentView('history')}
            className="text-sm text-brand-purple font-bold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.length > 0 ? projects.slice(0, 4).map((project) => (
            <div key={project.id} className="glass-card overflow-hidden border-white/10 group cursor-pointer">
              <div className="aspect-video relative">
                <img
                  src={project.thumbnail_url || project.url}
                  alt={project.prompt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white text-sm mb-1 truncate">{project.prompt || 'Untitled Project'}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  Expires in {Math.round((new Date(project.expires_at).getTime() - Date.now()) / 60000)}m
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center glass-card border-dashed border-white/10">
              <p className="text-slate-500">No active projects. Start generating to see them here!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );

  const activateFreePlan = async () => {
    try {
      const { data: plans } = await supabase.from('plans').select('*').eq('name', 'Free').single();
      if (!plans) throw new Error('Free plan not found in database');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: plans.id,
          credits_remaining: 5,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh data
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderPlansView = () => (
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Subscription Plans</h1>
        <p className="text-slate-400">Choose the best plan for your creative journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: 'Free',
            price: '0',
            credits: '5 Credits',
            features: ['Standard Quality', 'Locked Prompt Trial', 'Community Support'],
            isFree: true
          },
          {
            name: 'Pro',
            price: '1000',
            currency: 'PKR',
            credits: '500 Credits',
            features: ['HD Quality', 'Custom Prompts', 'Priority Queue', 'No Watermark'],
            isFree: false
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            credits: 'Unlimited',
            features: ['4K Quality', 'API Access', 'Dedicated Support', 'Team Tools'],
            isFree: false
          }
        ].map((plan) => (
          <div key={plan.name} className={`glass-card p-8 flex flex-col border-white/10 ${plan.name === subscription?.plans?.name ? 'border-brand-purple ring-1 ring-brand-purple' : ''}`}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-extrabold text-white mb-4">
                {plan.currency && <span className="text-lg mr-1">{plan.currency}</span>}
                {plan.price}
                {plan.price !== 'Custom' && plan.price !== '0' && <span className="text-sm text-slate-400 font-normal">/mo</span>}
              </div>
              <div className="flex items-center gap-2 text-brand-purple font-bold text-sm">
                <Zap className="w-4 h-4" />
                {plan.credits}
              </div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.isFree ? (
              <button 
                onClick={activateFreePlan}
                disabled={subscription?.plans?.name === 'Free'}
                className="w-full py-4 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                {subscription?.plans?.name === 'Free' ? 'Currently Active' : 'Activate Free Plan'}
              </button>
            ) : (
              <a 
                href="https://wa.me/923429907507"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-bold bg-brand-purple text-white text-center hover:opacity-90 transition-all shadow-lg shadow-brand-purple/20"
              >
                Contact on WhatsApp
              </a>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <button 
          onClick={() => setCurrentView('main')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const renderVideoSelect = () => (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Generation Mode</h1>
        <p className="text-slate-400">Select how you want to create your AI video</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            id: 'text-to-video',
            title: 'Text to Video',
            description: 'Generate high-quality cinematic videos from just a text description.',
            icon: <Type className="w-12 h-12 text-brand-purple" />,
            color: 'from-brand-purple/20 to-brand-blue/20',
            borderColor: 'border-brand-purple/30'
          },
          {
            id: 'image-to-video',
            title: 'Image to Video',
            description: 'Animate your static images into stunning dynamic video sequences.',
            icon: <ImageIcon className="w-12 h-12 text-brand-blue" />,
            color: 'from-brand-blue/20 to-emerald-400/20',
            borderColor: 'border-brand-blue/30'
          }
        ].map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setVideoSubType(mode.id as any);
              setCurrentView('video-gen');
            }}
            className={`glass-card p-10 text-left border-2 ${mode.borderColor} hover:bg-white/5 transition-all group relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className="mb-6">{mode.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{mode.title}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">{mode.description}</p>
              <div className="flex items-center gap-2 text-white font-bold group-hover:text-brand-purple transition-colors">
                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-12 text-center">
        <button 
          onClick={() => setCurrentView('main')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030014] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => setCurrentView('main')}>
          <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tighter text-white uppercase">Visionary AI</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'main', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
            { id: 'video-select', icon: <Video className="w-5 h-5" />, label: 'Video Studio' },
            { id: 'image-gen', icon: <ImageIcon className="w-5 h-5" />, label: 'Image Studio' },
            { id: 'history', icon: <History className="w-5 h-5" />, label: 'History' },
            { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
            { id: 'support', icon: <HelpCircle className="w-5 h-5" />, label: 'Support' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          {profile?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'admin' ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              Admin Panel
            </button>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'main' && renderMainView()}
            {currentView === 'plans' && renderPlansView()}
            {currentView === 'video-select' && renderVideoSelect()}
            {currentView === 'video-gen' && (
              <GenerationView 
                type="video" 
                subType={videoSubType} 
                onBack={() => setCurrentView('video-select')} 
              />
            )}
            {currentView === 'image-gen' && (
              <GenerationView 
                type="image" 
                onBack={() => setCurrentView('main')} 
              />
            )}
            {currentView === 'admin' && <AdminPanel />}
            {currentView === 'history' && (
              <div className="max-w-4xl mx-auto">
                <button 
                  onClick={() => setCurrentView('main')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-white mb-8">Projects History</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.length > 0 ? projects.map((project) => (
                    <div key={project.id} className="glass-card p-4 border-white/10 flex gap-4">
                      <div className="w-32 aspect-video rounded-lg overflow-hidden bg-white/5">
                        <img src={project.thumbnail_url || project.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-white font-bold truncate w-32">{project.prompt || 'Untitled'}</h4>
                        <p className="text-slate-500 text-sm">Generated {new Date(project.created_at).toLocaleDateString()}</p>
                        <div className="mt-2 flex gap-2">
                          <span className="px-2 py-0.5 bg-brand-purple/20 text-brand-purple text-[10px] font-bold rounded uppercase">{project.type}</span>
                          <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[10px] font-bold rounded uppercase">
                            {Math.round((new Date(project.expires_at).getTime() - Date.now()) / 60000)}m left
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-slate-500">No projects found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
