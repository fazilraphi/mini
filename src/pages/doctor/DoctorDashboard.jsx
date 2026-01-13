import { useState } from "react";
import Profile from "./Profile";
import AppointmentCreator from "./AppointmentCreator";
import DoctorAppointments from "./DoctorAppointments";
import DoctorConsultation from "./DoctorConsultation";
import { supabase } from "../../supabaseClient";

const DoctorDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("profile");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div
        className={`bg-white w-64 p-6 shadow-md fixed md:static z-20 h-full
        ${menuOpen ? "block" : "hidden"} md:block`}
      >
        <h2 className="text-xl font-bold mb-6">Doctor Panel</h2>

        <ul className="space-y-4">
          <li onClick={() => { setActive("profile"); setMenuOpen(false); }}>
            Profile
          </li>

          <li onClick={() => { setActive("availability"); setMenuOpen(false); }}>
            Availability (Create Slots)
          </li>

          <li onClick={() => { setActive("appointments"); setMenuOpen(false); }}>
            Booked Patients
          </li>

          <li onClick={() => { setActive("prescriptions"); setMenuOpen(false); }}>
            Consultations / Prescriptions
          </li>

          <li>
            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 md:ml-64 mt-16">
        <button
          className="md:hidden mb-4 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {active === "profile" && <Profile />}
        {active === "availability" && <AppointmentCreator />}
        {active === "appointments" && <DoctorAppointments />}
        {active === "prescriptions" && <DoctorConsultation />}
      </div>
    </div>
  );
};

export default DoctorDashboard;
