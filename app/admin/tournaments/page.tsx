"use client";

import { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { Trash2, Search, Filter, Download, X, CheckCircle2, ChevronLeft, ChevronRight, Edit3, ExternalLink, Trophy, Users, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import Link from "next/link";

interface Game { id: number; name: string; }
interface Tournament { id: number; name: string; status: string; max_teams: number; created_at: string; game: Game; teams: any[]; }
interface PaginatedResponse { data: Tournament[]; meta: { current_page: number; last_page: number; total: number; per_page: number; }; success: boolean; }

const fetcher = (url: string) => fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } }).then((res) => res.json());

export default function ManageTournaments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const apiUrl = `http://127.0.0.1:8000/api/tournaments?page=${page}&search=${search}&sort=${sortCol}&direction=${sortDir}`;
  const { data: responseData, error, isLoading, mutate } = useSWR<PaginatedResponse>(apiUrl, fetcher, { keepPreviousData: true });

  const tournaments = responseData?.data || [];
  const meta = responseData?.meta;

  const [toast, setToast] = useState({ show: false, message: "" });
  const [activeModal, setActiveModal] = useState<"none" | "edit">("none");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  // Edit Form States
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: "" }), 3000); };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const openEdit = (t: Tournament) => {
    setSelectedTournament(t);
    setEditName(t.name);
    setEditStatus(t.status);
    setActiveModal("edit");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tournaments/${selectedTournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({ name: editName, status: editStatus })
      });
      const result = await res.json();
      if (result.success) {
        showToast("Tournament updated successfully");
        setActiveModal("none");
        mutate();
      } else alert("Update failed: " + result.message);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`DANGER ZONE: Hapus total turnamen "${name}" beserta seluruh bagan dan tim yang sudah mendaftar?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tournaments/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      const result = await res.json();
      if (result.success) { showToast("Tournament destroyed"); mutate(); }
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex">
      <AdminSidebar />
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2">
            <CheckCircle2 size={18}/> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 md:ml-64 pt-28 md:pt-10 p-5 md:p-10 max-w-[1600px] w-full overflow-x-hidden">
        <nav className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex gap-2">
          <Link href="/admin/dashboard" className="hover:text-cyan-500 transition-colors">Dashboard</Link>
          <span>/</span><span className="text-white">Active Tournaments</span>
        </nav>

        <header className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Tournament Control</h1>
            <p className="text-cyan-500 font-bold uppercase text-xs tracking-widest">Event Master Data</p>
          </div>
          <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-transform hover:scale-105">
            <Trophy size={16} /> Deploy New (Lobby)
          </Link>
        </header>

        <div className="bg-[#111113] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={search} onChange={(e) => {setSearch(e.target.value); setPage(1);}} placeholder="Search event name..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <button className="bg-black/50 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors">
              <Filter size={14}/> Filter
            </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-4 pl-6 w-16">ID</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Event Name {sortCol === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="p-4">Game System</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Roster Fill</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-16 text-center text-cyan-500 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Engine...</td></tr>
                ) : tournaments.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center text-slate-500 font-bold tracking-widest uppercase">No active events found.</td></tr>
                ) : (
                  tournaments.map((t, idx) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 text-slate-600 font-black">#{t.id}</td>
                      <td className="p-4 font-bold text-white text-sm">{t.name}</td>
                      <td className="p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><Gamepad2 size={14} className="text-cyan-500"/> {t.game?.name}</div></td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${
                          t.status === 'registration_open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          t.status === 'ongoing' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-mono">
                          <span className={t.teams?.length === t.max_teams ? "text-emerald-400" : "text-white"}>{t.teams?.length || 0}</span>
                          <span className="text-slate-600">/ {t.max_teams}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right flex justify-end gap-2">
                        <Link href={`/tournament/${t.id}`} className="text-cyan-500 hover:text-cyan-400 bg-cyan-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="Go to Arena"><ExternalLink size={16} /></Link>
                        <button onClick={() => openEdit(t)} className="text-amber-500 hover:text-amber-400 bg-amber-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-amber-500/30" title="Edit Settings"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(t.id, t.name)} className="text-red-500/80 hover:text-red-400 bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/30"><Trash2 size={16} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing Page {meta.current_page} of {meta.last_page}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 rounded-lg bg-black/50 border border-white/10 text-white disabled:opacity-30"><ChevronLeft size={16}/></button>
                <button onClick={() => setPage(page + 1)} disabled={page === meta.last_page} className="p-2 rounded-lg bg-black/50 border border-white/10 text-white disabled:opacity-30"><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
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

        {/* MODAL EDIT TOURNAMENT */}
        <AnimatePresence>
          {activeModal === "edit" && selectedTournament && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
                <button onClick={() => setActiveModal("none")} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={18}/></button>
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Override Config</h2>
                <p className="text-xs text-amber-500 font-bold uppercase mb-8 tracking-widest">#{selectedTournament.id} - Core Settings</p>
                
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Event Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors" required/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Force Status State</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-slate-300 text-sm outline-none focus:border-amber-500 transition-colors cursor-pointer">
                      <option value="registration_open">Registration Open</option>
                      <option value="ongoing">Ongoing (Locked)</option>
                      <option value="completed">Completed / Archive</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-2 ml-1 leading-relaxed">*Mengubah state secara manual dapat memaksa penutupan pendaftaran meskipun slot tim belum penuh.</p>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest py-4 rounded-xl text-xs shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-transform hover:scale-105">
                      {isSubmitting ? "Overriding..." : "Apply Override"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}