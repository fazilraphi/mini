import { useState, useEffect } from "react";
import Profile from "./Profile";
import AppointmentCreator from "./AppointmentCreator";
import DoctorAppointments from "./DoctorAppointments";
import DoctorConsultation from "./DoctorConsultation";
import ChatList from "../../components/ChatList";
import DoctorComplaints from "./DoctorComplaints";
import NotificationBell from "../../components/NotificationBell";
import { supabase } from "../../supabaseClient";
import { Menu, X, LogOut } from "lucide-react";

/* ── Icon components defined FIRST to avoid temporal dead zone ── */
const DashboardIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const PatientsIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const ConsultIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);
const CalIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
);
const ChatIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const PersonIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const ComplaintIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#0BC5EA" : "#A0AEC0"}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

/* ── NAV defined AFTER all icon components ── */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { key: "appointments", label: "Booked Patients", icon: PatientsIcon },
  { key: "prescriptions", label: "Consultations", icon: ConsultIcon },
  { key: "availability", label: "Availability", icon: CalIcon },
  { key: "chats", label: "Chats", icon: ChatIcon },
  { key: "complaints", label: "Complaints", icon: ComplaintIcon },
  { key: "profile", label: "Profile", icon: PersonIcon },
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

      if (!profile) return;
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7FAFC", fontFamily: "'Inter', system-ui, sans-serif", position: "relative" }}>

      {/* MOBILE HEADER */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 64,
        background: "#fff", borderBottom: "1px solid #E2E8F0", zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
      }} className="lg:hidden">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#4A5568", padding: 8, borderRadius: 8 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#0BC5EA" }}>HealthSync</span>
        </div>
        <NotificationBell />
      </div>

      {/* OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 45,
            backdropFilter: "blur(4px)",
          }}
          className="lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: 260, background: "#fff", display: "flex", flexDirection: "column",
        borderRight: "1px solid #E2E8F0", position: "fixed", top: 0, bottom: 0, zIndex: 50,
        transition: "transform 0.3s ease",
        transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        left: 0,
      }} className="lg:translate-x-0">
        {/* Logo */}
        <div style={{ padding: "32px 24px 20px", borderBottom: "1px solid #F7FAFC" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, background: "linear-gradient(135deg,#0BC5EA,#00B5D8)",
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(11, 197, 234, 0.2)",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4L4 8v8l8 4 8-4V8z" fill="rgba(255,255,255,0.3)" />
                  <path d="M12 4v16M4 8l8 4M20 8l-8 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="2.5" fill="#fff" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1A202C", lineHeight: 1.1 }}>HealthSync</div>
                <div style={{ fontSize: 10, color: "#0BC5EA", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 2 }}>Medical Portal</div>
              </div>
            </div>
            <div className="hidden lg:block">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => { setActive(key); setIsMobileMenuOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                  background: isActive ? "#EBF8FF" : "transparent",
                  color: isActive ? "#0BC5EA" : "#4A5568",
                  fontWeight: isActive ? 700 : 500, fontSize: 14,
                  transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isActive ? "0 4px 12px rgba(11, 197, 234, 0.1)" : "none",
                }}
              >
                <Icon active={isActive} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Doctor info + logout at bottom */}
        <div style={{ borderTop: "1px solid #F7FAFC", padding: "24px 16px", background: "#FDFDFD" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg,#0BC5EA,#2B6CB0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0,
              boxShadow: "0 4px 10px rgba(43, 108, 176, 0.2)",
            }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1A202C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Dr. {doctorProfile.full_name}
              </div>
              <div style={{ fontSize: 12, color: "#718096", fontWeight: 500 }}>{doctorProfile.speciality}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
              padding: "12px", borderRadius: 12, border: "1px solid #FED7D7",
              background: "#FFF5F5", color: "#C53030", fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        flex: 1, padding: "32px", minHeight: "100vh",
        transition: "margin 0.3s ease",
      }} className="lg:ml-[260px] pt-24 lg:pt-8 bg-[#F7FAFC]">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {active === "dashboard" && <DoctorConsultation />}
          {active === "profile" && <Profile defaultEditing={false} />}
          {active === "availability" && <AppointmentCreator />}
          {active === "appointments" && <DoctorAppointments />}
          {active === "prescriptions" && <DoctorConsultation />}
          {active === "chats" && <ChatList />}
          {active === "complaints" && <DoctorComplaints />}
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .lg\\:ml-\\[260px\\] { margin-left: 0 !important; }
          .lg\\:translate-x-0 { transform: translateX(-100%); }
          .lg\\:hidden { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .lg\\:ml-\\[260px\\] { margin-left: 260px !important; }
          .lg\\:translate-x-0 { transform: translateX(0) !important; }
          .lg\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
