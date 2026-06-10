"use client";

import { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { Plus, Trash2, Gamepad2, X, CheckCircle2, Layers, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr"; 

// 1. STRICT TYPESCRIPT INTERFACES
interface GameSystem { 
  id: number; 
  name: string; 
  available_roles: string[]; 
}

interface PaginatedResponse {
  data: GameSystem[];
  links: any;
  meta: { current_page: number; last_page: number; total: number; };
  success: boolean;
}

// 2. FETCHING STRATEGY (SWR Fetcher)
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MasterGames() {
  const [page, setPage] = useState(1);
  const { data: responseData, error, isLoading, mutate } = useSWR<PaginatedResponse>(
    `http://127.0.0.1:8000/api/games?page=${page}`, 
    fetcher
  );

  const games = responseData?.data || [];

  // States UI Modal & Form
  const [activeModal, setActiveModal] = useState<"none" | "create" | "edit">("none");
  const [selectedGame, setSelectedGame] = useState<GameSystem | null>(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [gameName, setGameName] = useState("");
  const [roles, setRoles] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: "" }), 3000); };

  const addRoleInput = () => setRoles([...roles, ""]);
  const removeRoleInput = (index: number) => { if (roles.length > 1) setRoles(roles.filter((_, i) => i !== index)); };
  const handleRoleChange = (index: number, value: string) => {
    const newRoles = [...roles];
    newRoles[index] = value;
    setRoles(newRoles);
  };

  // Buka form untuk tambah data
  const openCreate = () => {
    setGameName("");
    setRoles([""]);
    setActiveModal("create");
  };

  // Buka form untuk edit data lama
  const openEdit = (game: GameSystem) => {
    setSelectedGame(game);
    setGameName(game.name);
    setRoles([...game.available_roles]);
    setActiveModal("edit");
  };

  // Submit Handler (Bisa POST untuk Create, PUT untuk Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const filteredRoles = roles.filter(r => r.trim() !== "");

    try {
      const token = localStorage.getItem("admin_token");
      const url = activeModal === "create" ? "http://127.0.0.1:8000/api/games" : `http://127.0.0.1:8000/api/games/${selectedGame?.id}`;
      const method = activeModal === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: gameName, available_roles: filteredRoles })
      });
      const result = await res.json();
      
      if (result.success) {
        showToast(result.message);
        setActiveModal("none");
        mutate(); // SWR command: Refresh data
      } else { alert("Gagal: " + result.message); }
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteGame = async (id: number) => {
    if (!confirm("Hapus sistem game ini? Ini akan berdampak fatal jika ada turnamen berjalan yang menggunakan game ini!")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://127.0.0.1:8000/api/games/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) { 
        showToast(result.message); 
        mutate(); 
      }
    } catch (err) { alert("Gagal menghapus game"); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans flex">
      <AdminSidebar />
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={18} className="inline mr-2"/> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KODE RESPONSIVE ADA DI BARIS BAWAH INI (md:ml-64 pt-28 md:pt-10) */}
      <div className="flex-1 md:ml-64 pt-28 md:pt-10 p-5 md:p-10 max-w-[1600px] w-full overflow-x-hidden">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Master Games</h1>
            <p className="text-cyan-500 font-bold uppercase text-xs tracking-widest">SaaS Engine Matrix</p>
          </div>
          <button onClick={openCreate} className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-transform hover:scale-105">
            <Plus size={18} /> Deploy New Game
          </button>
        </header>

        <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/50 border-b border-white/5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <th className="p-5 pl-6 w-16 text-center">ID</th>
                  <th className="p-5">Game Title</th>
                  <th className="p-5">Available Roster Roles</th>
                  <th className="p-5 pr-6 w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-cyan-500 animate-pulse font-bold tracking-widest uppercase">Syncing System Matrix...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="p-10 text-center text-red-500 font-bold tracking-widest uppercase">Failed to load data</td></tr>
                ) : games.length === 0 ? (
                  <tr><td colSpan={4} className="p-16 text-center text-slate-500 font-bold tracking-widest uppercase">No games registered.</td></tr>
                ) : (
                  games.map((g, idx) => (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-5 pl-6 text-center text-slate-600 font-black">#{g.id}</td>
                      <td className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20"><Gamepad2 size={18}/></div><span className="font-black text-white text-base tracking-wide">{g.name}</span></div></td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-2">
                          {g.available_roles.map((role: string, rIdx: number) => (
                            <span key={rIdx} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-slate-300 font-bold uppercase tracking-wider">{role}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 pr-6 text-right flex justify-end gap-2">
                        <button onClick={() => openEdit(g)} className="text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 p-2.5 rounded-xl transition-all border border-transparent hover:border-amber-500/30" title="Edit Game"><Edit3 size={16} /></button>
                        <button onClick={() => handleDeleteGame(g.id)} className="text-red-500/50 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-500/30" title="Delete Game"><Trash2 size={16} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {responseData?.meta && responseData.meta.last_page > 1 && (
             <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
               <span>Page {responseData.meta.current_page} of {responseData.meta.last_page}</span>
               <div className="flex gap-2">
                 <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 rounded-lg bg-black/50 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10"><ChevronLeft size={16}/></button>
                 <button onClick={() => setPage(page + 1)} disabled={page === responseData.meta.last_page} className="p-2 rounded-lg bg-black/50 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10"><ChevronRight size={16}/></button>
               </div>
             </div>
          )}
        </div>

        {/* MODAL FORM (Gabungan CREATE dan EDIT) */}
        <AnimatePresence>
          {activeModal !== "none" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl my-8">
               <button onClick={() => setActiveModal("none")} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={18}/></button>
               
               <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">
                 {activeModal === "create" ? "New Game Engine" : "Edit Game Matrix"}
               </h2>
               <p className={`text-xs font-bold uppercase mb-8 tracking-widest ${activeModal === "create" ? "text-cyan-500" : "text-amber-500"}`}>
                 {activeModal === "create" ? "Inject Matrix Data" : "Override System Config"}
               </p>

               <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Game Name</label>
                   <input type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="Misal: Free Fire" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500 transition-colors" required/>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between items-center ml-1">
                     <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Roster Roles Structure</label>
                     <button type="button" onClick={addRoleInput} className="text-xs text-cyan-400 flex items-center gap-1 font-bold hover:text-cyan-300">
                       <Plus size={14}/> Add Row
                     </button>
                   </div>

                   <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                     {roles.map((role, index) => (
                       <div key={index} className="flex gap-2 items-center">
                         <input type="text" value={role} onChange={(e) => handleRoleChange(index, e.target.value)} placeholder={`Role #${index + 1}`} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors" required/>
                         {roles.length > 1 && (
                           <button type="button" onClick={() => removeRoleInput(index)} className="text-red-500/50 hover:text-red-400 p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl transition-colors">
                             <X size={14} />
                           </button>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>

                 <button type="submit" disabled={isSubmitting} className={`w-full text-black font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 transition-colors mt-8 shadow-lg ${activeModal === "create" ? "bg-cyan-500 hover:bg-cyan-400" : "bg-amber-500 hover:bg-amber-400"}`}>
                   {isSubmitting ? "Processing..." : (activeModal === "create" ? <><Layers size={18}/> Inject Game</> : <><Edit3 size={18}/> Save Config</>)}
                 </button>
               </form>
             </motion.div>
           </motion.div>
          )}
        </AnimatePresence>
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
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}} />
    </div>
  );
}