"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Trophy, Gamepad2, ExternalLink, Shield, LogOut, ShieldAlert, Menu, X } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Authorized Personnel");
  const [isOpen, setIsOpen] = useState(false); // State untuk Mobile Menu

  useEffect(() => {
    setAdminName(localStorage.getItem("admin_name") || "Authorized Personnel");
  }, []);

  // Trik cerdas: Tutup sidebar di HP setiap kali user berpindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        await fetch("${baseUrl}/api/logout", {
          method: "POST", headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) { console.error("API Logout Failed"); }
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    router.push("/admin/login");
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Events', path: '/admin/tournaments', icon: Trophy },
    { name: 'Global Teams', path: '/admin/teams', icon: Shield },
    { name: 'Manage Staff', path: '/admin/users', icon: Users },
    { name: 'Master Games', path: '/admin/games', icon: Gamepad2 },
  ];

  return (
    <>
      {/* MOBILE TOP NAVIGATION (Hanya muncul di layar HP / md:hidden) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-20 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <ShieldAlert className="text-black" size={18} />
          </div>
          <h2 className="text-white font-black text-xl tracking-widest">LEOVINIA</h2>
        </div>
        <button onClick={() => setIsOpen(true)} className="text-white p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* OVERLAY GELAP (Muncul saat menu HP terbuka) */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* MAIN SIDEBAR (Bergeser masuk/keluar di HP, Fix di PC) */}
      <div className={`w-72 md:w-64 bg-[#0a0a0c] border-r border-white/5 h-screen flex flex-col justify-between fixed left-0 top-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        <div>
          <div className="p-8 pb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <ShieldAlert className="text-black" size={18} />
                </div>
                <h2 className="text-white font-black text-xl tracking-widest">LEOVINIA</h2>
              </div>
              <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] ml-11">Command HQ</p>
            </div>
            {/* Tombol Tutup Sidebar khusus HP */}
            <button onClick={() => setIsOpen(false)} className="md:hidden text-white/50 hover:text-white p-2 bg-white/5 rounded-full"><X size={16} /></button>
          </div>

          <nav className="px-4 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm tracking-wide ${isActive ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_2px_0_0_0_#06b6d4]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-500"} /> {item.name}
                </Link>
              );
            })}
            <div className="pt-6 mt-6 border-t border-white/5">
              <Link href="/" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 font-bold text-sm tracking-wide">
                <ExternalLink size={18} className="text-slate-500" /> Public Arena
              </Link>
            </div>
          </nav>
        </div>

        <div className="p-4 bg-[#111113] border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-black/40 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full min-w-[2rem] bg-cyan-900/50 flex items-center justify-center text-cyan-400 font-black text-xs uppercase border border-cyan-500/30">
              {adminName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-black mt-0.5">Active Session</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 font-bold text-sm tracking-wide group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Terminate Session
          </button>
        </div>

      </div>
    </>
  );
}