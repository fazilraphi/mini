import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Calendar, Video, Heart, Brain, Baby, Stethoscope, Menu, X } from "lucide-react";


export default function Home() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-[#F4FAFC] text-[#0F172A] min-h-screen">
      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between relative z-50 bg-[#F4FAFC]">
        <div className="flex items-center gap-2 font-bold text-xl text-sky-600">
          <div className="w-7 h-7 bg-sky-600 rounded rotate-45" />
          HealthSync
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <NavLink to="/" className="hover:text-sky-500 transition-colors">Home</NavLink>
          <NavLink to="#" className="hover:text-sky-500 transition-colors">Find Doctors</NavLink>
          <NavLink to="#" className="hover:text-sky-500 transition-colors">Specialties</NavLink>
          <NavLink to="/about" className="hover:text-sky-500 transition-colors">About</NavLink>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/login" className="text-sm font-medium hover:text-sky-500">Login</NavLink>
          <NavLink to="/register" className="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100">
            Sign Up
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-xl p-6 flex flex-col gap-4 md:hidden animate-fadeIn">
            <NavLink to="/" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="#" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>Find Doctors</NavLink>
            <NavLink to="#" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>Specialties</NavLink>
            <NavLink to="/about" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <div className="flex flex-col gap-3 mt-2">
              <NavLink to="/login" className="text-center py-3 text-gray-700 font-semibold border border-gray-200 rounded-xl" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="text-center py-3 bg-sky-500 text-white font-semibold rounded-xl" onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="space-y-6 text-center md:text-left">

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Your Health, <br className="hidden sm:block" />
            <span className="text-sky-500">Reimagined</span> through <br className="hidden sm:block" /> HealthSync.
          </h1>
          <p className="text-gray-600 max-w-md mx-auto md:mx-0 text-sm md:text-base">
            Connect with top-tier specialists instantly through our secure,
            frosted-glass interface. Professional care at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 max-w-md mx-auto md:mx-0">
            <div className="flex items-center gap-3 px-3 py-2 flex-1">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                placeholder="Specialty or doctor"
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-all">
              Find a Doctor
            </button>
          </div>

          <p className="text-xs text-gray-500 font-medium">Join 2,000+ verified specialists today</p>
        </div>

        <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl shadow-2xl p-8 md:p-16 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full -ml-16 -mb-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />

          <h3 className="text-xl md:text-2xl font-semibold tracking-widest relative z-10">MODERN</h3>
          <p className="text-2xl md:text-4xl font-black mt-2 relative z-10">HEALTHCARE</p>
          <div className="w-12 h-1 bg-sky-400 mx-auto mt-6 mb-4 rounded-full" />
          <p className="text-xs font-semibold opacity-80 mt-4 uppercase tracking-tighter relative z-10">Minimal design • Safe • Secure</p>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mb-10">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Specialties</h2>
            <p className="text-sm text-gray-500 mt-1">Expert care across 40+ medical fields</p>
          </div>
          <NavLink className="text-sky-500 text-sm font-bold hover:underline">View all specialties →</NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Specialty icon={<Heart />} title="Cardiology" desc="Heart health experts" />
          <Specialty icon={<Stethoscope />} title="Dermatology" desc="Skin & aesthetic care" />
          <Specialty icon={<Baby />} title="Pediatrics" desc="Children’s healthcare" />
          <Specialty icon={<Brain />} title="Neurology" desc="Brain & nerve care" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 max-w-2xl mx-auto leading-tight">
            Getting expert medical advice is <span className="text-sky-500">simpler</span> than ever.
          </h2>
          <p className="text-gray-500 mb-14 text-sm md:text-base max-w-xl mx-auto">Skip the waiting room. Experience seamless healthcare in three easy steps.</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            <Step icon={<Search />} title="Choose a Specialist" />
            <Step icon={<Calendar />} title="Book a Slot" />
            <Step icon={<Video />} title="Start Consultation" className="sm:col-span-2 md:col-span-1" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h3 className="text-2xl md:text-4xl font-bold relative z-10">Ready to speak with a professional?</h3>
          <p className="text-sm md:text-base opacity-70 mt-4 relative z-10 max-w-lg mx-auto">Join thousands of patients who have already switched to better healthcare.</p>
          <div className="flex justify-center mt-10 relative z-10">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-sky-500 rounded-2xl font-bold text-lg hover:bg-sky-600 hover:scale-105 transition-all shadow-xl shadow-sky-500/20"
            >
              Book First Visit
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-sm text-center md:text-left">
          <div className="col-span-2 md:col-span-1">
            <div className="font-extrabold text-sky-600 mb-4 text-lg">HealthSync</div>
            <p className="text-gray-500 max-w-xs mx-auto md:mx-0">Pioneering the future of digital healthcare with modern solutions.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900">Patient</h4>
            <ul className="space-y-3 text-gray-500">
              <li className="hover:text-sky-500 cursor-pointer">Find Doctor</li>
              <li className="hover:text-sky-500 cursor-pointer">Specialties</li>
              <li className="hover:text-sky-500 cursor-pointer">Health Feed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900">Doctor</h4>
            <ul className="space-y-3 text-gray-500">
              <li className="hover:text-sky-500 cursor-pointer">Join HealthSync</li>
              <li className="hover:text-sky-500 cursor-pointer">Practitioner App</li>
              <li className="hover:text-sky-500 cursor-pointer">Resources</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-6 md:pt-0">
            <h4 className="font-bold mb-4 text-gray-900">Contact</h4>
            <p className="text-gray-500 font-medium">healthsync7721@gmail.com</p>
            <div className="flex justify-center md:justify-start gap-4 mt-4">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-50 text-center text-xs text-gray-400">
          © 2026 HealthSync. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Specialty({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="w-14 h-14 bg-sky-50 text-sky-500 flex items-center justify-center rounded-2xl mb-5 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ icon, title, className = "" }) {
  return (
    <div className={`space-y-5 p-6 rounded-2xl transition-colors hover:bg-gray-50 ${className}`}>
      <div className="w-16 h-16 mx-auto bg-sky-50 text-sky-500 flex items-center justify-center rounded-2xl shadow-inner">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">Simple, fast, and secure healthcare access in minutes.</p>
      </div>
    </div>
  );
}
