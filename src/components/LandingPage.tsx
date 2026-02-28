import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  Play, 
  Zap, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Download, 
  Clock, 
  Check, 
  ChevronRight, 
  Github, 
  Twitter, 
  Linkedin,
  Cpu,
  ShieldCheck,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030014]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl flex items-center justify-center glow-purple">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white uppercase">VISIONARY AI</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Showcase', 'Features', 'Pricing', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
              {user ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/5 transition-all"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#030014] border-b border-white/5"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Showcase', 'Features', 'Pricing', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-400 hover:text-white block px-3 py-4 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="px-3 py-4 space-y-2">
                {user ? (
                  <>
                    <button 
                      onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                      className="w-full text-white px-6 py-3 rounded-full text-sm font-semibold border border-white/10"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full bg-white text-black px-6 py-3 rounded-full text-sm font-semibold"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full bg-white text-black px-6 py-3 rounded-full text-sm font-semibold"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-purple text-xs font-bold tracking-widest uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple"></span>
              </span>
              v2.0 is now live
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Create Stunning <br />
              <span className="text-gradient">AI Videos</span> in Seconds
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
              Transform your ideas into cinematic masterpieces. Our advanced AI models handle text-to-video, image-to-video, and professional-grade animation with zero effort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group"
              >
                {user ? 'Go to Dashboard' : 'Start Creating'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-[#030014]"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p>Trusted by 50,000+ creators worldwide</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 glow-purple group cursor-pointer">
              <img
                src="https://picsum.photos/seed/cyberpunk/1280/720"
                alt="AI Video Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute bottom-6 left-6 right-6 p-4 glass-card border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-purple/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Rendering...</div>
                    <div className="text-sm font-bold text-white">Cinematic Neon City</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-brand-blue">84% Complete</div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-blue/30 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-purple/30 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Showcase = () => {
  const items = [
    { type: 'image', title: 'Cyberpunk City', seed: 'cyberpunk-city', span: 'col-span-1' },
    { type: 'image', title: 'Cinematic Portrait', seed: 'portrait-neon', span: 'col-span-1' },
    { type: 'image', title: 'Futuristic Robot', seed: 'robot-ai', span: 'col-span-1' },
    { type: 'video', title: 'Space Odyssey', seed: 'space-nebula', span: 'md:col-span-2' },
    { type: 'video', title: 'Ocean Depths', seed: 'deep-sea', span: 'md:col-span-1' },
  ];

  return (
    <section id="showcase" className="py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">AI Showcase</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore the incredible quality of content generated by our community. From hyper-realistic portraits to immersive cinematic worlds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className={`${item.span} relative group rounded-2xl overflow-hidden border border-white/5 aspect-[4/3] md:aspect-auto md:h-[300px]`}
            >
              <img
                src={`https://picsum.photos/seed/${item.seed}/800/600`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">{item.type}</span>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  {item.type === 'video' && (
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CreatorHighlight = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[80px] -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-white/10 glow-blue">
                <img
                  src="https://picsum.photos/seed/mohsin/600/600"
                  alt="Mohsin Sultan"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 glass-card p-6 border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-brand-blue fill-current" />
                  </div>
                  <div>
                    <div className="font-bold">@mohsinsultan</div>
                    <div className="text-xs text-slate-400">1.2M Followers</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="w-12 h-12 bg-brand-purple/20 rounded-xl flex items-center justify-center mb-8">
                <Zap className="text-brand-purple w-6 h-6 fill-current" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 italic">
                "Visionary AI has completely revolutionized my creative workflow. What used to take days of manual rendering now happens in seconds."
              </h2>
              <div className="mb-8">
                <div className="text-xl font-bold text-white">Mohsin Sultan</div>
                <div className="text-brand-blue font-medium">Digital Creator & Filmmaker</div>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                  Read Case Study
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Text-to-Video",
      desc: "Describe your scene and watch our AI bring it to life with stunning cinematic detail."
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: "Image-to-Video",
      desc: "Animate static images into dynamic scenes. Perfect for turning concept art into motion."
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "Audio-driven Animation",
      desc: "Sync visuals perfectly with your audio tracks for music videos and dynamic storytelling."
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "HD Export (1080p)",
      desc: "Download your creations in crystal clear high definition, ready for any platform."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fast Queue System",
      desc: "Skip the wait with our optimized GPU pipeline. Your renders start almost instantly."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">Powerful AI Features</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to create professional-grade AI video content in one unified platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 hover:border-brand-purple/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-6 group-hover:bg-brand-purple/20 transition-colors">
                <div className="text-brand-purple">{f.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      desc: "Perfect for testing the waters.",
      features: ["1 Credit", "720p Export", "Standard Queue", "Community Support"],
      cta: "Start for Free",
      highlight: false
    },
    {
      name: "Pro",
      price: "1000",
      currency: "PKR",
      period: "/month",
      desc: "For serious creators and pros.",
      features: ["Unlimited Credits", "1080p HD Export", "Priority Queue", "No Watermark", "Commercial License"],
      cta: "Go Pro Now",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Tailored for teams and studios.",
      features: ["Custom GPU Nodes", "API Access", "Dedicated Support", "Team Collaboration", "Volume Discounts"],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your creative needs. No hidden fees, just pure AI power.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative glass-card p-10 flex flex-col ${
                tier.highlight ? 'border-brand-purple/50 glow-purple scale-105 z-10' : ''
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-purple text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm">{tier.desc}</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {tier.currency && <span className="text-lg mr-1">{tier.currency}</span>}
                    {tier.price}
                  </span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {tier.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-brand-purple flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-full font-bold transition-all ${
                tier.highlight 
                  ? 'bg-brand-purple text-white hover:bg-brand-purple/90 glow-purple' 
                  : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Highlight */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="glass-card p-8 lg:p-12 border-brand-blue/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-brand-blue" />
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Why we are more affordable?</h3>
                <p className="text-slate-400 mb-6">
                  Unlike competitors who rely on generic cloud providers, we've built our own proprietary GPU orchestration layer.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Cpu className="w-4 h-4 text-brand-blue" /> GPU Optimization
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="w-4 h-4 text-brand-blue" /> Smart Credits
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" /> No Hidden Fees
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="w-4 h-4 text-brand-blue" /> Fair Usage
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Visionary AI</span>
                    <div className="h-2 w-32 bg-brand-purple rounded-full" />
                    <span className="font-bold">1000 PKR</span>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                    <span className="text-sm">Competitor A</span>
                    <div className="h-2 w-48 bg-slate-600 rounded-full" />
                    <span className="font-bold">8500 PKR</span>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                    <span className="text-sm">Competitor B</span>
                    <div className="h-2 w-56 bg-slate-600 rounded-full" />
                    <span className="font-bold">12000 PKR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#030014] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tighter text-white uppercase">Visionary AI</span>
            </div>
            <p className="text-slate-400 max-w-xs mb-8">
              Empowering creators with the next generation of AI-powered video tools. Create, animate, and inspire.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Showcase</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 Visionary AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">System Status</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Showcase />
        <CreatorHighlight />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};
