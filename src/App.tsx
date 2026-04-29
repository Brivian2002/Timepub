import { auth, googleProvider, db } from "./lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Composer } from "./components/Composer";
import { Connections } from "./components/Connections";
import { LogIn, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "composer" | "connections">("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
          });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#4ade80]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] text-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4 flex flex-col items-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/906/906324.png" 
              alt="Logo" 
              className="w-20 h-20 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] mb-4"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tighter uppercase italic skew-x-[-10deg]">Timepub</h1>
              <p className="text-gray-400 text-sm">Unified social media management and broadcasting.</p>
            </div>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-bold hover:bg-[#4ade80] transition-colors group"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <div className="grid grid-cols-3 gap-4 pt-12">
            {['TikTok', 'YouTube', 'Facebook'].map((platform) => (
              <div key={platform} className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-gray-500 italic">
                {platform}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === "dashboard" && <Dashboard user={user} onNewPost={() => setActiveTab("composer")} />}
          {activeTab === "composer" && <Composer user={user} onPostCreated={() => setActiveTab("dashboard")} />}
          {activeTab === "connections" && <Connections user={user} />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
