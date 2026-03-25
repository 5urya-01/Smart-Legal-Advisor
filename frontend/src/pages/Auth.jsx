import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import InteractiveParticles from "../components/InteractiveParticles";

export default function Auth({ setUser, setLang }) {
  const [view, setView] = useState("login"); // "login", "signup", "forgot"
  const [step, setStep] = useState(1); // 1: Input details, 2: Enter OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('sla_user');
    if (savedUser) navigate("/dashboard");
  }, [navigate]);

  const handleRequestOtp = async (endpoint) => {
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    // Initial OTP Requests
    if (step === 1 && view === "signup") return handleRequestOtp("request_signup_otp");
    if (step === 1 && view === "forgot") return handleRequestOtp("forgot_password");

    // Final Submissions (Step 2 or Login)
    const endpointMap = { login: 'login', signup: 'signup', forgot: 'reset_password' };
    const payload = view === "login" ? { email, password } 
                  : view === "signup" ? { name, email, password, otp }
                  : { email, otp, new_password: password };

    try {
      const response = await fetch(`http://localhost:5000/api/${endpointMap[view]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (view === "login") {
        localStorage.setItem('sla_user', JSON.stringify(data));
        setUser(data); navigate("/dashboard");
      } else {
        alert("Success! Please log in.");
        setView("login"); setStep(1); setPassword("");
      }
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#FAF9F6] p-4">
      <InteractiveParticles />
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 z-20"><ArrowLeft size={18}/> Back to Home</Link>
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div layout className="bg-white/85 backdrop-blur-3xl border p-10 rounded-[3rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-4">SL</div>
            <h1 className="text-2xl font-black uppercase">{view === "forgot" ? "Reset" : "Smart Legal"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === "signup" && step === 1 && (
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" required placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/50 border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold"/></div>
            )}
            <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} disabled={step === 2} className="w-full bg-white/50 border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold disabled:opacity-50"/></div>
            
            {step === 2 && (
              <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" required placeholder="6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-white/50 border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold tracking-widest" maxLength={6}/></div>
            )}
            
            {(view !== "forgot" || step === 2) && (
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="password" required placeholder={view === "forgot" ? "New Password" : "Password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/50 border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold"/></div>
            )}

            {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl active:scale-95">
              {isLoading ? "Wait..." : (step === 1 && view !== "login" ? "Send OTP" : "Continue")} <ArrowRight size={18}/>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => { setView(view === "login" ? "signup" : "login"); setStep(1); setError(""); }} className="text-sm font-bold text-slate-500 hover:text-slate-900">
              {view === "login" ? "Create an account" : "Back to Login"}
            </button>
            {view === "login" && <p><button onClick={() => { setView("forgot"); setStep(1); }} className="text-xs font-bold text-slate-400 mt-2">Forgot Password?</button></p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}