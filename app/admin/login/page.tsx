"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, KeyRound, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // PERBAIKAN DI SINI: Menggunakan backtick ( ` ) bukan kutip dua ( " )
      const response = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // SIMPAN KARTU AKSES (TOKEN) KE BROWSER
        localStorage.setItem("admin_token", result.token);
        localStorage.setItem("admin_name", result.data.name);
        
        // Alihkan kembali ke markas (Lobby)
        router.push("/admin/dashboard");
      } else {
        setError(result.message || "Gagal melakukan autentikasi");
      }
    } catch (err) {
      setError("Server tidak merespons. Pastikan backend menyala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-900/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 text-white/40 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors z-20">
        <ArrowLeft size={16} /> Kembali ke Arena
      </Link>

      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          
          {/* Efek Garis Menyala di Atas Card */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500" />

          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 rounded-2xl border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <ShieldAlert className="text-cyan-400" size={32} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Restricted Area</h1>
            <p className="text-cyan-500 text-xs font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-4 rounded-xl mb-6 text-center uppercase tracking-wider">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin Email" className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-cyan-500 transition-colors" required />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passcode" className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-cyan-500 transition-colors" required />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 transition-all mt-8 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              {isLoading ? "Authenticating..." : <><ArrowRight size={20} /> Override Core</>}
            </button>
          </form>
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
      </motion.div>
    </motion.div>
  );
}