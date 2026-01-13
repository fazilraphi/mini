import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const DoctorAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(`
        id,
        booked_at,
        patient_id,
        profiles (
          id,
          full_name,
          age,
          gender,
          phone,
          blood_group,
          address,
          medical_history
        )
      `)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: false });

    console.log("BOOKINGS:", data);
    console.log("ERROR:", error);

    if (!error) setBookings(data || []);
  };

  const openPatient = async (booking) => {
    setSelected(booking);
    setPatient(booking.profiles);

    const { data } = await supabase
      .from("medical_records")
      .select(`
        id,
        title,
        description,
        created_at,
        prescriptions (
          id,
          medicine_name,
          dosage,
          frequency,
          duration
        )
      `)
      .eq("patient_id", booking.patient_id)
      .order("created_at", { ascending: false });

    setHistory(data || []);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { medicine_name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const saveConsultation = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!title) return toast.error("Title required");

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

    if (medicines.length > 0) {
      const payload = medicines.map((m) => ({
        ...m,
        record_id: record.id,
      }));

      const { error: medError } = await supabase
        .from("prescriptions")
        .insert(payload);

      if (medError) return toast.error(medError.message);
    }

    toast.success("Consultation saved");

    setTitle("");
    setDescription("");
    setMedicines([]);

    openPatient(selected); // refresh history
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>

      {!selected ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {b.profiles?.full_name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  {b.profiles?.gender || "-"}, {b.profiles?.age || "-"}
                </p>
              </div>

              <button
                onClick={() => openPatient(b)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Open
              </button>
            </div>
          ))}

          {bookings.length === 0 && (
            <p className="text-gray-500">No appointments yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow">
          <button
            onClick={() => {
              setSelected(null);
              setPatient(null);
              setHistory([]);
            }}
            className="text-sm text-gray-500"
          >
            ← Back
          </button>

          {/* PATIENT BIODATA */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Patient Details</h2>
            <p><b>Name:</b> {patient?.full_name}</p>
            <p><b>Age:</b> {patient?.age}</p>
            <p><b>Gender:</b> {patient?.gender}</p>
            <p><b>Phone:</b> {patient?.phone}</p>
            <p><b>Blood Group:</b> {patient?.blood_group}</p>
            <p><b>Address:</b> {patient?.address}</p>
            <p><b>Medical History:</b> {patient?.medical_history}</p>
          </div>

          {/* HISTORY */}
          <div className="space-y-3">
            <h3 className="font-semibold">Past Consultations</h3>

            {history.length === 0 && (
              <p className="text-sm text-gray-500">No history yet.</p>
            )}

            {history.map((r) => (
              <div key={r.id} className="border p-3 rounded">
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-gray-600">{r.description}</p>

                {r.prescriptions?.map((p) => (
                  <p key={p.id} className="text-xs text-gray-500">
                    • {p.medicine_name} ({p.dosage})
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* NEW CONSULTATION */}
          <div className="space-y-3">
            <h3 className="font-semibold">New Consultation</h3>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full rounded"
            />

            {medicines.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 border p-3 rounded">
                <input placeholder="Medicine" onChange={(e) => updateMedicine(i, "medicine_name", e.target.value)} className="border p-2 rounded" />
                <input placeholder="Dosage" onChange={(e) => updateMedicine(i, "dosage", e.target.value)} className="border p-2 rounded" />
                <input placeholder="Frequency" onChange={(e) => updateMedicine(i, "frequency", e.target.value)} className="border p-2 rounded" />
                <input placeholder="Duration" onChange={(e) => updateMedicine(i, "duration", e.target.value)} className="border p-2 rounded" />
              </div>
            ))}

            <button onClick={addMedicine} className="text-blue-600 text-sm">
              + Add medicine
            </button>

            <button
              onClick={saveConsultation}
              className="bg-green-600 text-white px-5 py-2 rounded"
            >
              Save Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
