import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const DoctorConsultation = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [meds, setMeds] = useState([
    { medicine_name: "", dosage: "", frequency: "", duration: "" },
  ]);

  const [selectedDate, setSelectedDate] = useState("");

  // ===== TIME SELECTOR =====
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  // ===== CONVERT 12HR → 24HR =====
  const formattedSlot = useMemo(() => {
    let h = parseInt(hour);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${minute}:00`;
  }, [hour, minute, period]);

  // ================= LOAD BOOKINGS =================
  useEffect(() => {
    if (selectedDate) loadBookings();
  }, [selectedDate]);

  const loadBookings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(
        `
        id,
        patient_id,
        appointment_id,
        booked_at,
        status,
        doctor_id,
        appointments!inner(
          id,
          date,
          time
        ),
        profiles:patient_id(
          full_name,
          age,
          gender,
          phone,
          medical_history,
          blood_group,
          address,
          emergency_contact
        )
      `,
      )
      .eq("appointments.date", selectedDate)
      .eq("doctor_id", user.id)
      .in("status", ["booked", "completed"]);

    if (error) {
      toast.error(error.message);
      return;
    }

    // Sort by time, then booked first, completed last
    const sorted = (data || []).sort((a, b) => {
      if (a.appointments.time < b.appointments.time) return -1;
      if (a.appointments.time > b.appointments.time) return 1;

      if (a.status === "booked" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "booked") return 1;

      return new Date(a.booked_at) - new Date(b.booked_at);
    });

    setBookings(sorted);
    setSelected(null);
    setHistory([]);
  };

  // ================= FILTER BY SLOT =================
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => b.appointments.time === formattedSlot);
  }, [bookings, formattedSlot]);

  // ================= LOAD HISTORY =================
  const loadHistory = async (patientId) => {
    const { data } = await supabase
      .from("medical_records")
      .select(`*, prescriptions(*)`)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    setHistory(data || []);
  };

  const handleSelect = (b) => {
    if (b.status === "completed") return;
    setSelected(b);
    loadHistory(b.patient_id);
  };

  // ================= MEDICINES =================
  const addRow = () => {
    setMeds([
      ...meds,
      { medicine_name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const updateMed = (i, field, value) => {
    const copy = [...meds];
    copy[i][field] = value;
    setMeds(copy);
  };

  // ================= SAVE CONSULTATION =================
  const saveRecord = async () => {
    if (!selected) return toast.error("Select a patient");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: record, error } = await supabase
      .from("medical_records")
      .insert({
        patient_id: selected.patient_id,
        doctor_id: user.id,
        appointment_booking_id: selected.id,
        title,
        description,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const medsPayload = meds.filter((m) => m.medicine_name.trim() !== "");

    if (medsPayload.length > 0) {
      await supabase.from("prescriptions").insert(
        medsPayload.map((m) => ({
          ...m,
          record_id: record.id,
        })),
      );
    }

    await supabase
      .from("appointment_bookings")
      .update({ status: "completed" })
      .eq("id", selected.id);

    toast.success("Consultation completed");

    // Reload to move patient to bottom
    loadBookings();

    setSelected(null);
    setTitle("");
    setDescription("");
    setMeds([{ medicine_name: "", dosage: "", frequency: "", duration: "" }]);
  };

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-gray-500">
          Manage consultations and patient records
        </p>
      </div>

      {/* DATE + TIME */}
      <div className="flex gap-4 items-end">
        <div className="bg-white p-4 rounded-xl shadow">
          <label className="text-sm text-gray-500 block">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-4 py-2 rounded"
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <label className="text-sm text-gray-500 block">Select Time</label>
          <div className="flex gap-2">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              {[...Array(12)].map((_, i) => {
                const h = String(i + 1).padStart(2, "0");
                return <option key={h}>{h}</option>;
              })}
            </select>

            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option>00</option>
              <option>15</option>
              <option>30</option>
              <option>45</option>
            </select>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT - QUEUE */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="font-semibold text-lg">Patient Queue</h2>

          {filteredBookings.length === 0 && (
            <p className="text-sm text-gray-500">No patients for this slot</p>
          )}

          {filteredBookings.map((b, i) => (
            <div
              key={b.id}
              onClick={() => handleSelect(b)}
              className={`p-4 rounded-xl border transition ${
                b.status === "completed"
                  ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-70"
                  : selected?.id === b.id
                    ? "border-orange-500 bg-orange-50 cursor-pointer"
                    : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  {i + 1}. {b.profiles.full_name}
                </p>

                {b.status === "completed" && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    Consulted
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500">
                {b.profiles.gender}, {b.profiles.age}
              </p>
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-semibold text-lg mb-3">Patient Overview</h2>

            {selected ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <b>Name:</b> {selected.profiles.full_name}
                </p>
                <p>
                  <b>Age:</b> {selected.profiles.age}
                </p>
                <p>
                  <b>Gender:</b> {selected.profiles.gender}
                </p>
                <p>
                  <b>Phone:</b> {selected.profiles.phone}
                </p>
                <p>
                  <b>Blood Group:</b> {selected.profiles.blood_group}
                </p>
                <p>
                  <b>Emergency:</b> {selected.profiles.emergency_contact}
                </p>
                <p className="col-span-2">
                  <b>Medical History:</b> {selected.profiles.medical_history}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Select a patient to view details</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="font-semibold text-lg">Consultation History</h2>

            {history.length === 0 && (
              <p className="text-sm text-gray-500">No previous records</p>
            )}

            {history.map((r) => (
              <div key={r.id} className="border rounded-xl p-4 space-y-2">
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-gray-600">{r.description}</p>

                {r.prescriptions?.length > 0 && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {r.prescriptions.map((p) => (
                      <p key={p.id}>
                        • {p.medicine_name} | {p.dosage} | {p.frequency} |{" "}
                        {p.duration}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - CONSULTATION */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="font-semibold text-lg">New Consultation</h2>

          <input
            placeholder="Consultation title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-3 rounded-lg w-full"
          />

          <textarea
            placeholder="Clinical notes / diagnosis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-3 rounded-lg w-full min-h-[100px]"
          />

          <h3 className="font-medium text-sm">Prescriptions</h3>

          {meds.map((m, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input
                placeholder="Medicine"
                className="border p-2 rounded"
                onChange={(e) => updateMed(i, "medicine_name", e.target.value)}
              />
              <input
                placeholder="Dosage"
                className="border p-2 rounded"
                onChange={(e) => updateMed(i, "dosage", e.target.value)}
              />
              <input
                placeholder="Frequency"
                className="border p-2 rounded"
                onChange={(e) => updateMed(i, "frequency", e.target.value)}
              />
              <input
                placeholder="Duration"
                className="border p-2 rounded"
                onChange={(e) => updateMed(i, "duration", e.target.value)}
              />
            </div>
          ))}

          <button onClick={addRow} className="text-orange-600 text-sm">
            + Add another medicine
          </button>

          <button
            onClick={saveRecord}
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-2 rounded-xl font-medium w-full"
          >
            Save Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
