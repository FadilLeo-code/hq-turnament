"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar";
import { Trophy, Users, Gamepad2, Activity } from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";

// SWR Fetcher dengan penyertaan Token Sanctum
const fetcher = (url: string) => fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } }).then((res) => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");

  // Tarik data statistik secara realtime
  const { data: statsResponse, isLoading } = useSWR("http://127.0.0.1:8000/api/dashboard/stats", fetcher);
  const stats = statsResponse?.data;

  // Pengecekan Keamanan Identitas
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const name = localStorage.getItem("admin_name");
    
    if (!token) {
      router.push("/admin/login");
    } else {
      setAdminName(name || "Super Admin");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      <AdminSidebar />

      <div className="flex-1 md:ml-64 pt-28 md:pt-10 p-5 md:p-10 max-w-[1600px] w-full overflow-x-hidden">
        <header className="mb-10">
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Command Center</h1>
          <p className="text-cyan-500 font-bold tracking-widest text-xs uppercase">Welcome back, {adminName}</p>
        </header>

        {/* Kartu Statistik Dinamis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="bg-cyan-500/10 p-4 rounded-xl text-cyan-400"><Trophy size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Active Events</p>
              {isLoading ? <div className="h-8 w-12 bg-white/5 rounded animate-pulse"></div> : <h3 className="text-3xl font-black">{stats?.active_events || 0}</h3>}
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400"><Users size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Global Teams</p>
              {isLoading ? <div className="h-8 w-12 bg-white/5 rounded animate-pulse"></div> : <h3 className="text-3xl font-black">{stats?.registered_teams || 0}</h3>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="bg-amber-500/10 p-4 rounded-xl text-amber-400"><Gamepad2 size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Game Matrix</p>
              {isLoading ? <div className="h-8 w-12 bg-white/5 rounded animate-pulse"></div> : <h3 className="text-3xl font-black">{stats?.game_systems || 0}</h3>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#111113] border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400"><Activity size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pending Matches</p>
              {isLoading ? <div className="h-8 w-12 bg-white/5 rounded animate-pulse"></div> : <h3 className="text-3xl font-black">{stats?.live_matches || 0}</h3>}
            </div>
          </motion.div>
        </div>

        {/* Panel Dekoratif untuk Ruang Kosong */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111113] border border-white/10 rounded-2xl p-8 min-h-[300px] flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]"><Activity size={28}/></div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">System Operational</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">All core matrices are fully synchronized</p>
             </div>
          </div>
          <div className="bg-gradient-to-br from-[#111113] to-[#0a0a0c] border border-white/10 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Quick Actions</h3>
              <p className="text-xs text-slate-500">Akses cepat manajemen sistem</p>
            </div>
            <div className="space-y-3 mt-8">
              <button onClick={() => router.push('/admin/tournaments')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left flex items-center justify-between transition-colors group">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Manage Events</span>
                <Trophy size={16} className="text-cyan-500 group-hover:scale-110 transition-transform"/>
              </button>
              <button onClick={() => router.push('/admin/users')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left flex items-center justify-between transition-colors group">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Access Control</span>
                <Users size={16} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
              </button>
            </div>
          </div>
        </div>
        {/* --- AREA FOOTER ADMIN --- */}
        <footer className="mt-auto pt-16 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-transparent">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            &copy; 2026 Leovinia HQ Command Center
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">System Online</span>
            </div>
            <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">v1.0.0-MVP</span>
          </div>
        </footer>
      </div>
    </div>
  );
}