import { useState, useEffect } from "react";
import Profile from "./Profile";
import AppointmentCreator from "./AppointmentCreator";
import DoctorAppointments from "./DoctorAppointments";
import DoctorConsultation from "./DoctorConsultation";
import ChatList from "../../components/ChatList";
import { supabase } from "../../supabaseClient";

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

/* ── NAV defined AFTER all icon components ── */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { key: "appointments", label: "Booked Patients", icon: PatientsIcon },
  { key: "prescriptions", label: "Consultations", icon: ConsultIcon },
  { key: "availability", label: "Availability", icon: CalIcon },
  { key: "chats", label: "Chats", icon: ChatIcon },
  { key: "profile", label: "Profile", icon: PersonIcon },
];

const DoctorDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [doctorProfile, setDoctorProfile] = useState({ full_name: "Doctor", speciality: "" });

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#EDF2F7", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: "#fff", display: "flex", flexDirection: "column",
        borderRight: "1px solid #E2E8F0", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #EDF2F7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: "linear-gradient(135deg,#0BC5EA,#00B5D8)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 4L4 8v8l8 4 8-4V8z" fill="rgba(255,255,255,0.3)" />
                <path d="M12 4v16M4 8l8 4M20 8l-8 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2" fill="#fff" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1A202C", lineHeight: 1 }}>HealthSync</div>
              <div style={{ fontSize: 10, color: "#0BC5EA", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Clinic Management</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                  background: isActive ? "#EBF8FF" : "transparent",
                  color: isActive ? "#0BC5EA" : "#4A5568",
                  fontWeight: isActive ? 600 : 500, fontSize: 14,
                  transition: "all .15s",
                }}
              >
                <Icon active={isActive} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Doctor info + logout at bottom */}
        <div style={{ borderTop: "1px solid #EDF2F7", padding: "16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#0BC5EA,#2B6CB0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1A202C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {doctorProfile.full_name}
              </div>
              <div style={{ fontSize: 11, color: "#718096" }}>{doctorProfile.speciality}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "9px 12px", borderRadius: 10, border: "1px solid #FED7D7",
              background: "#FFF5F5", color: "#C53030", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, marginLeft: 220, padding: "28px 32px", minHeight: "100vh" }}>
        {active === "dashboard" && <DoctorConsultation />}
        {active === "profile" && <Profile defaultEditing={false} />}
        {active === "availability" && <AppointmentCreator />}
        {active === "appointments" && <DoctorAppointments />}
        {active === "prescriptions" && <DoctorConsultation />}
        {active === "chats" && <ChatList />}
      </main>
    </div>
  );
};

export default DoctorDashboard;
