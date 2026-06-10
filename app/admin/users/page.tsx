"use client";

import { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { Plus, Trash2, Search, Filter, Download, User, X, CheckCircle2, ChevronLeft, ChevronRight, Eye, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

interface Staff { id: number; name: string; email: string; status: string; created_at: string; avatar_url: string; }
interface PaginatedResponse { data: Staff[]; meta: { current_page: number; last_page: number; total: number; per_page: number; }; success: boolean; }

const fetcher = (url: string) => fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } }).then((res) => res.json());

export default function ManageStaff() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const apiUrl = `http://127.0.0.1:8000/api/users?page=${page}&search=${search}&sort=${sortCol}&direction=${sortDir}`;
  const { data: responseData, error, isLoading, mutate } = useSWR<PaginatedResponse>(apiUrl, fetcher, { keepPreviousData: true });

  const users = responseData?.data || [];
  const meta = responseData?.meta;

  const [toast, setToast] = useState({ show: false, message: "" });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Modal States
  const [activeModal, setActiveModal] = useState<"none" | "create" | "edit" | "detail">("none");
  const [selectedUser, setSelectedUser] = useState<Staff | null>(null);

  // Form States (Bisa untuk Create dan Edit)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "referee" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: "" }), 3000); };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u.id));
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} personnel?`)) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({ ids: selectedIds })
      });
      const result = await res.json();
      if (result.success) { showToast(result.message); setSelectedIds([]); mutate(); }
    } catch (err) { alert("Bulk delete failed"); }
  };

  // --- FUNGSI PEMBUKA MODAL ---
  const openDetail = (user: Staff) => { setSelectedUser(user); setActiveModal("detail"); };
  
  const openCreate = () => {
    setFormData({ name: "", email: "", password: "", role: "referee" });
    setActiveModal("create");
  };

  const openEdit = (user: Staff) => {
    setSelectedUser(user);
    // Kosongkan password saat diedit. Kalau tidak diisi, backend tidak akan mengubahnya.
    setFormData({ name: user.name, email: user.email, password: "", role: "referee" }); 
    setActiveModal("edit");
  };

  // --- FUNGSI SUBMIT (Gabungan POST dan PUT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = activeModal === "create" ? "http://127.0.0.1:8000/api/users" : `http://127.0.0.1:8000/api/users/${selectedUser?.id}`;
      const method = activeModal === "create" ? "POST" : "PUT";
      
      const payload: any = { name: formData.name, email: formData.email, role: formData.role };
      // Hanya kirim password jika form tidak kosong
      if (formData.password.trim() !== "") {
          payload.password = formData.password;
      }

      const res = await fetch(url, {
        method: method, 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        showToast(result.message);
        setActiveModal("none");
        mutate();
      } else { alert("Error: Pastikan email tidak duplikat."); }
    } finally { setIsSubmitting(false); }
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
          <span className="hover:text-cyan-500 cursor-pointer transition-colors">Dashboard</span>
          <span>/</span><span className="text-white">Manage Personnel</span>
        </nav>

        <header className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Personnel Roster</h1>
            <p className="text-cyan-500 font-bold uppercase text-xs tracking-widest">Leovinia HQ Internal Data</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-[#111113] hover:bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-colors">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={openCreate} className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-transform hover:scale-105">
              <Plus size={16} /> Add Personnel
            </button>
          </div>
        </header>

        <div className="bg-[#111113] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
          <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-cyan-500 uppercase">{selectedIds.length} Selected</span>
                    <button onClick={handleBulkDelete} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors">
                      <Trash2 size={14}/> Bulk Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" value={search} onChange={(e) => {setSearch(e.target.value); setPage(1);}} placeholder="Search by name or email..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-4 pl-6 w-12"><input type="checkbox" checked={selectedIds.length === users.length && users.length > 0} onChange={toggleSelectAll} className="accent-cyan-500 w-4 h-4 cursor-pointer rounded bg-black border-white/20"/></th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Personnel Name {sortCol === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('email')}>Contact ID {sortCol === 'email' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('created_at')}>Registered On {sortCol === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-16 text-center text-cyan-500 text-xs font-bold tracking-widest animate-pulse">Syncing Database...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center text-slate-500 font-bold tracking-widest uppercase">No personnel records found.</td></tr>
                ) : (
                  users.map((u, idx) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} className="accent-cyan-500 w-4 h-4 cursor-pointer rounded bg-black border-white/20"/></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar_url} alt="avatar" className="w-8 h-8 rounded-full bg-slate-800" />
                          <span className="font-bold text-white text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-mono">{u.email}</td>
                      <td className="p-4"><span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{u.status}</span></td>
                      <td className="p-4 text-xs text-slate-500 font-mono">{u.created_at}</td>
                      <td className="p-4 pr-6 text-right flex justify-end gap-2">
                        <button onClick={() => openDetail(u)} className="text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-cyan-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-amber-400 bg-white/5 hover:bg-amber-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-amber-500/30" title="Edit Personnel"><Edit3 size={16} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
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

        {/* --- AREA MODAL --- */}
        <AnimatePresence>
          {activeModal !== "none" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
              
              {/* 1. DETAIL MODAL (Tetap sama seperti sebelumnya) */}
              {activeModal === "detail" && selectedUser && (
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] w-full max-w-2xl relative shadow-2xl overflow-hidden my-8">
                  <div className="h-32 bg-gradient-to-r from-cyan-900/40 to-emerald-900/20 relative">
                    <button onClick={() => setActiveModal("none")} className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md transition-colors"><X size={18}/></button>
                  </div>
                  <div className="px-10 pb-10 relative">
                    <img src={selectedUser.avatar_url} className="w-24 h-24 rounded-2xl bg-black border-4 border-[#111113] absolute -top-12 shadow-xl" />
                    <div className="flex justify-between items-end pt-14 mb-8 border-b border-white/5 pb-6">
                      <div>
                        <h2 className="text-2xl font-black text-white">{selectedUser.name}</h2>
                        <p className="text-cyan-500 font-mono text-sm">{selectedUser.email}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">{selectedUser.status}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. CREATE / EDIT FORM MODAL */}
              {(activeModal === "create" || activeModal === "edit") && (
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
                  <button onClick={() => setActiveModal("none")} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={18}/></button>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">
                    {activeModal === "create" ? "New Personnel" : "Edit Personnel"}
                  </h2>
                  <p className={`text-xs font-bold uppercase mb-8 tracking-widest ${activeModal === "create" ? "text-cyan-500" : "text-amber-500"}`}>
                    {activeModal === "create" ? "System Access Grant" : "Update Account Details"}
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500" required/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Email Address *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500" required/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">
                        {activeModal === "create" ? "Access Password *" : "New Password (Optional)"}
                      </label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={activeModal === "edit" ? "Biarkan kosong jika tidak ingin mengubah" : ""} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500" required={activeModal === "create"} minLength={6}/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Assign Role *</label>
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-slate-300 text-sm outline-none focus:border-cyan-500 cursor-pointer">
                        <option value="referee">Referee</option>
                        <option value="admin">Tournament Admin</option>
                      </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setActiveModal("none")} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-xl text-xs transition-colors">Cancel</button>
                      <button type="submit" disabled={isSubmitting} className={`flex-1 font-black uppercase tracking-widest py-4 rounded-xl text-xs shadow-lg transition-transform hover:scale-105 text-black disabled:opacity-50 disabled:scale-100 ${activeModal === "create" ? "bg-cyan-500 hover:bg-cyan-400" : "bg-amber-500 hover:bg-amber-400"}`}>
                        {isSubmitting ? "Saving..." : "Save Record"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}