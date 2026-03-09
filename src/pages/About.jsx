import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, CheckCircle2, Target, Eye } from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-[#EAF0F4] text-[#0F172A] min-h-screen">
      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-sky-600">
          <div className="w-7 h-7 bg-sky-600 rounded rotate-45" />
          HealthSync
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <NavLink to="/" className="hover:text-sky-500 transition-colors font-medium">Home</NavLink>
          <NavLink to="#" className="hover:text-sky-500 transition-colors font-medium">Find Doctors</NavLink>
          <NavLink to="#" className="hover:text-sky-500 transition-colors font-medium">Specialties</NavLink>
          <NavLink to="/about" className="hover:text-sky-500 transition-colors font-medium text-sky-600">About</NavLink>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/login" className="text-sm font-semibold hover:text-sky-500">Login</NavLink>
          <NavLink to="/register" className="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all">
            Sign Up
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-2xl p-6 flex flex-col gap-4 md:hidden animate-fadeIn rounded-b-3xl mx-2">
            <NavLink to="/" className="text-gray-700 font-bold py-3 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="#" className="text-gray-700 font-bold py-3 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>Find Doctors</NavLink>
            <NavLink to="#" className="text-gray-700 font-bold py-3 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>Specialties</NavLink>
            <NavLink to="/about" className="text-sky-600 font-bold py-3 border-b border-gray-50" onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <div className="flex flex-col gap-3 mt-4">
              <NavLink to="/login" className="text-center py-4 text-gray-700 font-extrabold border-2 border-gray-100 rounded-2xl" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="text-center py-4 bg-sky-500 text-white font-extrabold rounded-2xl shadow-lg shadow-sky-100" onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          Modern Healthcare
          <span className="block text-sky-500 mt-2">Powered by HealthSync</span>
        </h1>

        <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-xl leading-relaxed font-medium">
          HealthSync connects patients with verified healthcare professionals
          through a modern digital platform designed to simplify medical
          workflows and enhance patient care.
        </p>
      </section>


      {/* MISSION + VISION */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20 grid md:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white group">
          <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Target size={28} />
          </div>
          <h2 className="text-2xl font-black mb-4 text-gray-900 uppercase tracking-tighter">
            Our Mission
          </h2>
          <p className="text-gray-500 leading-relaxed font-medium">
            Our mission is to simplify healthcare access by providing a secure,
            intuitive platform where patients can easily connect with
            qualified doctors while healthcare professionals manage their
            consultations efficiently.
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white group">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Eye size={28} />
          </div>
          <h2 className="text-2xl font-black mb-4 text-gray-900 uppercase tracking-tighter">
            Our Vision
          </h2>
          <p className="text-gray-500 leading-relaxed font-medium">
            We envision a future where healthcare is more accessible,
            technology-driven, and patient-centered — empowering both doctors
            and patients with smarter digital tools.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
        <h2 className="text-2xl md:text-4xl font-black text-center mb-14 text-gray-900 tracking-tight uppercase">
          What HealthSync Provides
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: "Digital Records",
              desc: "Secure storage for medical histories, prescriptions, and visit data."
            },
            {
              title: "Smart Booking",
              desc: "Patients can easily schedule consultations with verified specialists."
            },
            {
              title: "Seamless Collab",
              desc: "Streamlined workflows designed for efficient medical care."
            },
            {
              title: "Unified Portal",
              desc: "Personalized interfaces for doctors, patients, and administrators."
            },
            {
              title: "Modern Security",
              desc: "Built with secure authentication and protected healthcare data access."
            },
            {
              title: "Future Ready",
              desc: "An architecture that grows with hospitals and healthcare networks."
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/50 backdrop-blur-sm p-7 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100/50 flex gap-4"
            >
              <div className="shrink-0 pt-1">
                <CheckCircle2 className="text-sky-500 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-white py-16 md:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black mb-6 text-gray-900 uppercase tracking-tighter">
            Join HealthSync Today
          </h2>

          <p className="text-gray-500 mb-10 text-base md:text-lg font-medium leading-relaxed">
            Whether you are a patient seeking expert care or a doctor looking to
            streamline consultations, HealthSync provides a modern healthcare
            experience.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="bg-sky-500 hover:bg-sky-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-sky-100 transition-all hover:scale-105">
            Get Started Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-4 gap-10 text-sm">
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
};

export default About;
