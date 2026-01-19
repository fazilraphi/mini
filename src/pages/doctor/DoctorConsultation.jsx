import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (selectedDate) loadBookings();
  }, [selectedDate]);

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(`
        id,
        patient_id,
        booked_at,
        appointments!inner(date),
        profiles:patient_id(full_name, age, gender, phone, medical_history)
      `)
      .eq("appointments.date", selectedDate)
      .order("booked_at", { ascending: true });

    if (error) {
      toast.error(error.message);
    } else {
      setBookings(data || []);
      setSelected(null);
      setHistory([]);
    }
  };

  const loadHistory = async (patientId) => {
    const { data } = await supabase
      .from("medical_records")
      .select(`*, prescriptions(*)`)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    setHistory(data || []);
  };

  const handleSelect = (b) => {
    setSelected(b);
    loadHistory(b.patient_id);
  };

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

  const saveRecord = async () => {
    if (!selected) return;

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

    if (error) return toast.error(error.message);

    const medsPayload = meds.filter((m) => m.medicine_name.trim() !== "");

    if (medsPayload.length > 0) {
      await supabase.from("prescriptions").insert(
        medsPayload.map((m) => ({
          ...m,
          record_id: record.id,
        }))
      );
    }

    toast.success("Record saved");
    setTitle("");
    setDescription("");
    setMeds([{ medicine_name: "", dosage: "", frequency: "", duration: "" }]);
    loadHistory(selected.patient_id);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-gray-500">Manage consultations and patient records</p>
      </div>

      {/* DATE FILTER (minimal addition, layout preserved) */}
      <div className="bg-white p-4 rounded-xl shadow w-fit">
        <label className="text-sm text-gray-500 block">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-4 py-2 rounded"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="font-semibold text-lg">Patient Queue</h2>

          {bookings.length === 0 && (
            <p className="text-sm text-gray-500">No patients for this date</p>
          )}

          {bookings.map((b, i) => (
            <div
              key={b.id}
              onClick={() => handleSelect(b)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selected?.id === b.id
                  ? "border-orange-500 bg-orange-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <p className="font-medium">{i + 1}. {b.profiles?.full_name}</p>
              <p className="text-sm text-gray-500">
                {b.profiles?.gender}, {b.profiles?.age}
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
                <p><b>Name:</b> {selected.profiles?.full_name}</p>
                <p><b>Age:</b> {selected.profiles?.age}</p>
                <p><b>Gender:</b> {selected.profiles?.gender}</p>
                <p><b>Phone:</b> {selected.profiles?.phone}</p>
                <p className="col-span-2"><b>History:</b> {selected.profiles?.medical_history}</p>
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
                      <p key={p.id}>• {p.medicine_name} – {p.dosage}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
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
              <input placeholder="Medicine" className="border p-2 rounded" onChange={(e)=>updateMed(i,"medicine_name",e.target.value)} />
              <input placeholder="Dosage" className="border p-2 rounded" onChange={(e)=>updateMed(i,"dosage",e.target.value)} />
              <input placeholder="Frequency" className="border p-2 rounded" onChange={(e)=>updateMed(i,"frequency",e.target.value)} />
              <input placeholder="Duration" className="border p-2 rounded" onChange={(e)=>updateMed(i,"duration",e.target.value)} />
            </div>
          ))}

          <button onClick={addRow} className="text-orange-600 text-sm text-left">
            + Add another medicine
          </button>
          <br />
          <button
            onClick={saveRecord}
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-2 rounded-xl font-medium mx-auto"
          >
            Save Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
