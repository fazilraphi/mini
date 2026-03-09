import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import ChatList from "../../components/ChatList";
import Appointments from "./Appointments";
import MyAppointments from "./MyAppointments";
import Prescriptions from "./PatientPrescriptions";
import PatientProfile from "./PatientProfile";
import PatientChatbot from "./PatientChatbot";
import PatientComplaints from "./PatientComplaints";
import NotificationBell from "../../components/NotificationBell";

const PatientDashboard = () => {

  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {

    const loadProfile = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);

      const required = [
        "full_name",
        "age",
        "gender",
        "phone",
        "address",
        "blood_group",
        "emergency_contact"
      ];

      const incomplete = required.some(
        (field) => !data[field] || data[field].toString().trim() === ""
      );

      if (incomplete) {
        navigate("/complete-profile");
      }

    };

    loadProfile();

  }, [navigate]);



  const logout = async () => {

    await supabase.auth.signOut();
    navigate("/login");

  };


  if (!profile) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;
  }


  return (

    <div className="min-h-screen flex bg-[#F6F8FB] relative">

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-bold text-lg text-cyan-600">HealthSync</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-xs uppercase">
            {profile.full_name?.charAt(0)}
          </div>
        </div>
      </div>

      {/* OVERLAY for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <div className={`
        fixed lg:relative z-50 lg:z-auto
        w-64 bg-white shadow-xl lg:shadow-md p-6 flex flex-col justify-between h-screen
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div>

          <div className="hidden lg:flex items-center justify-between mb-10">
            <h2
              className="text-xl font-bold text-cyan-600 cursor-pointer"
              onClick={() => { setActivePage("dashboard"); setIsMobileMenuOpen(false); }}
            >
              HealthSync
            </h2>
            <NotificationBell />
          </div>

          <div className="lg:hidden mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Patient Menu</p>
          </div>

          <ul className="space-y-1 text-gray-700">

            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'appointments', label: 'Book Appointment' },
              { id: 'myappointments', label: 'My Appointments' },
              { id: 'prescriptions', label: 'Prescriptions' },
              { id: 'chat', label: 'Chat' },
              { id: 'records', label: 'Medical Records' },
              { id: 'chatbot', label: 'Health Assistant' },
              { id: 'complaints', label: 'Complaints' },
              { id: 'settings', label: 'Settings' }
            ].map(item => (
              <li
                key={item.id}
                onClick={() => { setActivePage(item.id); setIsMobileMenuOpen(false); }}
                className={`cursor-pointer px-4 py-2.5 rounded-xl transition-all font-medium ${activePage === item.id
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-200"
                  : "hover:bg-cyan-50 hover:text-cyan-600"
                  }`}
              >
                {item.label}
              </li>
            ))}
          </ul>

        </div>


        <div className="space-y-3 mt-10">

          <button
            onClick={logout}
            className="w-full border border-red-500 text-red-500 py-2.5 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm"
          >
            Logout
          </button>

          <button className="bg-red-500 text-white py-3 rounded-xl w-full flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-200 font-bold">
            <Phone size={18} />
            Emergency Call
          </button>

        </div>

      </div>



      {/* MAIN CONTENT */}

      <div className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">

        {/* DASHBOARD */}

        {activePage === "dashboard" && (

          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Welcome back, {profile.full_name}
              </h1>
              <p className="text-gray-500">Your health dashboard summary</p>
            </div>


            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Health Overview
            </h2>


            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              {[
                { label: "Blood Group", value: profile.blood_group, icon: "🩸" },
                { label: "Age", value: profile.age, icon: "👤" },
                { label: "Gender", value: profile.gender, icon: "⚥" },
                { label: "Phone", value: profile.phone, icon: "📞", fullWidth: true }
              ].map((stat, i) => (
                <div key={i} className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group ${stat.fullWidth ? 'col-span-2 lg:col-span-1' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-gray-900 truncate">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>


            {/* QUICK ACTIONS */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-lg">
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActivePage("appointments")}
                  className="bg-cyan-500 text-white p-5 rounded-2xl font-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all hover:scale-[1.02] active:scale-95 text-center flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">📅</span>
                  <span>Book Appointment</span>
                </button>

                <button
                  onClick={() => setActivePage("chat")}
                  className="bg-gray-50 text-gray-700 p-5 rounded-2xl font-black border border-gray-100 hover:bg-white hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 text-center flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">💬</span>
                  <span>Message Doctor</span>
                </button>
              </div>
            </div>

          </div>

        )}


        {/* APPOINTMENTS */}

        {activePage === "appointments" && <Appointments />}


        {/* MY APPOINTMENTS */}

        {activePage === "myappointments" && <MyAppointments />}


        {/* PRESCRIPTIONS */}

        {activePage === "prescriptions" && <Prescriptions />}


        {/* SETTINGS */}

        {activePage === "settings" && <PatientProfile />}


        {activePage === "chat" && <ChatList />}

        {/* MEDICAL RECORDS */}

        {activePage === "records" && <Prescriptions />}

        {/* CHATBOT PAGE */}

        {activePage === "chatbot" && <PatientChatbot />}

        {/* COMPLAINTS */}

        {activePage === "complaints" && <PatientComplaints />}

      </div>

    </div>

  );

};

export default PatientDashboard;
