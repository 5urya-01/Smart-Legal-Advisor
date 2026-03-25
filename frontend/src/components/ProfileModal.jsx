import { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Trash2, LogOut } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, lang, setLang, clearChat, user, onLogout }) {
  const [tempLang, setTempLang] = useState(lang);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setTempLang(lang);
  }, [isOpen, lang]);

  const translations = {
    EN: { title: "Settings", name: "Full Name", lang: "Language", clear: "Clear History", logout: "Logout Profile", save: "Save & Close", saving: "Saving..." },
    HI: { title: "सेटिंग्स", name: "पूरा नाम", lang: "भाषा", clear: "इतिहास मिटाएं", logout: "लॉगआउट", save: "सहेजें और बंद करें", saving: "सहेजा जा रहा है..." },
    TE: { title: "సెట్టింగ్స్", name: "పూర్తి పేరు", lang: "భాష", clear: "చరిత్రను తొలగించు", logout: "లాగ్ అవుట్", save: "సేవ్ చేసి ముగించు", saving: "సేవ్ అవుతోంది..." }
  };

  const localT = translations[tempLang] || translations.EN;

  const handleSave = async () => {
    if (!user?.email) return;
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, lang: tempLang }),
      });

      if (res.ok) {
        setLang(tempLang); 
        const savedUser = JSON.parse(localStorage.getItem('sla_user') || '{}');
        savedUser.lang = tempLang;
        localStorage.setItem('sla_user', JSON.stringify(savedUser));
        onClose();
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-8 shadow-2xl z-[101]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">{localT.title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/40 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              {/* User Identity Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{localT.name}</label>
                <div className="relative font-sans">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" readOnly value={user?.name || "Guest"} className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold cursor-default text-slate-800" />
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{localT.lang}</label>
                <div className="flex bg-slate-900/5 p-1 rounded-2xl border border-white/40">
                  {['EN', 'HI', 'TE'].map((l) => (
                    <button 
                      key={l} 
                      onClick={() => setTempLang(l)} 
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${tempLang === l ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & System Actions */}
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { clearChat(); onClose(); }}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={14} /> {localT.clear}
                  </button>
                  
                  {/* --- THE LOGOUT BUTTON IN PROFILE MODAL --- */}
                  <button 
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-900/10 bg-slate-900/5 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                  >
                    <LogOut size={14} /> {localT.logout}
                  </button>
                </div>
                
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSaving ? localT.saving : localT.save}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}