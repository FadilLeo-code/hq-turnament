"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Trophy, X, Save, ArrowLeft, Shuffle, CheckCircle2, Crown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Tournament { id: number; name: string; status: string; max_teams: number; game: any; matches: any[]; teams: any[]; }

export default function TournamentArena() {
  const params = useParams();
  const id = params.id;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bracket"); 
  
  // States
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [teamName, setTeamName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [formPlayers, setFormPlayers] = useState([{ in_game_name: "", role: "" }, { in_game_name: "", role: "" }, { in_game_name: "", role: "" }, { in_game_name: "", role: "" }, { in_game_name: "", role: "" }]);

  const showToast = (message: string) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: "" }), 3000); };

  const fetchBracketData = () => {
    fetch(`http://127.0.0.1:8000/api/tournaments/${id}/bracket`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTournament(data.data);
          try {
            const roles = typeof data.data.game.available_roles === 'string' ? JSON.parse(data.data.game.available_roles) : data.data.game.available_roles;
            setFormPlayers(roles.map((r: string) => ({ in_game_name: "", role: r })));
          } catch(e) {}
        }
        setLoading(false);
      });
  };

  useEffect(() => { if(id) fetchBracketData(); }, [id]);

  const handleGenerateBracket = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`http://127.0.0.1:8000/api/tournaments/${id}/generate-bracket`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) { showToast(result.message); fetchBracketData(); }
      else alert(result.message);
    } finally { setIsSubmitting(false); }
  };

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/teams/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament_id: id, name: teamName, logo_url: logoUrl, players: formPlayers })
      });
      const result = await response.json();
      if (result.success) { showToast(result.message); setTeamName(""); setLogoUrl(""); fetchBracketData(); setActiveTab("teams"); }
      else alert(result.message);
    } finally { setIsSubmitting(false); }
  };

  const handleSaveScore = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`http://127.0.0.1:8000/api/matches/${selectedMatch.id}/score`, {
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score_team1: score1, score_team2: score2 })
      });
      const result = await response.json();
      if (result.success) { setSelectedMatch(null); fetchBracketData(); showToast("Skor Disahkan!"); }
      else alert(result.message);
    } finally { setIsSubmitting(false); }
  };

  if (loading || !tournament) return <div className="min-h-screen bg-[#050505] flex justify-center items-center text-cyan-500 font-black tracking-widest animate-pulse">Initializing Arena...</div>;

  const roles = typeof tournament.game.available_roles === 'string' ? JSON.parse(tournament.game.available_roles) : tournament.game.available_roles;
  const isRegistrationFull = tournament.teams.length >= tournament.max_teams;

  const rounds = Array.from(new Set(tournament.matches.map(m => m.round_number))).sort((a,b) => a - b);
  const totalRounds = rounds.length > 0 ? Math.max(...rounds) : 0;
  
  const getRoundName = (roundNum: number) => {
    if (roundNum === totalRounds) return "Grand Final";
    if (roundNum === totalRounds - 1) return "Semi Final";
    if (roundNum === totalRounds - 2) return "Quarter Final";
    return `Round of ${Math.pow(2, (totalRounds - roundNum + 1))}`;
  };

  return (
    // Penambahan Grid Background Pattern agar terasa lebih "Cyber"
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} 
      className="min-h-screen bg-[#09090b] text-slate-200 font-sans p-6 md:p-12 overflow-x-hidden bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
      
      {/* Glow Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={18}/> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-10 flex flex-col md:flex-row md:items-center gap-6 relative z-10">
        <Link href="/" className="bg-white/5 border border-white/10 p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all shadow-lg backdrop-blur-sm"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">{tournament.name}</h1>
          <div className="flex gap-3 mt-2 text-xs font-bold uppercase tracking-widest">
            <span className="text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md">{tournament.game?.name}</span>
            <span className={`px-2 py-1 rounded-md ${tournament.status === 'registration_open' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {tournament.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 mb-10 bg-white/5 w-fit p-1.5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10 shadow-xl">
        <button onClick={() => setActiveTab("bracket")} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === "bracket" ? "bg-white/10 text-white shadow-md" : "text-white/40 hover:text-white/80"}`}>Arena</button>
        <button onClick={() => setActiveTab("teams")} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === "teams" ? "bg-white/10 text-white shadow-md" : "text-white/40 hover:text-white/80"}`}>Teams ({tournament.teams.length}/{tournament.max_teams})</button>
        {tournament.status === 'registration_open' && <button onClick={() => setActiveTab("register")} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors`}>+ Register</button>}
      </nav>

      {/* TAB ARENA */}
      {activeTab === "bracket" && (
        <div className="relative z-10">
          {tournament.status === 'registration_open' ? (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-sm">
              <Shuffle size={64} className="text-cyan-500/30 mb-6 drop-shadow-lg" />
              <h2 className="text-3xl font-black text-white mb-3">Menunggu Challenger</h2>
              <p className="text-white/40 text-sm mb-10 font-medium">Slot terisi: {tournament.teams.length} / {tournament.max_teams} Tim</p>
              
              {isRegistrationFull ? (
                <button onClick={handleGenerateBracket} disabled={isSubmitting} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black uppercase tracking-widest px-10 py-5 rounded-2xl flex items-center gap-3 transition-transform hover:scale-105 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                  {isSubmitting ? "Processing Engine..." : <><Shuffle size={24}/> Auto-Generate Bracket</>}
                </button>
              ) : (
                <div className="px-8 py-4 bg-black/50 rounded-2xl text-white/30 text-xs font-bold uppercase tracking-widest border border-white/5 shadow-inner">
                  Pendaftaran Masih Dibuka
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex gap-12 overflow-x-auto pb-12 pt-4 items-center custom-scrollbar">
              {rounds.map((roundNum, roundIdx) => {
                const isGrandFinal = roundNum === totalRounds;
                return (
                  <motion.div key={roundNum} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: roundIdx * 0.15 }} className="flex flex-col gap-8 shrink-0 justify-around min-h-[500px]">
                    
                    <div className="text-center">
                      <h3 className={`text-xs font-black uppercase tracking-[0.3em] ${isGrandFinal ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-slate-500'}`}>
                        {getRoundName(roundNum)}
                      </h3>
                    </div>

                    {tournament.matches.filter(m => m.round_number === roundNum).map((m, matchIdx) => {
                      const isMatchDone = m.status === 'completed';
                      const isT1Winner = isMatchDone && m.score_team1 > m.score_team2;
                      const isT2Winner = isMatchDone && m.score_team2 > m.score_team1;

                      return (
                        <motion.div 
                          key={m.id} 
                          whileHover={{ scale: 1.02, y: -2 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
                          onClick={() => { if(m.team1 && m.team2) { setSelectedMatch(m); setScore1(m.score_team1); setScore2(m.score_team2); }}} 
                          className={`w-[320px] rounded-2xl bg-[#111113] border shadow-xl cursor-pointer relative overflow-hidden transition-colors ${
                            isGrandFinal ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 
                            (isMatchDone ? 'border-slate-700/80' : 'border-white/10 hover:border-cyan-500/50')
                          }`}
                        >
                          {/* Label Status Match */}
                          {isGrandFinal && <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest px-4 py-1 rounded-b-lg z-20"><Crown size={10} className="inline mb-0.5 mr-1"/> Final</div>}

                          <div className="flex flex-col relative z-10">
                            {/* Baris Tim 1 */}
                            <div className={`flex items-center justify-between p-4 border-b border-white/5 transition-all ${isT1Winner ? 'bg-gradient-to-r from-emerald-500/20 to-transparent' : ''} ${isMatchDone && !isT1Winner ? 'opacity-40 grayscale' : ''}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex-shrink-0 overflow-hidden p-0.5">
                                  {m.team1?.logo_url ? <img src={m.team1.logo_url} alt="t1" className="w-full h-full object-cover rounded-full"/> : <div className="w-full h-full bg-slate-800 rounded-full"/>}
                                </div>
                                <span className={`font-bold truncate max-w-[160px] text-sm ${isT1Winner ? 'text-white' : 'text-slate-300'}`}>{m.team1?.name || "TBD"}</span>
                              </div>
                              <span className={`text-lg font-black ${isT1Winner ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-500'}`}>{m.score_team1}</span>
                            </div>

                            {/* Baris Tim 2 */}
                            <div className={`flex items-center justify-between p-4 transition-all ${isT2Winner ? 'bg-gradient-to-r from-emerald-500/20 to-transparent' : ''} ${isMatchDone && !isT2Winner ? 'opacity-40 grayscale' : ''}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex-shrink-0 overflow-hidden p-0.5">
                                  {m.team2?.logo_url ? <img src={m.team2.logo_url} alt="t2" className="w-full h-full object-cover rounded-full"/> : <div className="w-full h-full bg-slate-800 rounded-full"/>}
                                </div>
                                <span className={`font-bold truncate max-w-[160px] text-sm ${isT2Winner ? 'text-white' : 'text-slate-300'}`}>{m.team2?.name || "TBD"}</span>
                              </div>
                              <span className={`text-lg font-black ${isT2Winner ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-500'}`}>{m.score_team2}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB TEAMS (Sisa tab tidak saya ubah logika dasarnya, hanya sedikit styling) */}
      {activeTab === "teams" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {tournament.teams.map((t, idx) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-[#111113] border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:border-cyan-500/30 transition-colors">
              <img src={t.logo_url} alt="logo" className="w-14 h-14 rounded-xl bg-black/50 p-1 border border-white/5" />
              <div>
                <h3 className="font-black text-white text-base leading-tight mb-1">{t.name}</h3>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-cyan-500 font-bold uppercase tracking-wider">Seed #{t.pivot?.seed_number || '?'}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      

      {/* TAB REGISTER */}
      {activeTab === "register" && tournament.status === 'registration_open' && (
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleRegisterTeam} className="relative z-10 max-w-xl mx-auto bg-[#111113] border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8">Daftarkan Roster</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Nama Tim</label>
              <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Misal: EVOS Legends" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500 transition-colors" required/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">URL Logo (Avatar)</label>
              <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500 transition-colors" required/>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest ml-1 block">Susunan Pemain ({tournament.game.name})</label>
            {formPlayers.map((p, idx) => (
              <div key={idx} className="flex gap-3 items-center bg-black/40 p-2 rounded-xl border border-white/5">
                <div className="bg-white/5 text-white/30 text-xs font-black w-8 h-8 flex items-center justify-center rounded-lg">{idx+1}</div>
                <input type="text" value={p.in_game_name} onChange={(e) => { const newP = [...formPlayers]; newP[idx].in_game_name = e.target.value; setFormPlayers(newP); }} placeholder={`In-Game Name`} className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" required/>
                <select value={p.role} onChange={(e) => { const newP = [...formPlayers]; newP[idx].role = e.target.value; setFormPlayers(newP); }} className="w-1/3 bg-[#111113] border border-white/10 rounded-lg px-2 py-2 text-xs text-slate-300 outline-none cursor-pointer">
                  {roles.map((r: string) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button type="submit" disabled={isSubmitting || isRegistrationFull} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black uppercase tracking-widest py-4.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg mt-6">{isRegistrationFull ? "Slot Telah Penuh" : "Kirim Formulir Roster"}</button>
        </motion.form>
      )}

      {/* MODAL UPDATE SCORE */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm relative shadow-2xl">
              <button onClick={() => setSelectedMatch(null)} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={18}/></button>
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-1">Input Skor</h2>
              <p className="text-xs text-cyan-500 font-bold uppercase mb-8">{getRoundName(selectedMatch.round_number)}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-black/50 border border-white/5 p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={selectedMatch.team1?.logo_url || '/placeholder.png'} className="w-10 h-10 rounded-full bg-slate-800" />
                    <span className="font-bold text-white text-sm truncate max-w-[110px]">{selectedMatch.team1?.name || "TBD"}</span>
                  </div>
                  <input type="number" value={score1} onChange={(e) => setScore1(Number(e.target.value))} className="w-16 h-12 bg-[#1a1a1e] border border-white/10 rounded-xl text-center font-black text-white text-xl focus:border-cyan-500 outline-none transition-colors"/>
                </div>

                <div className="flex justify-center text-slate-600 font-black text-xs uppercase">VS</div>

                <div className="flex justify-between items-center bg-black/50 border border-white/5 p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={selectedMatch.team2?.logo_url || '/placeholder.png'} className="w-10 h-10 rounded-full bg-slate-800" />
                    <span className="font-bold text-white text-sm truncate max-w-[110px]">{selectedMatch.team2?.name || "TBD"}</span>
                  </div>
                  <input type="number" value={score2} onChange={(e) => setScore2(Number(e.target.value))} className="w-16 h-12 bg-[#1a1a1e] border border-white/10 rounded-xl text-center font-black text-white text-xl focus:border-cyan-500 outline-none transition-colors"/>
                </div>
              </div>

              <button onClick={handleSaveScore} disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"><Save size={18}/> Sahkan Hasil Match</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }`}} />
    </motion.div>
  );
}