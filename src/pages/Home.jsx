import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/healthsync-logo.png";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI Symptom Assistant",
      desc: "Describe symptoms and receive instant AI-powered health insights."
    },
    {
      title: "Instant Appointment Booking",
      desc: "Find specialists and book consultations within seconds."
    },
    {
      title: "Verified Medical Professionals",
      desc: "Consult certified doctors and healthcare experts securely."
    },
    {
      title: "40+ Medical Specialisations",
      desc: "Access cardiology, dermatology, neurology and more."
    }
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => {
        if (prev === features.length - 1) {
          setDirection(-1);
          return prev - 1;
        }
        if (prev === 0) {
          setDirection(1);
          return prev + 1;
        }
        return prev + direction;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [direction, features.length]); // Added features.length to dependency array

  return (
    <div className="bg-[#F4FAFC] text-[#0F172A] min-h-screen flex flex-col overflow-x-hidden">

      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto w-full px-8 py-5 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <img
            src={logo}
            className="w-9 h-9 mix-blend-multiply opacity-90"
            alt="HealthSync"
          />
          <span className="font-bold text-2xl text-sky-600 tracking-tight">
            HealthSync
          </span>
        </div>

        {/* hide buttons on mobile */}
        <div className="hidden sm:flex items-center gap-4">

          <button
            onClick={() => navigate("/login")}
            className="
            px-5 py-2
            rounded-xl
            text-white
            font-semibold
            text-sm
            bg-gradient-to-r from-indigo-500 to-sky-500
            shadow-md shadow-indigo-300/30
            hover:scale-[1.05]
            hover:shadow-lg
            active:scale-[0.94]
            transition-all duration-200
            "
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="
            px-5 py-2
            rounded-xl
            text-white
            font-semibold
            text-sm
            bg-gradient-to-r from-sky-500 to-teal-400
            shadow-md shadow-sky-300/30
            hover:scale-[1.05]
            hover:shadow-lg
            active:scale-[0.94]
            transition-all duration-200
            "
          >
            Sign Up
          </button>

        </div>
      </header>



      {/* HERO */}
      <section className="flex-1 flex items-center justify-center">

        <div className="max-w-5xl mx-auto px-6 text-center">

          {/* TITLE */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">

            <span className="text-[#0F172A]">
              Primary
            </span>

            <br />

            <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
              Healthcare Platform
            </span>

          </h1>


          {/* DESCRIPTION */}
          <p className="text-gray-600 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed px-2">
            Connect with verified doctors instantly, receive AI symptom insights,
            and book consultations — all in one secure platform.
          </p>



          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

            <button
              onClick={() => navigate("/register")}
              className="
              px-7 py-2.5
              rounded-xl
              text-white
              font-semibold
              text-[15px]
              bg-gradient-to-r from-sky-500 to-teal-400
              shadow-lg shadow-sky-300/30
              hover:scale-[1.05]
              hover:shadow-xl
              active:scale-[0.95]
              transition-all duration-200
              "
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/login")}
              className="
              px-7 py-2.5
              rounded-xl
              text-white
              font-semibold
              text-[15px]
              bg-gradient-to-r from-indigo-500 to-sky-500
              shadow-lg shadow-indigo-300/30
              hover:scale-[1.05]
              hover:shadow-xl
              active:scale-[0.95]
              transition-all duration-200
              "
            >
              Login
            </button>

          </div>



          {/* FEATURE SLIDER (for sm+ screens) */}
          <div className="mt-10 -translate-y-[7px] hidden sm:block">

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-400 opacity-90" />

              {/* Glass */}
              <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />

              <div className="relative overflow-hidden">

                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${index * 100}%)`
                  }}
                >

                  {features.map((feature, i) => (

                    <div
                      key={i}
                      className="min-w-full flex flex-col md:flex-row items-center justify-between gap-10 px-12 py-12 text-white"
                    >

                      {/* LEFT */}
                      <div className="text-center md:text-left max-w-md">

                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                          {feature.title}
                        </h3>

                        <p className="text-white/90 leading-relaxed">
                          {feature.desc}
                        </p>

                        <button
                          onClick={() => navigate("/register")}
                          className="
                          mt-6
                          px-6 py-3
                          bg-white
                          text-sky-600
                          rounded-lg
                          font-semibold
                          hover:scale-[1.05]
                          active:scale-[0.95]
                          transition-all
                          "
                        >
                          Explore Feature
                        </button>

                      </div>



                      {/* RIGHT CARD */}
                      <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-[260px] shadow-xl text-white">

                        <div className="flex items-center gap-2 mb-4">
                          <img src={logo} className="w-6 h-6 mix-blend-screen" alt="HealthSync logo" />
                          <span className="font-semibold">HealthSync</span>
                        </div>

                        <div className="space-y-3 text-sm">

                          <div className="bg-white/20 px-3 py-2 rounded-lg">
                            Smart diagnostics
                          </div>

                          <div className="bg-white/20 px-3 py-2 rounded-lg">
                            Secure consultations
                          </div>

                          <div className="bg-white/20 px-3 py-2 rounded-lg">
                            Verified specialists
                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

          {/* FEATURE CAROUSEL (for mobile screens) */}
          <div className="mt-10 px-4 block sm:hidden overflow-hidden">
            <div
              className="flex flex-col transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateY(-${index * 100}%)`
              }}
            >
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="min-h-screen flex flex-col items-center justify-center px-4"
                >
                  <div className="bg-gradient-to-br from-sky-500 to-teal-400 text-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
                    <h3 className="font-bold text-2xl mb-4">{feature.title}</h3>
                    <p className="text-base opacity-90 leading-relaxed mb-6">{feature.desc}</p>
                    <button
                      onClick={() => navigate("/register")}
                      className="
                      w-full
                      px-6 py-3
                      bg-white
                      text-sky-600
                      rounded-lg
                      font-semibold
                      hover:scale-[1.05]
                      active:scale-[0.95]
                      transition-all
                      "
                    >
                      Explore Feature
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
