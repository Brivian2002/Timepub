import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import { Send, Image as ImageIcon, Video, X, Loader2, Sparkles, CheckCircle, Smartphone, Youtube, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import axios from "axios";

interface ComposerProps {
  user: User;
  onPostCreated: () => void;
}

export function Composer({ user, onPostCreated }: ComposerProps) {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [media, setMedia] = useState<{ type: 'image' | 'video', url: string }[]>([]);

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleBroadcast = async () => {
    if (!content || platforms.length === 0) return;
    
    setLoading(true);
    try {
      await axios.post("/api/broadcast", {
        userId: user.uid,
        content,
        platforms,
        mediaUrls: media.map(m => m.url)
      });
      setSuccess(true);
      setTimeout(() => {
        onPostCreated();
      }, 2000);
    } catch (error) {
      console.error("Broadcast failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[#4ade80]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Mission Accomplished</h2>
          <p className="text-gray-500 max-w-xs mx-auto">Your content has been queued for broadcasting across {platforms.length} platforms.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight italic skew-x-[-5deg]">Forge Your Content</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">AI Assistance Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Compose */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-[#4ade80]/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to broadcast today?"
              className="relative w-full h-64 bg-[#111] border border-white/10 rounded-3xl p-6 text-lg outline-none focus:border-[#4ade80]/50 transition-all resize-none shadow-2xl"
            />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
               <div className="flex items-center gap-2 pointer-events-auto">
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-white/5">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-white/5">
                    <Video className="w-4 h-4" />
                  </button>
               </div>
               <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  {content.length} characters
               </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5" /> Media Attachments
            </h4>
            <div className="flex gap-3">
               <button className="w-24 aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-white hover:border-white/20 transition-all">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Add Files</span>
               </button>
            </div>
          </div>
        </div>

        {/* Right: Targets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-[#111] border border-white/10 rounded-[40px] space-y-6">
             <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Target Channels</h4>
                <div className="space-y-3">
                  {[
                    { id: 'tiktok', icon: Smartphone, label: 'TikTok', color: 'hover:text-[#fe2c55]' },
                    { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'hover:text-[#ff0000]' },
                    { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:text-[#1877f2]' },
                  ].map((p) => {
                    const active = platforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-sm font-bold",
                          active 
                            ? "bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <p.icon className={cn("w-4 h-4", active ? "text-black" : p.color)} />
                          {p.label}
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center",
                          active ? "bg-black border-black" : "border-gray-700"
                        )}>
                          {active && <div className="w-2 h-2 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80]"></div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
             </div>

             <div className="pt-4 space-y-4">
                <button
                  disabled={!content || platforms.length === 0 || loading}
                  onClick={handleBroadcast}
                  className="w-full h-16 bg-[#4ade80] disabled:bg-white/10 disabled:text-gray-600 text-black rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <Send className="w-5 h-5" /> BROADCAST NOW </>}
                </button>
                <p className="text-[10px] text-center text-gray-500 font-medium px-4">
                  By clicking broadcast, you agree to our cross-platform posting policies.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
