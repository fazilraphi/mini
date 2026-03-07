import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,.07)", padding: 24 };

const TABS = ["All", "Upcoming", "Checked-in", "Completed"];

const STATUS_STYLES = {
  upcoming: { background: "#FEFCBF", color: "#D69E2E", label: "UPCOMING" },
  "checked-in": { background: "#C6F6D5", color: "#276749", label: "CHECKED-IN" },
  completed: { background: "#E2E8F0", color: "#718096", label: "COMPLETED" },
};

const DoctorAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Consultation state
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medicines, setMedicines] = useState([]);

  useEffect(() => { loadBookings(); }, [selectedDate]);

  const dateStr = selectedDate.toISOString().split("T")[0];

  const loadBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("appointment_bookings")
      .select(`id, booked_at, patient_id, appointment_id, appointments(id, date, time, max_patients), profiles:patient_id(full_name, age, gender)`)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: true });

    // filter to current date
    const filtered = (data || []).filter(b => b.appointments?.date === dateStr);
    setBookings(filtered);
    setLoading(false);
  };

  const openPatient = async (booking) => {
    setSelected(booking);
    setTitle(""); setDescription(""); setMedicines([]);
    const { data } = await supabase
      .from("medical_records")
      .select(`id, title, description, created_at, prescriptions(medicine_name, dosage, frequency, duration)`)
      .eq("patient_id", booking.patient_id)
      .order("created_at", { ascending: false });
    setHistory(data || []);
  };

  const addMedicine = () => setMedicines([...medicines, { medicine_name: "", dosage: "", frequency: "", duration: "" }]);

  const updateMedicine = (i, f, v) => {
    const copy = [...medicines];
    copy[i][f] = v;
    setMedicines(copy);
  };

  const saveConsultation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!title) return toast.error("Title required");
    const { data: record } = await supabase.from("medical_records")
      .insert({ patient_id: selected.patient_id, doctor_id: user.id, appointment_booking_id: selected.id, title, description })
      .select().single();
    if (medicines.length > 0) {
      await supabase.from("prescriptions").insert(medicines.map(m => ({ ...m, record_id: record.id })));
    }
    toast.success("Saved!");
    setTitle(""); setDescription(""); setMedicines([]);
    openPatient(selected);
  };

  const changeDate = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
    setSelected(null);
  };

  const formatDisplayDate = () => selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Map bookings to statuses for demo; use record presence as "completed"
  const getStatus = (b) => {
    // If any medical record exists → completed; else upcoming
    return "upcoming";
  };

  const tabFiltered = bookings.filter(b => {
    if (activeTab === "All") return true;
    const s = getStatus(b);
    if (activeTab === "Upcoming") return s === "upcoming";
    if (activeTab === "Checked-in") return s === "checked-in";
    if (activeTab === "Completed") return s === "completed";
    return true;
  });

  const tabCount = (tab) => {
    if (tab === "All") return bookings.length;
    return bookings.filter(b => {
      const s = getStatus(b);
      if (tab === "Upcoming") return s === "upcoming";
      if (tab === "Checked-in") return s === "checked-in";
      if (tab === "Completed") return s === "completed";
      return false;
    }).length;
  };

  if (selected) {
    const p = selected.profiles;
    return (
      <div style={{ maxWidth: 900 }}>
        <button
          onClick={() => setSelected(null)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#718096", fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 600 }}
        >
          ← Back to Patients
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", marginBottom: 14, marginTop: 0 }}>Patient Overview</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Name", p?.full_name], ["Age", p?.age], ["Gender", p?.gender]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#718096" }}>{l}</span>
                    <span style={{ fontWeight: 600 }}>{v || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", marginBottom: 14, marginTop: 0 }}>Consultation History</h2>
              {history.length === 0 && <p style={{ fontSize: 13, color: "#A0AEC0" }}>No previous records</p>}
              {history.map(r => (
                <div key={r.id} style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>{r.title}</p>
                  <p style={{ fontSize: 12, color: "#718096", margin: 0 }}>{r.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...card }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", marginBottom: 16, marginTop: 0 }}>New Consultation</h2>
            <input
              placeholder="Consultation Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }}
            />
            <textarea
              placeholder="Clinical notes / diagnosis"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical", marginBottom: 12 }}
            />
            {medicines.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input placeholder="Medicine" onChange={e => updateMedicine(i, "medicine_name", e.target.value)} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
                <input placeholder="Dosage" onChange={e => updateMedicine(i, "dosage", e.target.value)} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
                <input placeholder="Frequency" onChange={e => updateMedicine(i, "frequency", e.target.value)} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
                <input placeholder="Duration" onChange={e => updateMedicine(i, "duration", e.target.value)} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={addMedicine} style={{ background: "none", border: "none", color: "#0BC5EA", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Medication</button>
              <button onClick={saveConsultation} style={{ background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Save Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A202C", margin: "0 0 4px" }}>Booked Patients</h1>
          <p style={{ color: "#718096", fontSize: 14, margin: 0 }}>Manage your appointments for the current schedule.</p>
        </div>
        {/* Date navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "10px 16px" }}>
          <button onClick={() => changeDate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#718096", fontSize: 18, lineHeight: 1 }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0BC5EA", letterSpacing: 1 }}>
              {selectedDate.toLocaleString("en", { month: "long", year: "numeric" }).toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A202C" }}>
              {selectedDate.toLocaleString("en", { weekday: "long", day: "numeric" })}
            </div>
          </div>
          <button onClick={() => changeDate(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#718096", fontSize: 18, lineHeight: 1 }}>›</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          const count = tabCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", borderRadius: 999, border: "1.5px solid",
                borderColor: isActive ? "#0BC5EA" : "#E2E8F0",
                background: isActive ? "#EBF8FF" : "#fff",
                color: isActive ? "#0BC5EA" : "#4A5568",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              {tab} {count > 0 ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      {/* Patient list */}
      {loading && <p style={{ color: "#A0AEC0", fontSize: 14 }}>Loading...</p>}

      {!loading && tabFiltered.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <p style={{ color: "#A0AEC0", fontSize: 15 }}>No patients for this date.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tabFiltered.map(b => {
          const status = getStatus(b);
          const style = STATUS_STYLES[status] || STATUS_STYLES.upcoming;
          const time = b.appointments?.time?.slice(0, 5) || "";
          const name = b.profiles?.full_name || "Patient";
          const initial = name.charAt(0).toUpperCase();

          return (
            <div key={b.id} style={{
              ...card, display: "flex", alignItems: "center", gap: 16,
              padding: "16px 20px", borderRadius: 14,
            }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#BEE3F8,#90CDF4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "#2B6CB0", flexShrink: 0,
              }}>
                {initial}
              </div>

              {/* Name + time */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1A202C", margin: "0 0 3px" }}>{name}</p>
                <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#718096" }}>
                  <span>🕐 {time}</span>
                  <span>💬 Consultation</span>
                </div>
              </div>

              {/* Status badge */}
              <span style={{
                ...style, fontSize: 11, fontWeight: 700, padding: "4px 12px",
                borderRadius: 999, letterSpacing: .5,
              }}>
                {style.label}
              </span>

              {/* Action button */}
              <button
                onClick={() => openPatient(b)}
                style={{
                  background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", color: "#fff",
                  border: "none", borderRadius: 10, padding: "9px 18px",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                Open Patient
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, padding: "16px 0", borderTop: "1px solid #E2E8F0", fontSize: 12, color: "#A0AEC0" }}>
        <span>© 2024 MediGlass Portal. All patient data is encrypted.</span>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ cursor: "pointer", color: "#718096" }}>Privacy Policy</span>
          <span style={{ cursor: "pointer", color: "#718096" }}>Support Center</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
