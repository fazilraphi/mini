import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Calendar, Video, Heart, Brain, Baby, Stethoscope } from "lucide-react";


export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F4FAFC] text-[#0F172A]">
      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-sky-600">
          <div className="w-7 h-7 bg-sky-600 rounded rotate-45" />
          HealthSync
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <NavLink to="#">Find Doctors</NavLink>
          <NavLink to="#">Specialties</NavLink>
          <NavLink to="#">How it Works</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <NavLink to="/login" className="text-sm">Login</NavLink>
          <NavLink to="/register" className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm">
            Sign Up
          </NavLink>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div className="space-y-6">

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Your Health, <br />
            <span className="text-sky-500">Reimagined</span> through <br /> HealthSync.
          </h1>
          <p className="text-gray-600 max-w-md">
            Connect with top-tier specialists instantly through our secure,
            frosted-glass interface. Professional care at your fingertips.
          </p>

          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 max-w-md">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              placeholder="Specialty, doctor, or condition"
              className="flex-1 outline-none text-sm"
            />
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm">
              Find a Doctor
            </button>
          </div>

          <p className="text-xs text-gray-500">Join 2,000+ verified specialists today</p>
        </div>

        <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl shadow-xl p-16 text-center text-white">
          <h3 className="text-2xl font-semibold tracking-widest">MODERN</h3>
          <p className="text-3xl font-bold mt-2">HEALTHCARE</p>
          <p className="text-xs opacity-70 mt-4">Minimal design • Safe • Secure</p>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-bold">Top Specialties</h2>
            <p className="text-sm text-gray-500">Expert care across 40+ medical fields</p>
          </div>
          <NavLink className="text-sky-500 text-sm">View all specialties →</NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Specialty icon={<Heart />} title="Cardiology" desc="Heart health experts" />
          <Specialty icon={<Stethoscope />} title="Dermatology" desc="Skin & aesthetic care" />
          <Specialty icon={<Baby />} title="Pediatrics" desc="Children’s healthcare" />
          <Specialty icon={<Brain />} title="Neurology" desc="Brain & nerve care" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-2">
            Getting expert medical advice is <span className="text-sky-500">simpler</span> than ever.
          </h2>
          <p className="text-gray-500 mb-14">Skip the waiting room. Experience seamless healthcare in three easy steps.</p>

          <div className="grid md:grid-cols-3 gap-10">
            <Step icon={<Search />} title="Choose a Specialist" />
            <Step icon={<Calendar />} title="Book a Slot" />
            <Step icon={<Video />} title="Start Consultation" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-14 text-center text-white">
          <h3 className="text-3xl font-bold">Ready to speak with a professional?</h3>
          <p className="text-sm opacity-80 mt-3">Join thousands of patients who have already switched to better healthcare.</p>
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => navigate('/register')} className="px-6 py-3 bg-sky-500 rounded-xl">Book First Visit</button>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="font-bold text-sky-600 mb-3">HealthSync</div>
            <p className="text-gray-500">Pioneering the future of digital healthcare.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Patient</h4>
            <ul className="space-y-2 text-gray-500">
              <li>Find Doctor</li>
              <li>Specialties</li>
              <li>Health Feed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Doctor</h4>
            <ul className="space-y-2 text-gray-500">
              <li>Join HealthSync</li>
              <li>Practitioner App</li>
              <li>Resources</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-gray-500">healthsync7721@gmail.com</p>

          </div>
        </div>
      </footer>
    </div>
  );
}

function Specialty({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
      <div className="w-12 h-12 bg-sky-100 text-sky-500 flex items-center justify-center rounded-xl mb-4">
        {icon}
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function Step({ icon, title }) {
  return (
    <div className="space-y-4">
      <div className="w-14 h-14 mx-auto bg-sky-100 text-sky-500 flex items-center justify-center rounded-xl">
        {icon}
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-500">Simple, fast, and secure healthcare access.</p>
    </div>
  );
}
