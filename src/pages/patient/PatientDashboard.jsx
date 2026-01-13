import { useState } from "react";
import Profile from "./PatientProfile";
import Appointments from "./Appointments";
import Prescriptions from "./PatientPrescriptions";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
const PatientDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("appointments");

  const handleNav = (page) => {
    setActive(page);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white w-64 p-6 shadow-md fixed md:static z-20 h-full
        ${menuOpen ? "block" : "hidden"} md:block`}>

        <h2 className="text-xl font-bold mb-6">Patient Panel</h2>

        <ul className="space-y-4">
          <li onClick={() => handleNav("profile")} className="cursor-pointer">Profile</li>
          <li onClick={() => handleNav("appointments")} className="cursor-pointer">Appointments</li>
          <li onClick={() => handleNav("prescriptions")} className="cursor-pointer">Prescriptions</li>
          <li>
            <button onClick={handleLogout} className="text-red-500">Logout</button>
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
        {active === "appointments" && <Appointments />}
        {active === "prescriptions" && <Prescriptions />}
      </div>
    </div>
  );
};

export default PatientDashboard;

