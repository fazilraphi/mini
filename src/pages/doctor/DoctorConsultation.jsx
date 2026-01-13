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

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(`
        id,
        patient_id,
        booked_at,
        profiles:patient_id(full_name, age, gender, phone, medical_history)
      `)
      .order("booked_at", { ascending: false });

    if (!error) setBookings(data);
  };

  const loadHistory = async (patientId) => {
    const { data } = await supabase
      .from("medical_records")
      .select(`
        *,
        prescriptions (*)
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    setHistory(data || []);
  };

  const handleSelect = (b) => {
    setSelected(b);
    loadHistory(b.patient_id);
  };

  const addRow = () => {
    setMeds([...meds, { medicine_name: "", dosage: "", frequency: "", duration: "" }]);
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

    const medsPayload = meds.filter(m => m.medicine_name.trim() !== "");

    if (medsPayload.length > 0) {
      await supabase.from("prescriptions").insert(
        medsPayload.map(m => ({
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
    <div className="grid grid-cols-3 gap-6">
      {/* LEFT: BOOKINGS */}
      <div className="space-y-4">
        <h2 className="font-bold">Appointments</h2>
        {bookings.map((b) => (
          <div
            key={b.id}
            onClick={() => handleSelect(b)}
            className={`p-3 rounded cursor-pointer ${
              selected?.id === b.id ? "bg-blue-100" : "bg-white"
            }`}
          >
            <p>{b.profiles?.full_name || "Unnamed"}</p>
          </div>
        ))}
      </div>

      {/* CENTER: PATIENT INFO */}
      <div className="space-y-4">
        {selected ? (
          <>
            <h2 className="font-bold">Patient Info</h2>
            <p>Name: {selected.profiles?.full_name}</p>
            <p>Age: {selected.profiles?.age}</p>
            <p>Gender: {selected.profiles?.gender}</p>
            <p>Phone: {selected.profiles?.phone}</p>
            <p>Patient Notes: {selected.profiles?.medical_history}</p>

            <h3 className="font-semibold mt-4">History</h3>
            {history.map((r) => (
              <div key={r.id} className="bg-white p-3 rounded shadow text-sm">
                <p className="font-medium">{r.title}</p>
                <p>{r.description}</p>

                {r.prescriptions?.map((p) => (
                  <p key={p.id}>
                    • {p.medicine_name} – {p.dosage}
                  </p>
                ))}
              </div>
            ))}
          </>
        ) : (
          <p>Select appointment</p>
        )}
      </div>

      {/* RIGHT: NEW RECORD */}
      <div className="space-y-4">
        <h2 className="font-bold">Add Record</h2>

        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <h3 className="font-semibold">Medicines</h3>

        {meds.map((m, i) => (
          <div key={i} className="space-y-1">
            <input placeholder="Medicine" className="border p-1 w-full" onChange={(e)=>updateMed(i,"medicine_name",e.target.value)} />
            <input placeholder="Dosage" className="border p-1 w-full" onChange={(e)=>updateMed(i,"dosage",e.target.value)} />
            <input placeholder="Frequency" className="border p-1 w-full" onChange={(e)=>updateMed(i,"frequency",e.target.value)} />
            <input placeholder="Duration" className="border p-1 w-full" onChange={(e)=>updateMed(i,"duration",e.target.value)} />
          </div>
        ))}

        <button onClick={addRow} className="bg-gray-200 px-3 py-1 rounded">
          + Add Medicine
        </button>

        <button onClick={saveRecord} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Save Record
        </button>
      </div>
    </div>
  );
};

export default DoctorConsultation;
