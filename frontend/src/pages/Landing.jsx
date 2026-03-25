// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, Users, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import InteractiveParticles from '../components/InteractiveParticles';

const content = {
  EN: { 
    title: "Smart Legal Advisor", 
    subtitle: "Revolutionizing justice with high-precision AI and an elite advocate network.", 
    cta1: "Launch AI Hub", 
    cta2: "Explore Network" 
  },
  HI: { 
    title: "स्मार्ट कानूनी सलाहकार", 
    subtitle: "एआई और विशिष्ट अधिवक्ताओं के माध्यम से न्याय का लोकतंत्रीकरण।", 
    cta1: "एआई हब", 
    cta2: "नेटवर्क देखें" 
  },
  TE: { 
    title: "స్మార్ట్ లీగల్ అడ్వైజర్", 
    subtitle: "అధునాతన AI మరియు ధృవీకరించబడిన అడ్వకేట్ నెట్‌వర్క్ మీ కోసం.", 
    cta1: "AI హబ్", 
    cta2: "నెట్‌వర్క్ చూడండి" 
  }
};

const TiltCard = ({ to, icon: Icon, title, cta, colorClass }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link to={to} className="perspective-1000 block h-full cursor-default z-10">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d",
          willChange: "transform" 
        }}
        // FIX: Scaled down min-height and padding for mobile screens
        className="relative group bg-white/70 backdrop-blur-3xl border border-white/80 p-5 md:p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-shadow duration-500 h-full flex flex-col min-h-[160px] md:min-h-[220px]"
      >
        <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="flex flex-col h-full">
          {/* FIX: Smaller icons and bottom margins on mobile */}
          <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 ${colorClass} rounded-xl lg:rounded-2xl flex items-center justify-center text-white mb-3 md:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          
          <h3 className="text-lg md:text-xl lg:text-3xl font-black text-slate-900 mb-1 md:mb-2 tracking-tight">
            {title}
          </h3>
          
          <div className="mt-auto flex items-center gap-2 text-blue-600 font-black text-[10px] md:text-xs lg:text-sm uppercase tracking-widest">
            {cta} <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function Landing({ lang }) {
  const t = content[lang] || content.EN;

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden bg-slate-50 select-none">
      
      <InteractiveParticles />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <motion.h1 
          animate={{ opacity: [0.02, 0.05, 0.02] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="text-[25vw] font-black text-slate-900 leading-none uppercase tracking-tighter"
        >
          LEGAL
        </motion.h1>
      </div>

      <div className="relative z-10 text-center max-w-5xl w-full flex flex-col items-center justify-center mt-[-2rem] md:mt-0">
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 md:px-5 rounded-full bg-slate-900 text-white mb-4 lg:mb-8 shadow-2xl"
        >
          <Zap size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
            Next-Gen Legal Ecosystem
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="text-4xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 mb-3 lg:mb-6 tracking-tighter leading-[1.05] md:leading-[0.95]"
        >
          {t.title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4, duration: 1 }}
          // FIX: Reduced bottom margin drastically on mobile to give cards room to breathe
          className="text-sm md:text-xl lg:text-2xl text-slate-500 mb-6 md:mb-10 lg:mb-12 font-medium max-w-2xl mx-auto leading-relaxed px-2"
        >
          {t.subtitle}
        </motion.p>

        {/* FIX: Switched from gap-4 to gap-3 on mobile to tighten up vertical space */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-8 w-full max-w-4xl mx-auto px-2 md:px-4">
          <TiltCard 
            to="/auth" 
            icon={MessageSquare} 
            title={t.cta1} 
            cta="Enter AI Hub" 
            colorClass="bg-slate-900" 
          />
          <TiltCard 
            to="/advocates" 
            icon={Users} 
            title={t.cta2} 
            cta="View Network" 
            colorClass="bg-blue-600" 
          />
        </div>
      </div>

      <footer className="absolute bottom-4 md:bottom-6 flex flex-col items-center gap-2 md:gap-3 z-10">
        <div className="h-1 w-8 md:w-10 bg-slate-200 rounded-full" />
        <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.6em] text-center px-4">
          Intelligent • Secure • Accessible • © 2026
        </p>
      </footer>
    </div>
  );
}