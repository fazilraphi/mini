import { useState, useEffect } from "react";
import healthsyncLogo from "../../assets/healthsync-logo.png";
import Profile from "./Profile";
import AppointmentCreator from "./AppointmentCreator";
import DoctorAppointments from "./DoctorAppointments";
import DoctorConsultation from "./DoctorConsultation";
import ChatList from "../../components/ChatList";
import DoctorComplaints from "./DoctorComplaints";
import DoctorDashboardHome from "./DoctorDashboardHome";
import NotificationBell from "../../components/NotificationBell";
import { supabase } from "../../supabaseClient";
import { Menu, X, LogOut, LayoutDashboard, Users, Calendar, Clock, MessageSquare, ShieldAlert, UserCircle } from "lucide-react";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "appointments", label: "Booked Patients", icon: Users },
  { key: "prescriptions", label: "Consultations", icon: Clock },
  { key: "availability", label: "Availability", icon: Calendar },
  { key: "chats", label: "Chats", icon: MessageSquare },
  { key: "complaints", label: "Complaints", icon: ShieldAlert },
  { key: "profile", label: "Profile", icon: UserCircle },
];

const DoctorDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [doctorProfile, setDoctorProfile] = useState({ full_name: "Doctor", speciality: "" });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "doctor") {
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }
      setDoctorProfile(profile);

      const required = ["full_name", "institution", "speciality"];
      const incomplete = required.some(f => !profile[f] || profile[f].toString().trim() === "");
      if (incomplete) window.location.href = "/complete-profile";
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const initial = doctorProfile.full_name?.charAt(0)?.toUpperCase() || "D";

  return (
    <div className="flex h-screen w-screen bg-[#F7FAFC] font-redhat text-[#333] overflow-hidden relative">

      {/* MOBILE HEADER */}
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

      {/* OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-45"
        />
      )}

      {/* SIDEBAR */}
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
              <div className="text-[10px] text-[#0BC5EA] font-extrabold tracking-widest uppercase mt-1">Medical Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => { setActive(key); setIsMobileMenuOpen(false); }}
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

        {/* Doctor Info & Logout */}
        <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setActive("profile")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0BC5EA] to-[#2B6CB0] flex items-center justify-center text-white font-black shadow-md shadow-blue-100 shrink-0 overflow-hidden">
              {doctorProfile.avatar_url ? (
                <img src={doctorProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">Dr. {doctorProfile.full_name}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase truncate">{doctorProfile.speciality}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex-1 h-full overflow-y-auto no-scrollbar p-6 lg:p-10 pt-20 lg:pt-10">
          <div className="max-w-[1400px] mx-auto w-full h-full">
            {active === "dashboard" && <DoctorDashboardHome onNavigate={setActive} profile={doctorProfile} />}
            {active === "profile" && (
              <Profile 
                defaultEditing={false} 
                initialProfile={doctorProfile} 
                onUpdate={(newProfile) => setDoctorProfile(newProfile)}
              />
            )}
            {active === "availability" && <AppointmentCreator />}
            {active === "appointments" && <DoctorAppointments onNavigate={setActive} />}
            {active === "prescriptions" && <DoctorConsultation />}
            {active === "chats" && <ChatList />}
            {active === "complaints" && <DoctorComplaints />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
