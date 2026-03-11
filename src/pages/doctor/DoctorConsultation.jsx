import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const DoctorConsultation = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [meds, setMeds] = useState([
    { medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }
  ]);

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("appointment_bookings")
      .select(
        `id, patient_id, appointments(date), profiles:patient_id(full_name,age,gender,phone,medical_history)`
      )
      .eq("doctor_id", user.id);

    const filtered = (data || []).filter(
      (b) => b.appointments?.date === selectedDate
    );

    setBookings(filtered);
    setSelected(null);
    setHistory([]);
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
      { medicine_name: "", dosage: "", frequency: "Once a day", duration: "5 Days" }
    ]);
  };

  const deleteRow = (index) => {
    const copy = meds.filter((_, i) => i !== index);
    setMeds(copy.length ? copy : [
      { medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }
    ]);
  };

  const updateMed = (i, field, value) => {
    const copy = [...meds];
    copy[i][field] = value;
    setMeds(copy);
  };

  const saveRecord = async () => {
    if (!selected) return toast.error("Select a patient first");

    const { data: { user } } = await supabase.auth.getUser();

    const { data: record, error } = await supabase
      .from("medical_records")
      .insert({
        patient_id: selected.patient_id,
        doctor_id: user.id,
        title,
        description
      })
      .select()
      .single();

    if (error) return toast.error(error.message);

    const medsPayload = meds.filter((m) => m.medicine_name.trim() !== "");

    if (medsPayload.length > 0) {
      await supabase.from("prescriptions").insert(
        medsPayload.map((m) => ({
          ...m,
          record_id: record.id
        }))
      );
    }

    toast.success("Consultation saved");

    setTitle("");
    setDescription("");
    setMeds([
      { medicine_name: "", dosage: "", frequency: "Twice a day", duration: "7 Days" }
    ]);

    loadHistory(selected.patient_id);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center px-8 py-5 border-b bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Active Consultations
          </h1>
          <p className="text-sm text-gray-500">
            Manage clinical sessions and record patient history
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Patient Queue */}
        <div className="w-[320px] border-r bg-white flex flex-col">

          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold text-gray-700">
              Patient Queue
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">

            {bookings.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-6">
                No patients scheduled
              </p>
            )}

            {bookings.map((b, i) => {
              const active = selected?.id === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => handleSelect(b)}
                  className={`p-3 rounded-lg cursor-pointer border transition
                  ${active
                      ? "bg-cyan-50 border-cyan-300"
                      : "hover:bg-gray-50 border-transparent"}`}
                >
                  <p className="font-semibold text-sm text-gray-800">
                    {b.profiles?.full_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {b.profiles?.gender}, {b.profiles?.age} yrs
                  </p>

                  {i === 0 && (
                    <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                      NEXT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">

          {/* Consultation */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-[520px]">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                New Consultation
              </h2>

              <span className="text-xs text-cyan-600 font-semibold">
                {selected
                  ? `Patient: ${selected.profiles?.full_name}`
                  : "Select patient"}
              </span>
            </div>

            <input
              placeholder="Consultation Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />

            <textarea
              placeholder="Clinical notes..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
            />

            {/* Prescriptions */}
            <div className="flex flex-col flex-1">

              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-700">
                  Prescriptions
                </p>

                <button
                  onClick={addRow}
                  className="text-xs text-cyan-600 font-semibold"
                >
                  + Add Medication
                </button>
              </div>

              {/* Scrollable Prescription Area */}
              <div className="overflow-y-auto border rounded-lg p-3 space-y-2 max-h-[200px] prescription-scroll">

                {meds.map((m, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 items-center">

                    <input
                      placeholder="Medicine"
                      value={m.medicine_name}
                      onChange={(e) =>
                        updateMed(i, "medicine_name", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />

                    <input
                      placeholder="Dosage"
                      value={m.dosage}
                      onChange={(e) =>
                        updateMed(i, "dosage", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />

                    <input
                      placeholder="Frequency"
                      value={m.frequency}
                      onChange={(e) =>
                        updateMed(i, "frequency", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />

                    <input
                      placeholder="Duration"
                      value={m.duration}
                      onChange={(e) =>
                        updateMed(i, "duration", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />

                    <button
                      onClick={() => deleteRow(i)}
                      className="text-red-500 text-xs font-semibold hover:text-red-600"
                    >
                      Delete
                    </button>

                  </div>
                ))}

              </div>

            </div>

            <button
              onClick={saveRecord}
              className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg text-sm font-semibold"
            >
              Save Consultation
            </button>

          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">

            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Consultation History
            </h2>

            {history.length === 0 && (
              <p className="text-sm text-gray-400">
                Select a patient to view history
              </p>
            )}

            <div className="space-y-3">

              {history.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-3 text-sm bg-gray-50"
                >
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-gray-600">{r.description}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>

      {/* Custom Blue Scrollbar */}
      <style>
        {`
        .prescription-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .prescription-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .prescription-scroll::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 10px;
        }

        .prescription-scroll::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }
        `}
      </style>

    </div>
  );
};

export default DoctorConsultation;