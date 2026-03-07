import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#EAF0F4] text-[#0F172A]">
      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-sky-600">
          <div className="w-7 h-7 bg-sky-600 rounded rotate-45" />
          HealthSync
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <NavLink to="/">Home</NavLink>
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
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Modern Healthcare
          <span className="block text-[#2F9AD7]">Powered by HealthSync</span>
        </h1>

        <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
          HealthSync connects patients with verified healthcare professionals
          through a modern digital platform designed to simplify medical
          workflows and enhance patient care.
        </p>

      </section>


      {/* MISSION + VISION */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-10">

        <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold mb-4 text-[#0F172A]">
            Our Mission
          </h2>

          <p className="text-gray-600 leading-relaxed">
            Our mission is to simplify healthcare access by providing a secure,
            intuitive platform where patients can easily connect with
            qualified doctors while healthcare professionals manage their
            consultations efficiently.
          </p>
        </div>


        <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold mb-4 text-[#0F172A]">
            Our Vision
          </h2>

          <p className="text-gray-600 leading-relaxed">
            We envision a future where healthcare is more accessible,
            technology-driven, and patient-centered — empowering both doctors
            and patients with smarter digital tools.
          </p>
        </div>

      </section>


      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-24">

        <h2 className="text-3xl font-bold text-center mb-14">
          What HealthSync Provides
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {[
            {
              title: "Digital Patient Records",
              desc: "Secure and organized storage for medical histories, prescriptions, and visit data."
            },
            {
              title: "Smart Appointment Booking",
              desc: "Patients can easily schedule consultations with verified specialists."
            },
            {
              title: "Doctor–Patient Collaboration",
              desc: "Streamlined consultation workflows designed for efficient medical care."
            },
            {
              title: "Role-Based Dashboards",
              desc: "Personalized interfaces for doctors, patients, and administrators."
            },
            {
              title: "Data Privacy & Security",
              desc: "Built with secure authentication and protected healthcare data access."
            },
            {
              title: "Scalable System Design",
              desc: "An architecture that grows with hospitals, clinics, and healthcare networks."
            }
          ].map((item, i) => (

            <div
              key={i}
              className="bg-white p-7 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100"
            >

              <h3 className="text-lg font-semibold mb-3 text-[#0F172A]">
                {item.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* CTA SECTION */}
      <section className="bg-white py-20 text-[#0F172A] text-center">

        <h2 className="text-3xl font-bold mb-4">
          Join HealthSync Today
        </h2>

        <p className="max-w-2xl mx-auto text-gray-500 mb-8">
          Whether you are a patient seeking expert care or a doctor looking to
          streamline consultations, HealthSync provides a modern healthcare
          experience.
        </p>

        <button
          onClick={() => navigate('/register')}
          className="bg-[#2F9AD7] hover:bg-[#2386BE] px-6 py-3 rounded-lg font-medium">
          Get Started
        </button>

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
};

export default About;