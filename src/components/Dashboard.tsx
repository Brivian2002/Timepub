import { User } from "firebase/auth";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { formatDate } from "../lib/utils";
import { CheckCircle2, AlertCircle, Clock, Video, FileText, Image as ImageIcon, Eye } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  user: User;
  onNewPost: () => void;
}

export function Dashboard({ user, onNewPost }: DashboardProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, failed: 0 });

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      
      const newStats = postsData.reduce((acc, post: any) => {
        acc.total++;
        if (post.status === 'pending') acc.pending++;
        if (post.status === 'failed') acc.failed++;
        return acc;
      }, { total: 0, pending: 0, failed: 0 });
      setStats(newStats);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">Monitoring your social stream</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-2 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4ade80]">Real-time Sync Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Broadcasts", value: stats.total, icon: FileText, color: "text-blue-400" },
          { label: "Queue Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
          { label: "Failed Attempts", value: stats.failed, icon: AlertCircle, color: "text-red-400" },
          { label: "Active Channels", value: 3, icon: Share2, color: "text-[#4ade80]" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-[#4ade80]/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <button className="text-xs font-bold text-gray-500 hover:text-white underline underline-offset-4">View All History</button>
        </div>

        {posts.length === 0 ? (
          <div className="p-20 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
            <p className="text-gray-500 italic mb-4">No broadcasts found in your history.</p>
            <button 
              onClick={onNewPost}
              className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-[#4ade80] transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {posts.map((post, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={post.id}
                className="group flex items-center gap-6 p-4 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <div className="flex -space-x-2">
                    {post.platforms.map((p: string) => (
                      <div key={p} className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-[#1A1A1A] flex items-center justify-center overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${p}&backgroundColor=${p === 'tiktok' ? '000000' : p === 'youtube' ? 'ff0000' : '1877f2'}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 truncate">Broadcast To</span>
                    <span className="text-xs font-bold text-[#4ade80] truncate">{post.platforms.join(', ')}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-300">{post.content}</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{formatDate(post.createdAt)}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    post.status === 'completed' ? "bg-[#4ade80]/10 text-[#4ade80]" : "bg-yellow-400/10 text-yellow-400"
                  )}>
                    {post.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {post.status}
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Share2 } from "lucide-react";
import { cn } from "../lib/utils";
