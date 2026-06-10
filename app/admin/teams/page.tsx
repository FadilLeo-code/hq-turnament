"use client";

import { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { Search, Filter, Trash2, X, CheckCircle2, ChevronLeft, ChevronRight, Edit3, Eye, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import Link from "next/link";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Player { id: number; in_game_name: string; default_role: string; }
interface Team { id: number; name: string; logo_url: string; created_at: string; players: Player[]; }
interface PaginatedResponse { data: Team[]; meta: { current_page: number; last_page: number; total: number; per_page: number; }; success: boolean; }

const fetcher = (url: string) => fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } }).then((res) => res.json());

export default function ManageTeams() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const apiUrl = `${baseUrl}/api/teams?page=${page}&search=${search}&sort=${sortCol}&direction=${sortDir}`;
  const { data: responseData, error, isLoading, mutate } = useSWR<PaginatedResponse>(apiUrl, fetcher, { keepPreviousData: true });

  const teams = responseData?.data || [];
  const meta = responseData?.meta;

  const [toast, setToast] = useState({ show: false, message: "" });
  const [activeModal, setActiveModal] = useState<"none" | "edit" | "detail">("none");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: "" }), 3000); };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const openEdit = (t: Team) => { setSelectedTeam(t); setEditName(t.name); setEditLogo(t.logo_url); setActiveModal("edit"); };
  const openDetail = (t: Team) => { setSelectedTeam(t); setActiveModal("detail"); };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/teams/${selectedTeam.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({ name: editName, logo_url: editLogo })
      });
      const result = await res.json();
      if (result.success) { showToast(result.message); setActiveModal("none"); mutate(); }
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus permanen tim "${name}" beserta profil para pemainnya? Data yang dihapus tidak dapat dikembalikan.`)) return;
    try {
      const res = await fetch(`${baseUrl}/api/teams/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }});
      const result = await res.json();
      if (result.success) { showToast(result.message); mutate(); }
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
          <span>/</span><span className="text-white">Global Teams Database</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Teams & Roster</h1>
          <p className="text-cyan-500 font-bold uppercase text-xs tracking-widest">Global Participant Records</p>
        </header>

        <div className="bg-[#111113] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={search} onChange={(e) => {setSearch(e.target.value); setPage(1);}} placeholder="Search team name..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-4 pl-6 w-16">ID</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Team Profile {sortCol === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="p-4 text-center">Roster Size</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('created_at')}>Registered Date {sortCol === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-16 text-center text-cyan-500 text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Roster Database...</td></tr>
                ) : teams.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-slate-500 font-bold tracking-widest uppercase">No teams found.</td></tr>
                ) : (
                  teams.map((t, idx) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 text-slate-600 font-black">#{t.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img src={t.logo_url} alt="logo" className="w-10 h-10 rounded-xl bg-black border border-white/10 object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150/000000/06b6d4?text=LOGO'; }} />
                          <span className="font-bold text-white text-base">{t.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg font-mono font-bold">{t.players?.length || 0} Players</span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 font-mono">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 pr-6 text-right flex justify-end gap-2">
                        <button onClick={() => openDetail(t)} className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-emerald-500/30" title="View Roster"><Eye size={16} /></button>
                        <button onClick={() => openEdit(t)} className="text-amber-500 hover:text-amber-400 bg-amber-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-amber-500/30" title="Edit Profile"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(t.id, t.name)} className="text-red-500/80 hover:text-red-400 bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/30" title="Delete Team"><Trash2 size={16} /></button>
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

        {/* MODAL CONTROLLER */}
        <AnimatePresence>
          {activeModal !== "none" && selectedTeam && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
              
              {/* 1. EDIT MODAL */}
              {activeModal === "edit" && (
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
                  <button onClick={() => setActiveModal("none")} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full"><X size={18}/></button>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Edit Team Profile</h2>
                  <p className="text-xs text-amber-500 font-bold uppercase mb-8 tracking-widest">Update Master Data</p>
                  <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Team Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-amber-500" required/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Logo Image URL</label>
                      <input type="url" value={editLogo} onChange={(e) => setEditLogo(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-amber-500" required/>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4">
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* 2. DETAIL ROSTER MODAL */}
              {activeModal === "detail" && (
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-2xl relative shadow-2xl">
                  <button onClick={() => setActiveModal("none")} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full"><X size={18}/></button>
                  
                  <div className="flex items-center gap-6 mb-10 border-b border-white/5 pb-8">
                    <img src={selectedTeam.logo_url} alt="Logo" className="w-24 h-24 rounded-2xl bg-black border border-white/10 object-cover shadow-[0_0_30px_rgba(255,255,255,0.05)]"/>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-wider">{selectedTeam.name}</h2>
                      <p className="text-cyan-500 font-bold uppercase tracking-widest text-xs mt-2">Official Verified Roster</p>
                    </div>
                  </div>

                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Shield size={14}/> Active Players ({selectedTeam.players?.length})</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeam.players?.map((p, i) => (
                      <div key={p.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:border-cyan-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 font-black flex items-center justify-center border border-cyan-500/20">{i+1}</div>
                        <div>
                          <p className="text-white font-bold">{p.in_game_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.default_role}</p>
                        </div>
                      </div>
                    ))}
                    {(!selectedTeam.players || selectedTeam.players.length === 0) && (
                      <div className="col-span-2 text-center p-8 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-widest">No players registered</div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}