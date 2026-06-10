"use client";

import { useEffect, useState } from "react";
import { Trophy, Plus, Gamepad2, Users, X, LogOut, ShieldCheck, Activity, Swords, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Game { id: number; name: string; }
interface Tournament { id: number; name: string; status: string; game: Game; max_teams: number; teams: any[]; }

export default function TournamentLobby() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTourneyName, setNewTourneyName] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [teamCount, setTeamCount] = useState("8");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing Core...");
  
  // STATE UNTUK ALERT MODERN (TOAST)
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type, message: "" }), 3500);
  };

  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/tournaments?all=true").then(res => res.json()),
      fetch("http://localhost:8000/api/games").then(res => res.json())
    ]).then(([tournamentsData, gamesData]) => {
      if (tournamentsData.success) setTournaments(tournamentsData.data);
      if (gamesData.success) {
        setGames(gamesData.data);
        if (gamesData.data.length > 0) setSelectedGameId(gamesData.data[0].id.toString());
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      // Tampilkan error cantik kalau backend mati saat baru buka web
      showToast("error", "Koneksi ke Server HQ terputus!"); 
    });
  }, []);

  useEffect(() => {
    if (isSubmitting) {
      const messages = ["Securing Multi-Tenant Partition...", "Building Binary Tree Nodes...", "Allocating Database Resources...", "Finalizing Tournament Logic...", "Deploying to Cloud Node..."];
      let i = 0;
      const interval = setInterval(() => { setLoadingMessage(messages[i % messages.length]); i++; }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token"); 

      const response = await fetch("http://localhost:8000/api/tournaments", {
        method: "POST", 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newTourneyName, game_id: parseInt(selectedGameId), team_count: parseInt(teamCount) })
      });
      const result = await response.json();
      
      if (result.success) {
        showToast("success", "Turnamen berhasil di-deploy!");
        setTimeout(() => { router.push(`/tournament/${result.data.id}`); }, 1500);
      } else {
        // ALERT KUNO DIMUSNAHKAN, GANTI JADI TOAST MODERN
        showToast("error", "Gagal: " + result.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      // ALERT KUNO DIMUSNAHKAN, GANTI JADI TOAST MODERN
      showToast("error", "Sistem Error. Pastikan Mesin Backend Menyala.");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
      <p className="text-cyan-500 animate-pulse font-black uppercase tracking-widest text-xs">Syncing Public Matrix...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden font-sans flex flex-col">
      
      {/* 🟢 KOMPONEN TOAST MODERN (MUNCUL DI TENGAH ATAS) 🟢 */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.9 }} 
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl border ${
              toast.type === "error" ? "bg-red-900/30 text-red-400 border-red-500/30" : "bg-emerald-900/30 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {toast.type === "error" ? <AlertCircle size={20} className="text-red-500" /> : <CheckCircle2 size={20} className="text-emerald-500" />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID BACKGROUND ELEGAN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* OVERLAY LOADING CREATE */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-4 border-b-4 border-cyan-500 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)]" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-r-4 border-l-4 border-emerald-500 rounded-full opacity-50" />
              <Trophy className="absolute inset-0 m-auto text-white animate-pulse" size={40} />
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white mb-2">Deploying Engine</h2>
              <p className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">{loadingMessage}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-6 md:p-16 max-w-[1600px] mx-auto pt-16 md:pt-24 flex-1 w-full">
        <header className="mb-20 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-10">
          <div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 mb-4">
              <span className="w-12 h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
              <span className="text-cyan-500 font-black uppercase tracking-[0.3em] text-xs">Public Arena</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 leading-tight">
              LEOVINIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">HQ</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl">
              Pusat komando turnamen esports berskala Enterprise. Daftarkan tim Anda, pantau bagan pertandingan secara realtime, dan buktikan siapa yang terbaik di arena.
            </p>
          </div>
          
          {typeof window !== 'undefined' && localStorage.getItem("admin_token") ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#111113]/80 backdrop-blur-xl p-3 md:p-4 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 px-4 py-2">
                <ShieldCheck className="text-emerald-500" size={20}/>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">{localStorage.getItem("admin_name") || "Admin"}</p>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Access Granted</p>
                </div>
              </div>
              <div className="w-full sm:w-[1px] h-[1px] sm:h-10 bg-white/10"></div>
              <div className="flex w-full sm:w-auto gap-2">
                <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform hover:scale-105 text-xs">
                  <Plus size={16} /> Deploy Event
                </button>
                <button onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_name"); window.location.reload(); }} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-3.5 rounded-2xl transition-colors" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/admin/login" className="bg-[#111113] hover:bg-[#1a1a1f] border border-white/10 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 transition-transform hover:scale-105 shadow-xl text-xs">
              <ShieldCheck size={18} className="text-cyan-500"/> HQ Login
            </Link>
          )}
        </header>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-white"><Activity className="text-cyan-500" size={20}/> Active Operations</h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tournaments.length} Events</span>
        </div>

        {tournaments.length === 0 ? (
          <div className="w-full border border-dashed border-white/10 bg-white/[0.01] rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <Swords className="text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">No Active Arenas</h3>
            <p className="text-slate-500 text-sm max-w-sm">Saat ini tidak ada turnamen yang sedang membuka pendaftaran atau berjalan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tournaments.map((t, idx) => (
              <Link href={`/tournament/${t.id}`} key={t.id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group bg-[#111113]/80 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 rounded-3xl p-6 h-full flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors"></div>
                  <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-lg"><Gamepad2 size={24} /></div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        t.status === 'registration_open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        t.status === 'ongoing' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors relative z-10">{t.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 relative z-10">{t.game?.name || "Game System"}</p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roster Fill</span>
                    <span className="text-xs font-mono font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-white flex items-center gap-2">
                      <Users size={14} className="text-cyan-500"/> {t.teams?.length || 0} / {t.max_teams}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#111113] border border-white/10 shadow-2xl rounded-[2rem] p-8 md:p-10 w-full max-w-lg relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
              
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Deploy Event</h2>
                <p className="text-xs text-cyan-500 font-bold uppercase tracking-widest">Initialize Tournament Matrix</p>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Event Title</label>
                  <input type="text" value={newTourneyName} onChange={(e) => setNewTourneyName(e.target.value)} placeholder="Misal: Leovinia Championship 2026" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-cyan-500 transition-colors" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Game System</label>
                    <select value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none">
                      {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Max Teams Target</label>
                    <select value={teamCount} onChange={(e) => setTeamCount(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none">
                      <option value="4">4 Teams Bracket</option><option value="8">8 Teams Bracket</option>
                      <option value="16">16 Teams Bracket</option><option value="32">32 Teams Bracket</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl mt-4 hover:bg-cyan-400 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
                  <Activity size={18} /> Initialize Core
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER PUBLIC */}
      <footer className="mt-auto border-t border-white/5 pt-8 pb-12 px-6 md:px-16 w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 flex items-center justify-center rounded-lg border border-cyan-500/20">
            <ShieldCheck size={16} className="text-cyan-500" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-[0.2em]">LEOVINIA CODE.ID</span>
        </div>
        
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center md:text-left">
          &copy; 2026 All Rights Reserved. <br className="md:hidden" />Engineered in Prabumulih.
        </p>
        
        <div className="flex gap-6">
          <Link href="#" className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-widest transition-colors">Privacy</Link>
          <Link href="#" className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-widest transition-colors">Terms</Link>
          <Link href="/admin/login" className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-widest transition-colors">HQ Access</Link>
        </div>
      </footer>

    </motion.div>
  );
}