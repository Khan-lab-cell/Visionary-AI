import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
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
  Music,
  Plus,
  XCircle
} from 'lucide-react';

interface GenerationViewProps {
  type: 'video' | 'image';
  subType?: 'text-to-video' | 'image-to-video';
  onBack: () => void;
}

export const GenerationView: React.FC<GenerationViewProps> = ({ type, subType, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('visionary-v2-turbo');
  const [duration, setDuration] = useState('5s');
  const [resolution, setResolution] = useState('1080p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const creditCost = type === 'video' ? 5 : 1;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setError(null);

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
          return prev + Math.random() * 10;
        });
      }, 500);

      // 3. Placeholder for FastAPI call
      // const response = await fetch('https://your-fastapi-url.com/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt, model, duration, resolution, type, subType, user_id: user.id }),
      // });
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      clearInterval(interval);
      setProgress(100);
      
      const dummyUrl = type === 'video' 
        ? 'https://cdn.pixabay.com/video/2023/10/20/185848-876610237_tiny.mp4'
        : `https://picsum.photos/seed/${Math.random()}/1920/1080`;
      
      setResult(dummyUrl);

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
          prompt,
          url: dummyUrl,
          thumbnail_url: dummyUrl,
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
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 flex items-center justify-center">
          {type === 'video' ? <Video className="text-brand-purple w-6 h-6" /> : <ImageIcon className="text-brand-blue w-6 h-6" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {type === 'video' ? (subType === 'image-to-video' ? 'Image to Video' : 'Text to Video') : 'AI Image Generation'}
          </h1>
          <p className="text-slate-400">Create high-quality {type}s with advanced AI models</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleGenerate} className="glass-card p-8 border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Prompt</label>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create in detail..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 min-h-[120px] resize-none"
              />
            </div>

            {(type === 'image' || subType === 'image-to-video') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Reference Image (Optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center group-hover:border-brand-purple/50 transition-colors bg-white/5">
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-400">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-brand-purple transition-colors" />
                        <p className="text-sm text-slate-400">Click or drag image to upload</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Background Audio (Optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 text-center group-hover:border-brand-blue/50 transition-colors bg-white/5">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Music className="w-4 h-4" />
                      <span className="text-xs">Upload MP3 or WAV</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Model</label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                >
                  <option value="visionary-v2-turbo">Visionary V2 Turbo</option>
                  <option value="cinematic-pro">Cinematic Pro</option>
                  <option value="realistic-v3">Realistic V3</option>
                </select>
              </div>
              {type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Duration</label>
                  <div className="flex gap-2">
                    {['5s', '10s', '15s'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`flex-grow py-3 rounded-xl text-sm font-medium transition-all ${
                          duration === d ? 'bg-brand-purple text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Resolution</label>
                <div className="flex gap-2">
                  {['720p', '1080p', '4K'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      className={`flex-grow py-3 rounded-xl text-sm font-medium transition-all ${
                        resolution === r ? 'bg-brand-blue text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Zap className="w-4 h-4 text-brand-purple" />
                  Estimated Cost
                </div>
                <span className="text-white font-bold">{creditCost} Credits</span>
              </div>
              <button
                type="submit"
                disabled={isGenerating || !prompt}
                className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="glass-card p-6 border-white/10 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">Preview</h3>
            
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
                          className="text-white/5 stroke-current"
                          strokeWidth="8"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        ></circle>
                        <circle
                          className="text-brand-purple stroke-current transition-all duration-500 ease-out"
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
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">AI is dreaming...</p>
                      <p className="text-slate-500 text-sm">Estimated time: 30s</p>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-brand-purple to-brand-blue"
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
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 relative group">
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
                      <button className="flex-grow py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button 
                        onClick={() => setResult(null)}
                        className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all"
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
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      {type === 'video' ? <Video className="w-8 h-8 text-slate-600" /> : <ImageIcon className="w-8 h-8 text-slate-600" />}
                    </div>
                    <p className="text-slate-500 text-sm max-w-[200px] mx-auto">
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
  );
};
