import { useState, useEffect } from "react";
import Profile from "./PatientProfile";
import Appointments from "./Appointments";
import Prescriptions from "./PatientPrescriptions";
import { supabase } from "../../supabaseClient";

const PatientDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("appointments");

  useEffect(() => {
    const enforceCompletion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profile) return;

      const patientRequired = [
        "full_name",
        "age",
        "gender",
        "phone",
        "address",
        "blood_group",
        "emergency_contact",
      ];

      const doctorRequired = [
        "full_name",
        "institution",
        "speciality",
      ];

      const requiredFields =
        profile.role === "patient" ? patientRequired : doctorRequired;

      const incomplete = requiredFields.some(
        (field) =>
          !profile[field] || profile[field].toString().trim() === ""
      );

      if (incomplete) {
        window.location.href = "/complete-profile";
      }
    };

    enforceCompletion();
  }, []);

  const handleNav = (page) => {
    setActive(page);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItem = (key, label) => (
    <li
      onClick={() => handleNav(key)}
      className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-200
        ${
          active === key
            ? "bg-orange-500 text-white shadow"
            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
        }`}
    >
      {label}
    </li>
  );

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
      <div
        className={`bg-white w-64 p-6 shadow-lg fixed md:static z-20 h-full
        ${menuOpen ? "block" : "hidden"} md:block`}
      >
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          Patient Panel
        </h2>

        <ul className="space-y-3">
          {navItem("appointments", "Appointments")}
          {navItem("prescriptions", "Prescriptions")}
          {navItem("profile", "Profile")}

          <li className="pt-6">
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 md:ml-64">
        {/* Mobile menu button */}
        <button
          className="md:hidden mb-6 text-2xl bg-white px-3 py-1 rounded shadow"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Page content */}
        <div className="animate-fadeIn">
          {active === "profile" && <Profile />}
          {active === "appointments" && <Appointments />}
          {active === "prescriptions" && <Prescriptions />}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
