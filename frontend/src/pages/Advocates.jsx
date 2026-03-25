// src/pages/Advocates.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Menu, 
  X, 
  MessageSquare, 
  Users, 
  LogOut, 
  ChevronRight,
  Filter
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import InteractiveParticles from "../components/InteractiveParticles";
import ProfileModal from "../components/ProfileModal";

const advocateData = [
  { 
    id: 1, 
    name: "Adv. K. Srinivas", 
    specialty: "Civil Law", 
    location: "Visakhapatnam", 
    experience: "18 years",
    email: "k.srinivas@legalhub.in",
    phone: "+91 94401 87234"
  },
  { 
    id: 2, 
    name: "Adv. M. Lakshmi", 
    specialty: "Family Law", 
    location: "Vijayawada", 
    experience: "12 years",
    email: "m.lakshmi@legalhub.in",
    phone: "+91 98480 54192"
  },
  { 
    id: 3, 
    name: "Adv. P. Venkat", 
    specialty: "Corporate Law", 
    location: "Guntur", 
    experience: "8 years",
    email: "p.venkat@legalhub.in",
    phone: "+91 99887 12566"
  },
  { 
    id: 4, 
    name: "Adv. S. Ramesh", 
    specialty: "Criminal Law", 
    location: "Tirupati", 
    experience: "22 years",
    email: "s.ramesh@legalhub.in",
    phone: "+91 91234 89012"
  },
  { 
    id: 5, 
    name: "Adv. B. Anitha", 
    specialty: "Property Law", 
    location: "Kurnool", 
    experience: "15 years",
    email: "b.anitha@legalhub.in",
    phone: "+91 94411 76345"
  },
  { 
    id: 6, 
    name: "Adv. V. Karthik", 
    specialty: "Cyber Law", 
    location: "Nellore", 
    experience: "6 years",
    email: "v.karthik@legalhub.in",
    phone: "+91 97000 43981"
  },
  { 
    id: 7, 
    name: "Adv. G. Suresh", 
    specialty: "Taxation Law", 
    location: "Rajahmundry", 
    experience: "25 years",
    email: "g.suresh@legalhub.in",
    phone: "+91 99001 28475"
  },
  { 
    id: 8, 
    name: "Adv. N. Divya", 
    specialty: "Intellectual Property", 
    location: "Kakinada", 
    experience: "9 years",
    email: "n.divya@legalhub.in",
    phone: "+91 98499 61023"
  },
  { 
    id: 9, 
    name: "Adv. R. Prakash", 
    specialty: "Labor Law", 
    location: "Anantapur", 
    experience: "14 years",
    email: "r.prakash@legalhub.in",
    phone: "+91 95533 82140"
  },
  { 
    id: 10, 
    name: "Adv. T. Sujatha", 
    specialty: "Constitutional Law", 
    location: "Eluru", 
    experience: "19 years",
    email: "t.sujatha@legalhub.in",
    phone: "+91 93900 57382"
  },
  { 
    id: 11, 
    name: "Adv. D. Ravi", 
    specialty: "Criminal Law", 
    location: "Kadapa", 
    experience: "11 years",
    email: "d.ravi@legalhub.in",
    phone: "+91 90102 94756"
  },
  { 
    id: 12, 
    name: "Adv. Y. Pavani", 
    specialty: "Corporate Law", 
    location: "Ongole", 
    experience: "7 years",
    email: "y.pavani@legalhub.in",
    phone: "+91 99665 38291"
  }
];

export default function Advocates({ lang, setLang, user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const filteredAdvocates = advocateData.filter(adv => 
    adv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    adv.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adv.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="relative h-[100dvh] w-full flex overflow-hidden text-slate-900 font-sans bg-slate-50 select-none">
      
      {/* 1. Background Ecosystem */}
      <InteractiveParticles />

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} lang={lang} setLang={setLang} />

      {/* 2. Unified Glass Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 m-4 md:m-6 h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] flex flex-col bg-white/60 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] transform transition-transform duration-500 ease-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"} md:relative md:translate-x-0`}>
        <div className="p-6 md:p-8 shrink-0">
          <div className="flex items-center gap-3 mb-10 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">SL</div>
              <h1 className="text-xl font-black tracking-tighter uppercase text-slate-900">Smart Legal</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-white/80 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Workspace</p>
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-all font-bold text-sm">
              <MessageSquare size={18} /> AI Chat Hub
            </Link>
            <Link to="/advocates" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === "/advocates" ? "bg-white/80 text-slate-900 shadow-md border border-white/80" : "text-slate-500 hover:text-slate-900"} font-bold text-sm`}>
              <Users size={18} /> Advocate Network
            </Link>
          </nav>
        </div>

        <div className="p-4 mt-auto border-t border-slate-200/50">
          <button onClick={() => onLogout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm">
            <LogOut size={18} /> Exit to Home
          </button>
        </div>
      </aside>

      {/* 3. Main Network Hub */}
      <main className="flex-1 flex flex-col h-[100dvh] relative z-10 md:py-6 md:pr-6 w-full">
        
        {/* Header */}
        <header className="shrink-0 m-2 md:m-0 mb-6 z-20">
          <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-800 p-2 bg-white/80 rounded-xl border border-white"><Menu size={18} /></button>
              <div className="flex items-center gap-2">
                <span className="hidden xs:block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Network</span>
                <ChevronRight size={10} className="hidden xs:block text-slate-400" />
                <p className="text-sm font-bold text-slate-800 tracking-tight">Verified Advocates</p>
              </div>
            </div>
            <div onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block leading-none">
                <p className="text-xs font-bold text-slate-800">{user?.name || "Guest User"}</p>
                <p className="text-[9px] text-slate-500 font-medium tracking-tighter uppercase">Settings</p>
              </div>
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-slate-900 border border-white/50 shadow-lg flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform">
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* 4. Glass Search Pill */}
        <div className="px-4 md:px-0 mt-2 mb-8 w-full flex justify-center shrink-0 z-20">
          <div className="w-full max-w-2xl bg-white/85 backdrop-blur-3xl border border-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] rounded-full p-2 flex items-center gap-3">
            <div className="pl-4 text-slate-400"><Search size={18} /></div>
            <input 
              type="text" 
              placeholder="Search by name, city, or specialty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 font-bold placeholder-slate-400 px-2 text-sm md:text-base"
            />
            <button className="p-3 md:p-4 bg-slate-900 text-white rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-95">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* 5. Clean Data Cards Grid - ADDED md:pr-6 lg:pr-8 to prevent scrollbar collision */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0 md:pr-6 lg:pr-8 pb-10 scroll-smooth z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAdvocates.map((adv) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={adv.id} 
                  className="bg-white/85 backdrop-blur-3xl border border-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                      {adv.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 md:mb-6 tracking-tighter">{adv.name}</h3>

                  <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-xs md:text-sm text-slate-600">
                    <p><span className="font-bold text-slate-900">Specialty:</span> {adv.specialty}</p>
                    <p><span className="font-bold text-slate-900">Location:</span> {adv.location}</p>
                    <p><span className="font-bold text-slate-900">Experience:</span> {adv.experience}</p>
                  </div>

                  <div className="mt-auto pt-4 md:pt-6 border-t border-slate-200/60 space-y-1 md:space-y-2 text-xs md:text-sm">
                    <p className="truncate"><span className="font-bold text-slate-900">Email:</span> <a href={`mailto:${adv.email}`} className="text-blue-600 hover:underline">{adv.email}</a></p>
                    <p><span className="font-bold text-slate-900">Phone:</span> <a href={`tel:${adv.phone}`} className="text-blue-600 hover:underline">{adv.phone}</a></p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}