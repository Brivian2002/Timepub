import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Share2, Plus, CheckCircle2, AlertCircle, ExternalLink, Smartphone, Youtube, Facebook, Trash2, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import axios from "axios";

interface ConnectionsProps {
  user: User;
}

export function Connections({ user }: ConnectionsProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "connections")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConnections(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [user]);

  const handleConnect = async (platform: string) => {
    setLoading(platform);
    try {
      const response = await axios.get(`/api/auth/url/${platform}?userId=${user.uid}`);
      const { url } = response.data;
      
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      
      if (!authWindow) {
        alert("Pop-up blocked. Please enable pop-ups to connect your account.");
      }
    } catch (error) {
      console.error("Failed to initiate connection", error);
    } finally {
      setLoading(null);
    }
  };

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: 'from-[#000000] to-[#25f4ee]' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-[#FF0000] to-[#282828]' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-[#1877f2] to-[#0d59b0]' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Channel Connections</h2>
        <p className="text-gray-500">Authorize SocialForge to securely broadcast content to your accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const conn = connections.find(c => c.platform === platform.id);
          const isConnected = !!conn;

          return (
            <div key={platform.id} className="group relative">
               {/* Background Decorative */}
               <div className={cn(
                 "absolute -inset-0.5 bg-gradient-to-br rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500",
                 platform.color
               )}></div>
               
               <div className="relative bg-[#111] border border-white/5 rounded-[32px] p-8 flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-start mb-12">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5",
                      isConnected ? "text-[#4ade80]" : "text-gray-500"
                    )}>
                      <platform.icon className="w-7 h-7" />
                    </div>
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#4ade80]/10 rounded-full border border-[#4ade80]/20">
                        <ShieldCheck className="w-3 h-3 text-[#4ade80]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4ade80]">Authorized</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <AlertCircle className="w-3 h-3 text-gray-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Disconnected</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold">{platform.name}</h3>
                    {isConnected ? (
                      <div className="flex items-center gap-2">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${conn.accountName}`} className="w-5 h-5 rounded-full bg-white/10" />
                        <p className="text-sm font-medium text-[#4ade80]">{conn.accountName}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Connect your account to enable broadcasting features.</p>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex gap-2">
                    {isConnected ? (
                      <>
                        <button className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                           <RefreshCw className="w-3.5 h-3.5" /> Re-sync
                        </button>
                        <button className="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleConnect(platform.id)}
                        disabled={loading === platform.id}
                        className="w-full h-14 bg-white hover:bg-[#4ade80] text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        {loading === platform.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Connect Account <ExternalLink className="w-3.5 h-3.5" /></> }
                      </button>
                    )}
                  </div>
               </div>
            </div>
          )
        })}
      </div>

      <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] border-dashed flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold flex items-center gap-2 justify-center md:justify-start">
            <ShieldCheck className="w-4 h-4 text-[#4ade80]" /> Enterprise Security
          </h4>
          <p className="text-xs text-gray-500 max-w-sm">We use military-grade AES-256 encryption to protect your OAuth tokens. We jamais store your passwords.</p>
        </div>
        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
          View Security Audit
        </button>
      </div>
    </div>
  );
}
