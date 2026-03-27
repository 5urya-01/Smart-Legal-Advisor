import 'regenerator-runtime/runtime'; // Required for speech recognition
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Plus, Menu, X, Users, History, LogOut, Trash2, ArrowLeft, Database, Mic, MicOff } from "lucide-react";
import { Link } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import InteractiveParticles from "../components/InteractiveParticles";
import ProfileModal from "../components/ProfileModal";

// --- TYPEWRITER COMPONENT ---
const TypewriterMarkdown = ({ content, scrollRef }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(content.slice(0, i));
      i += 4; 
      
      if (i > content.length) {
        setDisplayedText(content);
        clearInterval(interval);
      }
    }, 15); 

    return () => clearInterval(interval);
  }, [content]);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedText, scrollRef]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

const translations = {
  EN: { hub: "Legal AI Hub", workspace: "Workspace", placeholder: "Describe your legal situation...", newChat: "New Consultation", recent: "Recent", network: "Advocate Network", exit: "Exit to Home", aiGreeting: "Hello! I am your Smart Legal Advisor. How can I help you today?", analyzing: "Analyzing legal database..." },
  HI: { hub: "कानूनी एआई हब", workspace: "कार्यक्षेत्र", placeholder: "अपनी स्थिति बताएं...", newChat: "नई परामर्श", recent: "हालिया", network: "अधिवक्ता नेटवर्क", exit: "होम पर वापस जाएं", aiGreeting: "नमस्ते! मैं आपका कानूनी सलाहकार हूं।", analyzing: "कानूनी डेटाबेस का विश्लेषण किया जा रहा है..." },
  TE: { hub: "లీగల్ AI హబ్", workspace: "వర్క్‌స్పేస్", placeholder: "మీ చట్టపరమైన పరిస్థితిని వివరించండి...", newChat: "కొత్త సంప్రదింపులు", recent: "ఇటీవలి", network: "అడ్వకేట్ నెట్‌వర్క్", exit: "హోమ్‌కి వెళ్ళండి", aiGreeting: "నమస్కారం! నేను మీ స్మార్ట్ లీగల్ అడ్వైజర్.", analyzing: "న్యాయ డేటాబేస్‌ను విశ్లేషిస్తోంది..." }
};

export default function Dashboard({ lang, setLang, user, onLogout }) {
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [history, setHistory] = useState([]);
  const t = translations[lang] || translations.EN;
  const chatEndRef = useRef(null);

  // --- SPEECH RECOGNITION HOOKS ---
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem("sla_active_chat_id") || null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("sla_active_chat");
    return saved ? JSON.parse(saved).map(m => ({ ...m, isNew: false })) : [{ role: "ai", content: t.aiGreeting }];
  });

  useEffect(() => { fetchHistory(); }, [user]);

  useEffect(() => {
    const cleanMessages = messages.map(({ isNew, ...rest }) => rest);
    localStorage.setItem("sla_active_chat", JSON.stringify(cleanMessages));
    if (currentChatId) localStorage.setItem("sla_active_chat_id", currentChatId);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentChatId, isWaitingForAI]);

  // --- SYNC VOICE TRANSCRIPT WITH INPUT BOX ---
  useEffect(() => {
    if (listening) {
      setQuery(transcript);
    }
  }, [transcript, listening]);

  const fetchHistory = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`http://localhost:5000/api/get_history/${user.email}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error(err); }
  };

  // --- TOGGLE VOICE RECOGNITION ---
  const handleVoiceToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setQuery(""); // Clear the box when starting a new voice note
      // Map user language preference to browser speech codes
      const speechLang = lang === 'HI' ? 'hi-IN' : lang === 'TE' ? 'te-IN' : 'en-IN';
      SpeechRecognition.startListening({ continuous: true, language: speechLang });
    }
  };

  const handleSend = async () => {
    if (!query.trim() || isWaitingForAI) return;
    
    // Stop listening when the user hits send
    if (listening) SpeechRecognition.stopListening();
    
    const userMsg = { role: "user", content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setQuery("");
    resetTranscript(); // Clear out the voice memory
    setIsWaitingForAI(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, email: user.email, messages: updatedMessages }),
      });
      const data = await response.json();
      
      const finalMessages = response.ok 
        ? [...updatedMessages, { role: "ai", content: data.response, isNew: true }] 
        : [...updatedMessages, { role: "ai", content: "Error connecting to AI.", isNew: true }];
      
      setMessages(finalMessages);
      setIsWaitingForAI(false); 

      if (response.ok) {
        const messagesToSave = finalMessages.map(({ isNew, ...rest }) => rest);
        const saveRes = await fetch("http://localhost:5000/api/save_chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: currentChatId, email: user.email, messages: messagesToSave, timestamp: new Date().toISOString() })
        });
        const saveData = await saveRes.json();
        if (saveData.chat_id && !currentChatId) setCurrentChatId(saveData.chat_id);
        fetchHistory();
      }
    } catch (err) { 
      console.error(err); 
      setMessages([...updatedMessages, { role: "ai", content: "Error connecting to AI.", isNew: true }]);
      setIsWaitingForAI(false);
    } 
  };

  const handleNewConsultation = () => {
    setMessages([{ role: "ai", content: t.aiGreeting }]);
    setCurrentChatId(null);
    localStorage.removeItem("sla_active_chat_id");
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    await fetch(`http://localhost:5000/api/delete_chat/${id}`, { method: "DELETE" });
    if (currentChatId === id) handleNewConsultation();
    else fetchHistory();
  };

  return (
    <div className="relative h-[100dvh] w-full flex overflow-hidden text-slate-900 font-sans bg-slate-50 select-none">
      <InteractiveParticles />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        lang={lang} 
        setLang={setLang} 
        clearChat={() => setIsClearConfirmOpen(true)} 
        user={user} 
        onLogout={onLogout} 
      />

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 m-4 md:m-6 h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] flex flex-col bg-white/60 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-xl transform transition-transform duration-500 ${isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"} md:relative md:translate-x-0`}>
        <div className="p-8 shrink-0">
          <div className="flex items-center gap-3 mb-10 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">SL</div>
              <h1 className="text-l font-black uppercase tracking-tighter">Smart Legal Advisor</h1>
            </div>
          </div>
          <button onClick={handleNewConsultation} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl py-4 shadow-xl active:scale-95">
            <Plus size={20} /> <span className="font-bold text-xs uppercase tracking-widest">{t.newChat}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">{t.workspace}</p>
            <nav className="space-y-1">
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 text-slate-900 shadow-sm border border-white"><MessageSquare size={18} /><span className="text-sm font-bold">AI Chat Hub</span></Link>
              <Link to="/advocates" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold"><Users size={18} /><span>{t.network}</span></Link>
            </nav>
          </div>
          <div className="pb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">{t.recent}</p>
            <div className="space-y-1 px-2">
              {history.map(item => (
                <div key={item._id} className="relative group w-full flex items-center">
                  <button onClick={() => { setMessages(item.messages.map(m => ({ ...m, isNew: false }))); setCurrentChatId(item._id); }} className="flex-1 px-4 py-3 rounded-xl hover:bg-white/80 text-left transition-all">
                    <span className="text-sm font-semibold block truncate text-slate-800">{item.title}</span>
                  </button>
                  <Trash2 onClick={(e) => deleteHistoryItem(item._id, e)} size={14} className="absolute right-2 opacity-0 group-hover:opacity-100 text-red-400 cursor-pointer"/>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-slate-200/50">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:text-slate-900 transition-all">
            <ArrowLeft size={18}/> {t.exit}
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-[100dvh] relative z-10 md:py-6 md:pr-6 w-full">
        <header className="bg-white/85 backdrop-blur-3xl border border-white rounded-3xl shadow-sm px-6 py-4 flex items-center justify-between mx-4 md:mx-0">
          <div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(true)} className="md:hidden"><Menu size={18}/></button><p className="text-sm font-bold">{t.hub}</p></div>
          <div onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 cursor-pointer">
            <div className="text-right leading-none hidden md:block"><p className="text-xs font-bold">{user?.name}</p><p className="text-[9px] text-slate-500">Settings</p></div>
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">{user?.name?.charAt(0)}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-6 py-4 rounded-[2rem] shadow-sm max-w-[85%] text-sm md:text-base ${msg.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-white/90 border border-white text-slate-900 font-semibold rounded-tl-none"}`}>
                   {msg.role === "ai" && msg.isNew ? (
                     <TypewriterMarkdown content={msg.content} scrollRef={chatEndRef} />
                   ) : (
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                   )}
                </div>
              </motion.div>
            ))}

            {isWaitingForAI && (
              <motion.div key="loader" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex justify-start">
                <div className="px-6 py-4 rounded-[2rem] shadow-sm max-w-[85%] bg-white/90 border border-white rounded-tl-none flex items-center gap-4">
                  <Database size={16} className="text-blue-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-500 bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-transparent animate-pulse">{t.analyzing}</span>
                  <div className="flex gap-1 ml-1">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 md:px-0 md:pb-4">
          <div className="max-w-4xl mx-auto bg-white/85 backdrop-blur-3xl border border-white shadow-xl rounded-full p-2 flex items-center gap-3">
            
            {/* --- VOICE INPUT BUTTON --- */}
            {browserSupportsSpeechRecognition && (
              <button 
                onClick={handleVoiceToggle} 
                className={`p-3 rounded-full transition-all flex items-center justify-center ml-2 ${listening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                title={listening ? "Stop recording" : "Use Voice"}
              >
                {listening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}

            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && handleSend()} 
              placeholder={listening ? "Listening..." : t.placeholder} 
              className="flex-1 bg-transparent border-none outline-none font-bold text-sm md:text-base px-2 md:px-4" 
            />
            <button 
              onClick={handleSend} 
              disabled={isWaitingForAI || (!query.trim() && !listening)} 
              className="p-4 bg-slate-900 text-white rounded-full active:scale-90 disabled:opacity-50"
            >
              <Send size={20}/>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}