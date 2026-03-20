import { useState, useEffect } from "react";
import healthsyncLogo from "../../assets/healthsync-logo.png";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ChatList from "../../components/ChatList";
import Appointments from "./Appointments";
import MyAppointments from "./MyAppointments";
import Prescriptions from "./PatientPrescriptions";
import PatientProfile from "./PatientProfile";
import PatientComplaints from "./PatientComplaints";
import MedicalRecords from "./MedicalRecords";
import NotificationBell from "../../components/NotificationBell";
import {
  Menu, X, LogOut, LayoutDashboard, CalendarPlus, CalendarCheck,
  FileText, MessageSquare, ShieldAlert, UserCircle, FileHeart
} from "lucide-react";

const NAV = [
  { key: "dashboard",      label: "Dashboard",        icon: LayoutDashboard },
  { key: "appointments",   label: "Appointments",      icon: CalendarPlus },
  { key: "myappointments", label: "My Appointments",   icon: CalendarCheck },
  { key: "prescriptions",  label: "Prescriptions",     icon: FileText },
  { key: "chat",           label: "Chat",              icon: MessageSquare },
  { key: "records",        label: "Medical Records",   icon: FileHeart },
  { key: "complaints",     label: "Complaints",        icon: ShieldAlert },
  { key: "settings",       label: "Settings",          icon: UserCircle },
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data || data.role !== "patient") {
        await supabase.auth.signOut();
        navigate("/login");
        return;
      }

      setProfile(data);

      const required = ["full_name", "age", "gender", "phone", "address", "blood_group", "emergency_contact"];
      const incomplete = required.some((f) => !data[f] || data[f].toString().trim() === "");
      if (incomplete) navigate("/complete-profile");
    };
    loadProfile();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleNav = (key) => {
    setActivePage(key);
    setIsMobileMenuOpen(false);
  };

  if (!profile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F7FAFC] font-redhat text-gray-400 text-lg">
        Loading dashboard…
      </div>
    );
  }

  const initial = profile.full_name?.charAt(0)?.toUpperCase() || "P";

  /* ─── health-stat cards ─── */
  const stats = [
    { label: "Blood Group", value: profile.blood_group },
    { label: "Age",         value: profile.age },
    { label: "Gender",      value: profile.gender },
    { label: "Phone",       value: profile.phone },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#F7FAFC] font-redhat text-[#333] overflow-hidden relative">

      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src={healthsyncLogo} alt="HealthSync" className="h-7 w-auto object-contain" />
          <span className="font-extrabold text-xl text-[#0BC5EA] tracking-tight">HealthSync</span>
        </div>
        <NotificationBell />
      </div>

      {/* ── OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-45"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static
      `}>

        {/* Logo */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3">
            <img src={healthsyncLogo} alt="HealthSync" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-black text-lg text-gray-900 leading-none">HealthSync</div>
              <div className="text-[10px] text-[#0BC5EA] font-extrabold tracking-widest uppercase mt-1">Patient Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = activePage === key;
            return (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${isActive
                    ? "bg-cyan-50 text-[#0BC5EA] shadow-sm shadow-cyan-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                `}
              >
                <Icon size={20} className={isActive ? "text-[#0BC5EA]" : "text-gray-400"} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0BC5EA] to-[#2B6CB0] flex items-center justify-center text-white font-black shadow-md shadow-blue-100 shrink-0 overflow-hidden">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                : initial
              }
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{profile.full_name}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase truncate">Patient</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex-1 h-full overflow-y-auto no-scrollbar p-6 lg:p-10 pt-20 lg:pt-10">
          <div className="max-w-[1400px] mx-auto w-full h-full">

            {/* ─── DASHBOARD HOME ─── */}
            {activePage === "dashboard" && (
              <div className="flex flex-col h-full gap-6">

                {/* Header row */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900">
                      Hi {profile.full_name} 👋,
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Your health dashboard — stay on top of your wellbeing.</p>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
                      <span>📅 Today:</span>
                      <span className="text-gray-800">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <NotificationBell />
                  </div>
                </div>

                {/* Hero banner */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0BC5EA] to-[#2B6CB0] p-8 flex items-center justify-between flex-shrink-0 shadow-lg shadow-cyan-100">
                  <div>
                    <h2 className="text-white font-black text-2xl mb-2">Manage your health easily</h2>
                    <p className="text-cyan-100 text-sm mb-5">Book appointments, chat with doctors, and track your records.</p>
                    <button
                      onClick={() => handleNav("appointments")}
                      className="bg-white text-[#0BC5EA] font-bold px-6 py-2.5 rounded-xl shadow hover:shadow-md transition-all hover:scale-105 text-sm"
                    >
                      Book Appointment
                    </button>
                  </div>
                  <div className="hidden sm:block opacity-20">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4L4 8v8l8 4 8-4V8z" fill="white" />
                      <circle cx="12" cy="12" r="5" fill="white" />
                    </svg>
                  </div>
                </div>

                {/* Stats + Quick Actions row */}
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                  {/* Health Overview cards */}
                  <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <h2 className="text-lg font-black text-gray-800 flex-shrink-0">Health Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                          <p className="text-2xl font-black text-gray-900 break-words">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                      <h3 className="font-black text-gray-800 text-base mb-5">Quick Actions</h3>
                      <div className="flex flex-col gap-3 flex-1">
                        <button
                          onClick={() => handleNav("appointments")}
                          className="w-full bg-gradient-to-r from-[#0BC5EA] to-[#00B5D8] text-white font-bold py-3 px-4 rounded-xl shadow-sm shadow-cyan-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-sm"
                        >
                          📅 Book Appointment
                        </button>
                        <button
                          onClick={() => handleNav("chat")}
                          className="w-full border-2 border-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-cyan-200 hover:text-[#0BC5EA] transition-all duration-200 text-sm"
                        >
                          💬 Message Doctor
                        </button>
                        <button
                          onClick={() => handleNav("records")}
                          className="w-full border-2 border-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-cyan-200 hover:text-[#0BC5EA] transition-all duration-200 text-sm"
                        >
                          🗂️ Medical Records
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activePage === "appointments"   && <Appointments />}
            {activePage === "myappointments" && <MyAppointments />}
            {activePage === "prescriptions"  && <Prescriptions />}
            {activePage === "settings"       && <PatientProfile />}
            {activePage === "chat"           && <ChatList />}
            {activePage === "complaints"     && <PatientComplaints />}
            {activePage === "records"        && <MedicalRecords />}

          </div>
        </div>
      </main>

    </div>
  );
};

export default PatientDashboard;