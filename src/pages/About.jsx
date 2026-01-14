import React from "react";

const About = () => {
  return (
    <div className="bg-[#F7F7F7] text-[#141414]">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="font-exo text-4xl md:text-5xl font-bold mb-6">
          About Our Platform
        </h1>

        <p className="font-redhat text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
          Our Primary Healthcare Management System is built to simplify clinical
          workflows, enhance patient experience, and support healthcare
          professionals with reliable digital infrastructure.
        </p>
      </section>

      {/* MISSION / VISION */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="font-exo text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="font-redhat text-gray-600 leading-relaxed">
            To empower clinics and healthcare professionals with modern tools
            that streamline operations, reduce administrative burden, and
            improve the overall quality of patient care.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="font-exo text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="font-redhat text-gray-600 leading-relaxed">
            We envision a future where technology seamlessly supports
            healthcare delivery, enabling better clinical decisions, improved
            patient outcomes, and stronger doctor–patient relationships.
          </p>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-exo text-3xl font-bold text-center mb-12">
          What This Platform Provides
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Digital Patient Records",
              desc: "Secure storage and access to patient history, prescriptions, and visit data."
            },
            {
              title: "Smart Appointment Management",
              desc: "Efficient scheduling for doctors and convenient booking for patients."
            },
            {
              title: "Doctor–Patient Workflow",
              desc: "Structured consultations, prescriptions, and follow-up tracking."
            },
            {
              title: "Role-Based Dashboards",
              desc: "Separate, tailored experiences for doctors and patients."
            },
            {
              title: "Data Privacy & Security",
              desc: "Designed with access control and data protection in mind."
            },
            {
              title: "Scalable Architecture",
              desc: "Built to grow with real-world healthcare system needs."
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-comfortaa text-lg font-semibold mb-3">
                {item.title}
              </h3>
              <p className="font-redhat text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;
