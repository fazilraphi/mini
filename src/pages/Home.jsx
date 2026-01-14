import React from "react";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-[#F7F7F7] text-[#141414]">
      
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-6">
          <span className="uppercase tracking-widest text-sm text-orange-500 font-medium">
            Primary Healthcare Management System
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Smart. Secure. <br />
            <span className="text-orange-500">Patient-centric</span> care delivery.
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            A modern healthcare platform designed to simplify appointments,
            records, and workflows for clinics, doctors, and patients.
          </p>

          <div className="flex justify-center gap-4 pt-6">
            <NavLink
              to="/login"
              className="px-7 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
            >
              Get Started
            </NavLink>

            <NavLink
              to="/about"
              className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-white transition font-medium"
            >
              Learn More
            </NavLink>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {[
            {
              title: "Centralized Records",
              desc: "Securely manage patient data, history, prescriptions, and visits from one unified system."
            },
            {
              title: "Smart Scheduling",
              desc: "Reduce waiting times with intelligent appointment booking and availability management."
            },
            {
              title: "Staff Management",
              desc: "Organize doctors, nurses, and staff with clear roles, schedules, and workflows."
            },
            {
              title: "Secure Platform",
              desc: "Privacy-focused architecture ensuring compliance with healthcare data standards."
            }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to modernize your clinic?
          </h2>
          <p className="text-gray-600">
            Join a growing system designed for real healthcare workflows —
            intuitive for patients, powerful for professionals.
          </p>

          <NavLink
            to="/register"
            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
          >
            Create Your Account
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default Home;
