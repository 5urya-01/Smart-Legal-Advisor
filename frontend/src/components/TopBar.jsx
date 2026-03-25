import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] rounded-full px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-slate-800">
          Legal Advisor
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/advocates" className="text-slate-700 font-medium hover:text-blue-600 transition-colors">
            Find an Advocate
          </Link>
          <Link to="/dashboard" className="text-slate-700 font-medium hover:text-blue-600 transition-colors">
            AI Consultation
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-700 font-medium hover:text-blue-600 transition-colors px-4 py-2">
            Log In
          </Link>
          <Link to="/login" className="bg-slate-900 text-white font-medium px-6 py-2 rounded-full hover:bg-blue-600 transition-colors shadow-md">
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
}