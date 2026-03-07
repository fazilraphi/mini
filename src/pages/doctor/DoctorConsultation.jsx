import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

/* ── shared styles ── */
const card = {
  background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,.07)", padding: 24,
};
const inputStyle = {
  width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const btnCyan = {
  background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", color: "#fff", border: "none",
  borderRadius: 10, padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
const btnGray = {
  background: "#EDF2F7", color: "#4A5568", border: "none",
  borderRadius: 10, padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer",
};

const DoctorConsultation = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meds, setMeds] = useState([{ medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [docProfile, setDocProfile] = useState(null);
  const [stats, setStats] = useState({ capacity: 0, slots: 0, completed: 0, inQueue: 0, nextPatient: "" });

  useEffect(() => { loadDashboard(); }, [selectedDate]);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase.from("profiles").select("full_name, speciality").eq("id", user.id).single();
    setDocProfile(prof);

    // --- Patient queue: filter by selected date ---
    const { data: allBookings } = await supabase
      .from("appointment_bookings")
      .select(`id, patient_id, booked_at, appointment_id, appointments(id, date, max_patients), profiles:patient_id(full_name, age, gender, phone, medical_history)`)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: true });

    const bookingList = (allBookings || []).filter(b => b.appointments?.date === selectedDate);
    setBookings(bookingList);
    setSelected(null);
    setHistory([]);

    // --- Stats: all upcoming slots (not just today) ---
    const today = new Date().toISOString().split("T")[0];

    const { data: upcomingSlots } = await supabase
      .from("appointments")
      .select("id, max_patients")
      .eq("doctor_id", user.id)
      .gte("date", today);

    const totalCap = (upcomingSlots || []).reduce((s, x) => s + (x.max_patients || 0), 0);
    const upcomingSlotIds = (upcomingSlots || []).map(s => s.id);

    // Count all upcoming bookings across those slots
    let totalBooked = 0;
    if (upcomingSlotIds.length > 0) {
      const { data: bookedData } = await supabase
        .from("appointment_bookings")
        .select("id")
        .eq("doctor_id", user.id)
        .in("appointment_id", upcomingSlotIds);
      totalBooked = (bookedData || []).length;
    }

    const { data: recs } = await supabase
      .from("medical_records")
      .select("id")
      .eq("doctor_id", user.id);

    setStats({
      capacity: totalCap,
      slots: totalBooked,
      completed: (recs || []).length,
      inQueue: bookingList.length,
      nextPatient: bookingList[0]?.profiles?.full_name || "—",
    });
  };



  // ================= LOAD HISTORY =================
  const loadHistory = async (patientId) => {
    const { data } = await supabase.from("medical_records").select(`*, prescriptions(*)`).eq("patient_id", patientId).order("created_at", { ascending: false });
    setHistory(data || []);
  };

  const handleSelect = (b) => { setSelected(b); loadHistory(b.patient_id); };

  const addRow = () => setMeds([...meds, { medicine_name: "", dosage: "", frequency: "Once a day", duration: "5 Days" }]);

  const updateMed = (i, field, value) => {
    const copy = [...meds];
    copy[i][field] = value;
    setMeds(copy);
  };

  const saveRecord = async (draft = false) => {
    if (!selected) return toast.error("Select a patient first");
    if (!title) return toast.error("Title required");

    const { data: { user } } = await supabase.auth.getUser();
    const { data: record, error } = await supabase
      .from("medical_records")
      .insert({ patient_id: selected.patient_id, doctor_id: user.id, appointment_booking_id: selected.id, title, description })
      .select().single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const medsPayload = meds.filter(m => m.medicine_name.trim() !== "");
    if (medsPayload.length > 0) {
      await supabase.from("prescriptions").insert(medsPayload.map(m => ({ ...m, record_id: record.id })));
    }

    toast.success(draft ? "Draft saved!" : "Consultation finalized!");
    setTitle(""); setDescription(""); setMeds([{ medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }]);
    loadHistory(selected.patient_id);
  };

  const pct = stats.capacity > 0 ? Math.round((stats.slots / stats.capacity) * 100) : 0;
  const radius = 28, circ = 2 * Math.PI * radius;

  return (
    <div style={{ maxWidth: 1200, width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A202C", margin: 0 }}>Doctor Dashboard</h1>
        <p style={{ color: "#718096", fontSize: 14, marginTop: 4 }}>Welcome back, {docProfile?.full_name}. Check your daily queue.</p>
      </div>

      {/* Date selector + stat cards */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ ...inputStyle, width: "auto", background: "#fff" }}
        />
      </div>

      {/* Stat cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
        {/* Capacity Used */}
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#718096", fontSize: 13, margin: "0 0 4px" }}>Capacity Used</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#0BC5EA", margin: "0 0 4px" }}>
              {stats.slots}/{stats.capacity || "—"} <span style={{ fontSize: 14 }}>Slots</span>
            </p>
            <span style={{
              background: "#E6FFFA", color: "#0BC5EA", fontSize: 12, padding: "2px 8px",
              borderRadius: 999, fontWeight: 600,
            }}>
              +{pct}% today
            </span>
          </div>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} fill="none" stroke="#EDF2F7" strokeWidth="7" />
            <circle
              cx="36" cy="36" r={radius} fill="none" stroke="#0BC5EA" strokeWidth="7"
              strokeDasharray={`${(pct / 100) * circ} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
            />
            <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1A202C">{pct}%</text>
          </svg>
        </div>

        {/* In Queue */}
        <div style={{ ...card }}>
          <p style={{ color: "#718096", fontSize: 13, margin: "0 0 6px" }}>In Queue</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#1A202C", margin: "0 0 4px" }}>
            {stats.inQueue} <span style={{ fontSize: 14, fontWeight: 400 }}>Patients</span>
          </p>
          <p style={{ fontSize: 12, color: "#718096", margin: 0 }}>Next: {stats.nextPatient}</p>
        </div>

        {/* Completed */}
        <div style={{ ...card }}>
          <p style={{ color: "#718096", fontSize: 13, margin: "0 0 6px" }}>Completed</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#1A202C", margin: "0 0 4px" }}>
            {stats.completed} <span style={{ fontSize: 14, fontWeight: 400 }}>Consults</span>
          </p>
          <p style={{ fontSize: 12, color: "#718096", margin: 0 }}>All time records</p>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Left: Patient Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", margin: 0 }}>Patient Queue</h2>
              <span style={{ fontSize: 12, color: "#718096", fontWeight: 500 }}>TODAY</span>
            </div>

            {bookings.length === 0 && (
              <p style={{ color: "#A0AEC0", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No patients for this date</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bookings.map((b, i) => {
                const isSelected = selected?.id === b.id;
                const isFirst = i === 0;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      borderRadius: 12, cursor: "pointer",
                      background: isSelected ? "#EBF8FF" : isFirst ? "#F0FFF4" : "transparent",
                      border: isSelected ? "1.5px solid #0BC5EA" : "1.5px solid transparent",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: isFirst ? "linear-gradient(135deg,#0BC5EA,#2B6CB0)" : "#CBD5E0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>
                      {b.profiles?.full_name?.charAt(0) || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "#1A202C", margin: 0 }}>{b.profiles?.full_name}</p>
                      <p style={{ fontSize: 12, color: "#718096", margin: 0 }}>{b.profiles?.gender}, {b.profiles?.age} yrs</p>
                    </div>
                    {isFirst && (
                      <span style={{ background: "#0BC5EA", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>NOW</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Overview mini card */}
          {selected && (
            <div style={{ ...card, border: "1.5px solid #BEE3F8" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1A202C", marginBottom: 12, marginTop: 0 }}>Patient Overview</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Name", selected.profiles?.full_name],
                  ["Age", selected.profiles?.age],
                  ["Gender", selected.profiles?.gender],
                  ["Phone", selected.profiles?.phone],
                  ["History", selected.profiles?.medical_history || "None"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#718096" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "#1A202C" }}>{val || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: New Consultation + History */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A202C", margin: 0 }}>🩺 New Consultation</h2>
              <span style={{ background: "#EBF8FF", color: "#0BC5EA", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999 }}>
                {selected ? `Patient: ${selected.profiles?.full_name}` : "Select a patient"}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 6 }}>Consultation Title</label>
              <input
                placeholder="e.g. Annual General Health Checkup"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 6 }}>Clinical Notes</label>
              <textarea
                placeholder="Enter findings, symptoms, and diagnosis..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568" }}>Prescriptions</label>
                <button onClick={addRow} style={{ background: "none", border: "none", color: "#0BC5EA", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  + Add Medication
                </button>
              </div>

              {/* Header row */}
              {meds.length > 0 && (
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr",
                  gap: 8, marginBottom: 8, padding: "0 4px",
                }}>
                  {["MEDICINE", "DOSAGE", "FREQUENCY", "DURATION"].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#A0AEC0", letterSpacing: ".5px" }}>{h}</span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {meds.map((m, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr", gap: 8 }}>
                    <input
                      placeholder="Medicine"
                      value={m.medicine_name}
                      onChange={e => updateMed(i, "medicine_name", e.target.value)}
                      style={{ ...inputStyle, fontSize: 13 }}
                    />
                    <input
                      placeholder="500mg"
                      value={m.dosage}
                      onChange={e => updateMed(i, "dosage", e.target.value)}
                      style={{ ...inputStyle, fontSize: 13 }}
                    />
                    <select
                      value={m.frequency}
                      onChange={e => updateMed(i, "frequency", e.target.value)}
                      style={{ ...inputStyle, fontSize: 13 }}
                    >
                      {["Once a day", "Twice a day", "Three times", "As needed"].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <input
                      placeholder="7 Days"
                      value={m.duration}
                      onChange={e => updateMed(i, "duration", e.target.value)}
                      style={{ ...inputStyle, fontSize: 13 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => saveRecord(false)} style={{ ...btnCyan, flex: 1 }}>
                💾 Save &amp; Finalize
              </button>
              <button onClick={() => saveRecord(true)} style={{ ...btnGray, flex: "0 0 auto" }}>
                Save Draft
              </button>
            </div>
          </div>

          {/* Consultation History */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", margin: 0 }}>🕐 Consultation History</h2>
              <span style={{ fontSize: 13, color: "#0BC5EA", fontWeight: 600, cursor: "pointer" }}>View All</span>
            </div>

            {history.length === 0 && (
              <p style={{ color: "#A0AEC0", fontSize: 13 }}>{selected ? "No previous records" : "Select a patient to view history"}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(r => (
                <div key={r.id} style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#1A202C", margin: "0 0 4px" }}>{r.title}</p>
                    <span style={{ fontSize: 11, color: "#718096" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#4A5568", margin: "0 0 8px" }}>{r.description}</p>
                  {r.prescriptions?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {r.prescriptions.map((p, pi) => (
                        <span key={pi} style={{ background: "#EBF8FF", color: "#0BC5EA", fontSize: 12, padding: "2px 10px", borderRadius: 999 }}>
                          {p.medicine_name} {p.dosage}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
