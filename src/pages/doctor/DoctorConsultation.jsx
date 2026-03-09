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
    <div className="max-w-[1200px] w-full px-4 md:px-0 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Doctor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {docProfile?.full_name}. Check your daily queue.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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
          <p className="text-xs text-gray-500 truncate">Next: {stats.nextPatient}</p>
        </div>

        {/* Completed */}
        <div style={{ ...card }} className="sm:col-span-2 lg:col-span-1">
          <p style={{ color: "#718096", fontSize: 13, margin: "0 0 6px" }}>Completed</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#1A202C", margin: "0 0 4px" }}>
            {stats.completed} <span style={{ fontSize: 14, fontWeight: 400 }}>Consults</span>
          </p>
          <p className="text-xs text-gray-500">All time records</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left: Patient Queue */}
        <div className="flex flex-col gap-5">
          <div style={{ ...card }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Patient Queue</h2>
              <span className="text-xs font-semibold text-gray-400">TODAY</span>
            </div>

            {bookings.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No patients for this date</p>
            )}

            <div className="flex flex-col gap-2">
              {bookings.map((b, i) => {
                const isSelected = selected?.id === b.id;
                const isFirst = i === 0;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? "bg-cyan-50 border-cyan-400 shadow-sm" : isFirst ? "bg-green-50 border-green-100" : "bg-transparent border-transparent hover:bg-gray-50"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${isFirst ? "bg-gradient-to-br from-cyan-400 to-blue-600" : "bg-gray-300"
                      }`}>
                      {b.profiles?.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{b.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">{b.profiles?.gender}, {b.profiles?.age} yrs</p>
                    </div>
                    {isFirst && (
                      <span className="bg-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">NOW</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Overview mini card */}
          {selected && (
            <div style={{ ...card }} className="border border-blue-100 bg-blue-50/30">
              <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-tight uppercase">Patient Overview</h3>
              <div className="space-y-3">
                {[
                  ["Name", selected.profiles?.full_name],
                  ["Age", selected.profiles?.age],
                  ["Gender", selected.profiles?.gender],
                  ["Phone", selected.profiles?.phone],
                  ["History", selected.profiles?.medical_history || "None"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-gray-900 text-right ml-4">{val || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: New Consultation + History */}
        <div className="flex flex-col gap-6">
          <div style={{ ...card }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-gray-900">🩺 New Consultation</h2>
              <span className="bg-cyan-50 text-cyan-600 text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-100 truncate max-w-full">
                {selected ? `Patient: ${selected.profiles?.full_name}` : "Select a patient"}
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Consultation Title</label>
                <input
                  placeholder="e.g. Annual General Health Checkup"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={inputStyle}
                  className="focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Clinical Notes</label>
                <textarea
                  placeholder="Enter findings, symptoms, and diagnosis..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                  className="focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Prescriptions</label>
                  <button onClick={addRow} className="text-cyan-500 text-xs font-bold hover:text-cyan-600 transition-colors">
                    + Add Medication
                  </button>
                </div>

                {/* Medication Rows */}
                <div className="space-y-3">
                  {meds.map((m, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">MEDICINE</label>
                        <input
                          placeholder="Medicine name"
                          value={m.medicine_name}
                          onChange={e => updateMed(i, "medicine_name", e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">DOSAGE</label>
                        <input
                          placeholder="e.g. 500mg"
                          value={m.dosage}
                          onChange={e => updateMed(i, "dosage", e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">FREQUENCY</label>
                        <select
                          value={m.frequency}
                          onChange={e => updateMed(i, "frequency", e.target.value)}
                          style={inputStyle}
                        >
                          {["Once a day", "Twice a day", "Three times", "As needed"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">DURATION</label>
                        <input
                          placeholder="e.g. 7 Days"
                          value={m.duration}
                          onChange={e => updateMed(i, "duration", e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={() => saveRecord(false)} style={{ ...btnCyan, flex: 1 }} className="hover:scale-[1.02] transform transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
                  💾 Save & Finalize
                </button>
                <button onClick={() => saveRecord(true)} style={{ ...btnGray, flex: "0 0 auto" }} className="hover:bg-gray-200 transition-colors">
                  Save Draft
                </button>
              </div>
            </div>
          </div>

          {/* Consultation History */}
          <div style={{ ...card }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-md font-bold text-gray-900 tracking-tight uppercase">🕐 Consultation History</h2>
              <button className="text-cyan-500 text-sm font-bold hover:underline">View All</button>
            </div>

            {history.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">{selected ? "No previous records" : "Select a patient to view history"}</p>
            )}

            <div className="space-y-4">
              {history.map(r => (
                <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:border-cyan-100 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-gray-900">{r.title}</p>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{r.description}</p>
                  {r.prescriptions?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.prescriptions.map((p, pi) => (
                        <span key={pi} className="bg-white border border-cyan-100 text-cyan-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                          {p.medicine_name} • {p.dosage}
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
