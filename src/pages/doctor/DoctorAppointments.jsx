import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const MAX_PATIENTS = 10; // adjust if dynamic later

const DoctorAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medicines, setMedicines] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("appointment_bookings")
      .select(`
        id,
        booked_at,
        patient_id,
        appointments (
          date,
          time,
          max_patients
        ),
        profiles (
          full_name,
          age,
          gender
        )
      `)
      .eq("doctor_id", user.id)
      .order("booked_at", { ascending: true }); // FIFO

    setBookings(data || []);
  };

  const applyFilter = () => {
    if (!selectedDate) return toast.error("Select a date");

    const result = bookings.filter(
      b => b.appointments?.date === selectedDate
    );

    setFiltered(result);
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
    setMedicines([...medicines, { medicine_name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const updateMedicine = (i, f, v) => {
    const copy = [...medicines];
    copy[i][f] = v;
    setMedicines(copy);
  };

  const saveConsultation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!title) return toast.error("Title required");

    const { data: record } = await supabase
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

    if (medicines.length > 0) {
      await supabase.from("prescriptions").insert(
        medicines.map(m => ({ ...m, record_id: record.id }))
      );
    }

    toast.success("Saved");
    setTitle(""); setDescription(""); setMedicines([]);
    openPatient(selected);
  };

  const bookedCount = filtered.length;
  const capacity = filtered[0]?.appointments?.max_patients || MAX_PATIENTS;

  return (
    <div className="space-y-8 max-w-6xl">

      <h1 className="text-3xl font-bold font-exo2">Booked Patients</h1>

      {!selected ? (
        <>
          {/* FILTER */}
          <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border px-4 py-2 rounded"
            />
            <button
              onClick={applyFilter}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg"
            >
              View Slot
            </button>
          </div>

          {/* DONUT GRAPH */}
          {filtered.length > 0 && (
            <SlotChart booked={bookedCount} capacity={capacity} />
          )}

          {/* FIFO LIST */}
          <div className="space-y-4">
            {filtered.map((b, i) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-xl shadow flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {i + 1}. {b.profiles?.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {b.profiles?.gender}, {b.profiles?.age} yrs
                  </p>
                </div>

                <button
                  onClick={() => openPatient(b)}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  Open
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-gray-500">No patients for this slot.</p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500">← Back</button>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold text-lg">Patient Overview</h2>
            <p><b>Name:</b> {patient?.full_name}</p>
            <p><b>Age:</b> {patient?.age}</p>
            <p><b>Gender:</b> {patient?.gender}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h3 className="font-semibold">New Consultation</h3>

            <input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <textarea
              placeholder="Diagnosis"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border p-2 w-full rounded"
            />

            {medicines.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input placeholder="Medicine" onChange={e => updateMedicine(i, "medicine_name", e.target.value)} className="border p-2 rounded"/>
                <input placeholder="Dosage" onChange={e => updateMedicine(i, "dosage", e.target.value)} className="border p-2 rounded"/>
              </div>
            ))}

            <div className="flex gap-6">
              <button onClick={addMedicine} className="text-blue-600">+ Add medicine</button>
              <button onClick={saveConsultation} className="bg-green-600 text-white px-6 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------ Donut Chart ------------------ */

const SlotChart = ({ booked, capacity }) => {
  const percent = Math.min(100, (booked / capacity) * 100);
  const strokeDash = `${percent} ${100 - percent}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow w-fit">
      <h3 className="font-semibold mb-2">Slot Occupancy</h3>

      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray={strokeDash}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center font-semibold">
          {booked}/{capacity}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
