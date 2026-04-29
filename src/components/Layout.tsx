import React, { useState } from "react";
import { User } from "firebase/auth";
import { LayoutDashboard, PenSquare, Share2, LogOut, Search, Bell, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onLogout: () => void;
}

export function Layout({ children, user, activeTab, onTabChange, onLogout }: LayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "YouTube post successfully broadcasted", type: 'success', time: '2 mins ago', read: false },
    { id: 2, message: "TikTok account needs re-authorization", type: 'error', time: '5 mins ago', read: false },
    { id: 3, message: "New follower on Facebook Page", type: 'success', time: '1 hour ago', read: true },
  ]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "composer", label: "New Post", icon: PenSquare },
    { id: "connections", label: "Connections", icon: Share2 },
  ];

  return (
    <div className="h-screen flex bg-[#0A0A0A] text-white font-sans selection:bg-[#4ade80] selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a1a1a] flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/906/906324.png" 
              alt="Logo" 
              className="w-10 h-10"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase skew-x-[-10deg]">Timepub</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold -mt-1">Studio</p>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#4ade80] font-bold">Studio Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                activeTab === tab.id 
                  ? "bg-white text-black" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-black" : "text-gray-500 group-hover:text-white")} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-8 h-8 rounded-full bg-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user.displayName || user.email}</p>
              <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">Free Plan</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-bottom border-[#1a1a1a] flex items-center justify-between px-8 bg-[#0A0A0A]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-96">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              placeholder="Search posts or history..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-gray-300"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#4ade80] rounded-full border-2 border-[#0A0A0A]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                       <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Notifications</h4>
                       <button className="text-[10px] font-bold text-[#4ade80] hover:underline">Mark all read</button>
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-xs italic">No new notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3 items-start">
                             <div className={cn("mt-1 shrink-0", n.type === 'success' ? 'text-[#4ade80]' : 'text-red-400')}>
                               {n.type === 'success' ? <Bell className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                             </div>
                             <div className="min-w-0">
                               <p className="text-xs font-medium text-gray-200">{n.message}</p>
                               <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter mt-1">{n.time}</p>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <button 
              onClick={() => onTabChange('composer')}
              className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-[#4ade80] transition-colors"
            >
              New Post
            </button>
          </div>
        </header>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
