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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center glow-primary">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900 uppercase">VISIONARY AI</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Showcase', 'Features', 'Pricing', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-600 hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
              {user ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-slate-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-100 transition-all"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/20"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/20"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-brand-primary p-2">
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
            className="md:hidden bg-white border-b border-slate-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Showcase', 'Features', 'Pricing', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-600 hover:text-brand-primary block px-3 py-4 rounded-md text-base font-medium"
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
                      className="w-full text-slate-700 px-6 py-3 rounded-full text-sm font-semibold border border-slate-200"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full bg-brand-primary text-white px-6 py-3 rounded-full text-sm font-semibold"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full bg-brand-primary text-white px-6 py-3 rounded-full text-sm font-semibold"
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
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              v2.0 is now live
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
              Create Stunning <br />
              <span className="text-gradient">AI Videos</span> in Seconds
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Transform your ideas into cinematic masterpieces. Our advanced AI models handle text-to-video, image-to-video, and professional-grade animation with zero effort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="px-8 py-4 bg-brand-primary text-white rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/20"
              >
                {user ? 'Go to Dashboard' : 'Start Creating'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
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
                    className="w-10 h-10 rounded-full border-2 border-white"
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
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-2xl glow-primary group cursor-pointer">
              <img
                src="https://picsum.photos/seed/cyberpunk/1280/720"
                alt="AI Video Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center group-hover:bg-slate-900/10 transition-colors">
                <div className="w-20 h-20 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute bottom-6 left-6 right-6 p-4 glass-card border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Rendering...</div>
                    <div className="text-sm font-bold text-slate-900">Cinematic Neon City</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-brand-secondary font-bold">84% Complete</div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-secondary/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -z-10" />
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
    <section id="showcase" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-slate-900">AI Showcase</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore the incredible quality of content generated by our community. From hyper-realistic portraits to immersive cinematic worlds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className={`${item.span} relative group rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] md:aspect-auto md:h-[300px] shadow-sm`}
            >
              <img
                src={`https://picsum.photos/seed/${item.seed}/800/600`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{item.type}</span>
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
        <div className="glass-card p-8 lg:p-16 relative overflow-hidden bg-slate-50/50 border-slate-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-xl glow-secondary">
                <img
                  src="/images/creator.PNG"
                  alt="Mohsin Sultan"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 glass-card p-6 border-slate-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-brand-primary fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">@mohsinsultan</div>
                    <div className="text-xs text-slate-500">1.2M Followers</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-8">
                <Zap className="text-brand-primary w-6 h-6 fill-current" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 italic text-slate-800 leading-tight">
                "Visionary AI has completely revolutionized my creative workflow. What used to take days of manual rendering now happens in seconds."
              </h2>
              <div className="mb-8">
                <div className="text-xl font-bold text-slate-900">Mohsin Sultan</div>
                <div className="text-brand-primary font-medium">Digital Creator & Filmmaker</div>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all text-slate-700 font-medium">
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
    <section id="features" className="py-24 bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-slate-900">Powerful AI Features</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to create professional-grade AI video content in one unified platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 hover:border-brand-primary/30 transition-colors group bg-white border-slate-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors">
                <div className="text-brand-primary">{f.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">
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
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your creative needs. No hidden fees, just pure AI power.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative glass-card p-10 flex flex-col bg-white border-slate-200 ${
                tier.highlight ? 'border-brand-primary ring-1 ring-brand-primary shadow-xl glow-primary scale-105 z-10' : 'shadow-sm'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-500 text-sm">{tier.desc}</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {tier.currency && <span className="text-lg mr-1">{tier.currency}</span>}
                    {tier.price}
                  </span>
                  <span className="text-slate-500">{tier.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {tier.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-brand-secondary flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-full font-bold transition-all ${
                tier.highlight 
                  ? 'bg-brand-primary text-white hover:opacity-90 shadow-lg shadow-brand-primary/20' 
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Highlight */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="glass-card p-8 lg:p-12 border-brand-secondary/30 relative overflow-hidden bg-white shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Why we are more affordable?</h3>
                <p className="text-slate-600 mb-6">
                  Unlike competitors who rely on generic cloud providers, we've built our own proprietary GPU orchestration layer.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Cpu className="w-4 h-4 text-brand-primary" /> GPU Optimization
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Zap className="w-4 h-4 text-brand-primary" /> Smart Credits
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" /> No Hidden Fees
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CreditCard className="w-4 h-4 text-brand-primary" /> Fair Usage
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">Visionary AI</span>
                    <div className="h-2 w-32 bg-brand-primary rounded-full" />
                    <span className="font-bold text-slate-900">1000 PKR</span>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                    <span className="text-sm text-slate-700">Competitor A</span>
                    <div className="h-2 w-48 bg-slate-300 rounded-full" />
                    <span className="font-bold text-slate-900">8500 PKR</span>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                    <span className="text-sm text-slate-700">Competitor B</span>
                    <div className="h-2 w-56 bg-slate-300 rounded-full" />
                    <span className="font-bold text-slate-900">12000 PKR</span>
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
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tighter text-slate-900 uppercase">Visionary AI</span>
            </div>
            <p className="text-slate-600 max-w-xs mb-8">
              Empowering creators with the next generation of AI-powered video tools. Create, animate, and inspire.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                  <Icon className="w-5 h-5 text-slate-600" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4 text-slate-600">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Showcase</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-slate-600">
              <li><a href="#" className="hover:text-brand-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-600">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 Visionary AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-primary transition-colors">System Status</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Security</a>
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
