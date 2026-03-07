import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,.07)", padding: 24 };
const inputStyle = {
  width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const AppointmentCreator = () => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxPatients, setMaxPatients] = useState(5);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);

  const loadSlots = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("appointments")
      .select("*, appointment_bookings(id)")
      .eq("doctor_id", user.id)
      .gte("date", today)
      .order("date", { ascending: true });
    if (!error) setSlots(data || []);
  };

  useEffect(() => { loadSlots(); }, []);

  const createSlot = async () => {
    if (!date) return toast.error("Please select a date");
    if (!startTime) return toast.error("Please enter start time");

    const selectedDate = new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return toast.error("Cannot create slots in the past");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const formattedTime = startTime + ":00";

    const { data: existing } = await supabase.from("appointments").select("id")
      .eq("doctor_id", user.id).eq("date", date).eq("time", formattedTime).maybeSingle();
    if (existing) { setLoading(false); return toast.error("Slot already exists"); }

    const { error } = await supabase.from("appointments").insert({ doctor_id: user.id, date, time: formattedTime, max_patients: maxPatients });
    if (error) toast.error(error.message);
    else { toast.success("Slot created!"); loadSlots(); }
    setLoading(false);
  };

  const deleteSlot = async (id) => {
    if (!confirm("Delete this slot?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Slot deleted"); loadSlots(); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      month: d.toLocaleString("en", { month: "short" }).toUpperCase(),
      day: d.getDate(),
    };
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A202C", margin: "0 0 4px" }}>Availability Management</h1>
        <p style={{ color: "#718096", fontSize: 14, margin: 0 }}>Configure and manage your clinical consultation hours.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Create slot panel */}
        <div style={{ ...card }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EBF8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0BC5EA"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A202C", margin: 0 }}>Create New Slot</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 6 }}>Select Date</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#A0AEC0"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 6 }}>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 6 }}>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 6 }}>Max Patients</label>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <input
                  type="number"
                  min={1}
                  value={maxPatients}
                  onChange={e => setMaxPatients(Number(e.target.value))}
                  style={{ ...inputStyle, textAlign: "center", borderRadius: "10px 0 0 10px", borderRight: "none" }}
                />
                <button
                  onClick={() => setMaxPatients(p => Math.max(1, p - 1))}
                  style={{ padding: "10px 14px", border: "1px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 16, color: "#4A5568", borderRight: "none" }}
                >–</button>
                <button
                  onClick={() => setMaxPatients(p => p + 1)}
                  style={{ padding: "10px 14px", border: "1px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 16, color: "#4A5568", borderRadius: "0 10px 10px 0" }}
                >+</button>
              </div>
            </div>

            <button
              onClick={createSlot}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", color: "#fff", border: "none",
                borderRadius: 12, padding: "13px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                opacity: loading ? .7 : 1, marginTop: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              {loading ? "Creating..." : "Add Consultation Slot"}
            </button>
          </div>
        </div>

        {/* Upcoming slots panel */}
        <div style={{ ...card }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EBF8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0BC5EA"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A202C", margin: 0 }}>Upcoming Slots</h2>
            </div>
            {slots.length > 0 && (
              <span style={{ background: "#E6FFFA", color: "#0BC5EA", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                {slots.length} ACTIVE
              </span>
            )}
          </div>

          {slots.length === 0 && (
            <p style={{ color: "#A0AEC0", fontSize: 14, textAlign: "center", padding: "40px 0" }}>No upcoming slots yet.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {slots.map(slot => {
              const { month, day } = formatDate(slot.date);
              const booked = slot.appointment_bookings?.length || 0;
              return (
                <div key={slot.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  border: "1px solid #E2E8F0", borderRadius: 14,
                }}>
                  {/* Date badge */}
                  <div style={{
                    width: 48, minWidth: 48, textAlign: "center", background: "#EBF8FF",
                    borderRadius: 12, padding: "6px 4px",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#0BC5EA", letterSpacing: 1 }}>{month}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1A202C", lineHeight: 1 }}>{day}</div>
                  </div>

                  {/* Time + info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#718096"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" /></svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1A202C" }}>
                        {formatTime(slot.time)} {slot.end_time ? `- ${formatTime(slot.end_time)}` : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#718096" }}>
                      <span>👥 {slot.max_patients} Capacity</span>
                      <span style={{ color: booked > 0 ? "#0BC5EA" : "#A0AEC0" }}>
                        ✓ {booked} Booked
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSlot(slot.id)}
                    style={{ background: "#FFF5F5", color: "#FC8181", border: "1px solid #FED7D7", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>

          {slots.length > 3 && (
            <div style={{ marginTop: 16, border: "2px dashed #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: "#718096" }}>• • •  Load more upcoming slots</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCreator;
