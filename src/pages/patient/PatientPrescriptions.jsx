import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const PatientPrescriptions = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("medical_records")
      .select(`
        id,
        title,
        description,
        created_at,
        doctor:profiles!medical_records_doctor_profiles_fkey (
          full_name
        ),
        prescriptions (
          id,
          medicine_name,
          dosage,
          frequency,
          duration
        )
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRecords(data || []);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Prescriptions</h1>

      {records.length === 0 && (
        <p className="text-gray-500">No prescriptions yet.</p>
      )}

      {records.map((record) => (
        <div key={record.id} className="bg-white p-5 rounded-xl shadow space-y-3">
          {/* Header */}
          <div>
            <p className="font-semibold text-lg">{record.title}</p>
            <p className="text-sm text-gray-500">
              Consulted by:{" "}
              <span className="font-medium">
                Dr. {record.doctor?.full_name || "Unknown"}
              </span>
            </p>
            <p className="text-xs text-gray-400">
              {new Date(record.created_at).toLocaleString()}
            </p>
          </div>

          {/* Description */}
          {record.description && (
            <p className="text-gray-700">{record.description}</p>
          )}

          {/* Medicines */}
          <div className="pt-2 space-y-2">
            <p className="font-medium">Prescribed Medicines:</p>

            {record.prescriptions?.length > 0 ? (
              record.prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-3 text-sm bg-gray-50"
                >
                  <p><span className="font-medium">Medicine:</span> {p.medicine_name}</p>
                  <p><span className="font-medium">Dosage:</span> {p.dosage}</p>
                  {p.frequency && <p><span className="font-medium">Frequency:</span> {p.frequency}</p>}
                  {p.duration && <p><span className="font-medium">Duration:</span> {p.duration}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No medicines added.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientPrescriptions;
