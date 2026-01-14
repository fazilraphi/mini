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

  const menuItem = (key, label) => (
    <li
      onClick={() => {
        setActive(key);
        setMenuOpen(false);
      }}
      className={`px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 font-medium
        ${
          active === key
            ? "bg-orange-500 text-white shadow-md scale-[1.02]"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        }`}
    >
      {label}
    </li>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <div
        className={`bg-white w-64 p-6 shadow-lg fixed md:static z-20 h-full transition-all
        ${menuOpen ? "block" : "hidden"} md:block`}
      >
        <h2 className="text-2xl font-bold mb-8 text-orange-600">
          Doctor Panel
        </h2>

        <ul className="space-y-2">
          {menuItem("profile", "Profile")}
          {menuItem("availability", "Availability (Create Slots)")}
          {menuItem("appointments", "Booked Patients")}
          {menuItem("prescriptions", "Consultations / Prescriptions")}

          <li className="pt-4">
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:ml-64 mt-16 md:mt-0 transition-all">

        {/* Mobile hamburger */}
        <button
          className="md:hidden mb-4 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Page content */}
        <div className="animate-fadeIn">
          {active === "profile" && <Profile />}
          {active === "availability" && <AppointmentCreator />}
          {active === "appointments" && <DoctorAppointments />}
          {active === "prescriptions" && <DoctorConsultation />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
