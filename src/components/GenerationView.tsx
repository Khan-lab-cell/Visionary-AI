import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight,
  Upload, 
  Video, 
  Image as ImageIcon, 
  Zap, 
  Clock, 
  Maximize, 
  Loader2, 
  Download,
  Play,
  Sparkles,
  Plus,
  XCircle
} from 'lucide-react';

interface GenerationViewProps {
  type: 'video' | 'image';
  subType?: 'text-to-video' | 'image-to-video';
  onBack: () => void;
  onGoToPlans: () => void;
}

export const GenerationView: React.FC<GenerationViewProps> = ({ type, subType, onBack, onGoToPlans }) => {
  const [prompt, setPrompt] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [duration, setDuration] = useState('5s');
  const [resolution, setResolution] = useState('1080p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);

  const creditCost = type === 'video' ? 5 : 1;
  const isFreePlan = subscription?.plans?.name === 'Free';
  const isActive = subscription?.is_active;
  const fixedPrompt = "a beautiful cat walking in a garden";

  useEffect(() => {
    const fetchSub = async () => {
      setLoadingSub(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*, plans(*)')
          .eq('user_id', user.id)
          .single();
        setSubscription(sub);
        
        if (sub?.plans?.name === 'Free') {
          setPrompt(fixedPrompt);
        }
      }
      setLoadingSub(false);
    };
    fetchSub();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) return;
    
    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setError(null);

    const finalPrompt = prompt;

    try {
      // 1. Check User Session & Credits
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to generate content');

      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .single();

      if (!sub || !sub.is_active) {
        throw new Error('Your plan is inactive. Please activate your plan first.');
      }

      if (sub.credits_remaining < creditCost) {
        throw new Error(`Insufficient credits. You need ${creditCost} credits, but have ${sub.credits_remaining}. Upgrade your plan!`);
      }

      // 2. Dummy progress simulation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 5;
        });
      }, 1000);

      // 3. API Call or Mock Simulation
      const apiUrl = import.meta.env.VITE_API_URL;
      let finalUrl = '';

      if (apiUrl && apiUrl !== 'https://your-fastapi-url.com') {
        const formData = new FormData();
        formData.append('prompt', finalPrompt);
        formData.append('duration', duration);
        formData.append('resolution', resolution);
        formData.append('type', type);
        formData.append('subType', subType || '');
        formData.append('user_id', user.id);
        
        if (uploadedFile) {
          formData.append('file', uploadedFile);
        }

        const response = await fetch(`${apiUrl}/api/generate`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Generation failed on backend');
        }

        const data = await response.json();
        finalUrl = data.url;
      } else {
        // Simulation mode for demo/development
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate extra processing time
        finalUrl = type === 'video' 
          ? 'https://cdn.pixabay.com/video/2023/10/20/185848-876610237_tiny.mp4'
          : `https://picsum.photos/seed/${Math.random()}/1920/1080`;
      }
      
      clearInterval(interval);
      setProgress(100);
      setResult(finalUrl);

      // 4. Deduct Credits & Save Project
      await supabase
        .from('user_subscriptions')
        .update({ credits_remaining: sub.credits_remaining - creditCost })
        .eq('user_id', user.id);

      await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          type,
          prompt: finalPrompt,
          url: finalUrl,
          thumbnail_url: finalUrl,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        });

    } catch (err: any) {
      setError(err.message);
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-blue mb-8 transition-colors group font-medium"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
          {type === 'video' ? <Video className="text-brand-blue w-6 h-6" /> : <ImageIcon className="text-brand-blue w-6 h-6" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {type === 'video' ? (subType === 'image-to-video' ? 'Image to Video' : 'Text to Video') : 'AI Image Generation'}
          </h1>
          <p className="text-slate-600">Create high-quality {type}s with advanced AI models</p>
        </div>
      </div>

      <div className="relative">
        {!isActive && !loadingSub && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-[#030014]/40 rounded-3xl border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-brand-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Activate a Plan First</h2>
            <p className="text-slate-400 mb-8 max-w-sm">
              You need an active plan to use the generation studio. Activate your free trial or upgrade to Pro to start creating.
            </p>
            <button 
              onClick={onGoToPlans}
              className="px-8 py-4 bg-brand-purple text-white rounded-full font-bold hover:opacity-90 transition-all flex items-center gap-2"
            >
              Go to Plans <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${(isActive === false && !loadingSub) ? 'opacity-20 pointer-events-none' : ''}`}>
          {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleGenerate} className="glass-card p-8 border-slate-200 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">Prompt</label>
                {isFreePlan && (
                  <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Free Trial Mode
                  </span>
                )}
              </div>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create in detail..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 min-h-[120px] resize-none font-medium"
              />
              {isFreePlan && (
                <p className="mt-2 text-[11px] text-slate-500 italic">
                  Upgrade to Pro to unlock custom prompts and higher quality generations.
                </p>
              )}
            </div>

            {(type === 'image' || subType === 'image-to-video') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Reference Image (Optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-brand-blue/50 transition-colors bg-slate-50">
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-brand-blue transition-colors" />
                        <p className="text-sm text-slate-500">Click or drag image to upload</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Duration</label>
                  <div className="flex gap-2">
                    {['5s', '10s', '15s', '20s'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`flex-grow py-3 rounded-xl text-sm font-medium transition-all ${
                          duration === d ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={type === 'image' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-3">Resolution</label>
                <div className="flex gap-2">
                  {['480p', '720p', '1080p'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      className={`flex-grow py-3 rounded-xl text-sm font-medium transition-all ${
                        resolution === r ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {type === 'video' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  <span className="font-bold text-amber-400">Note:</span> 1080p and larger than 5sec video takes too much time to process. Please be patient.
                </p>
              </div>
            )}

            <div className="pt-4">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Zap className="w-4 h-4 text-brand-blue" />
                  Estimated Cost
                </div>
                <span className="text-slate-900 font-bold">{creditCost} Credits</span>
              </div>
              <button
                type="submit"
                disabled={isGenerating || !prompt}
                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {type === 'video' ? 'Video' : 'Image'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-slate-200 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Preview</h3>
            
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-6"
                  >
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-slate-100 stroke-current"
                          strokeWidth="8"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        ></circle>
                        <circle
                          className="text-brand-blue stroke-current transition-all duration-500 ease-out"
                          strokeWidth="8"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * progress) / 100}
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium mb-1">AI is dreaming...</p>
                      <p className="text-slate-500 text-sm">Estimated time: 30s</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="h-full bg-brand-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full space-y-6"
                  >
                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      {type === 'video' ? (
                        <video 
                          src={result} 
                          controls 
                          autoPlay 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={result} 
                          alt="Generated" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-grow py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button 
                        onClick={() => setResult(null)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      {type === 'video' ? <Video className="w-8 h-8 text-slate-300" /> : <ImageIcon className="w-8 h-8 text-slate-300" />}
                    </div>
                    <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                      Your generated {type} will appear here after processing
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
