import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const PatientPrescriptions = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

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

    if (!error) setRecords(data || []);
    else console.error(error);

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Prescriptions
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View your past consultations and prescribed medicines
        </p>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow animate-pulse space-y-3"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && records.length === 0 && (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          No prescriptions yet.
        </div>
      )}

      {/* RECORDS */}
      {!loading && records.length > 0 && (
        <div className="space-y-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition space-y-5"
            >
              {/* HEADER */}
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {record.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Consulted by{" "}
                  <span className="font-medium text-orange-600">
                    Dr. {record.doctor?.full_name || "Unknown"}
                  </span>
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(record.created_at).toLocaleString()}
                </p>
              </div>

              {/* DESCRIPTION */}
              {record.description && (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {record.description}
                  </p>
                </div>
              )}

              {/* MEDICINES */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Prescribed Medicines
                </h3>

                {record.prescriptions?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {record.prescriptions.map((p) => (
                      <div
                        key={p.id}
                        className="border rounded-xl p-4 bg-orange-50 text-sm space-y-1"
                      >
                        <p>
                          <span className="font-medium text-gray-800">Medicine:</span>{" "}
                          {p.medicine_name}
                        </p>

                        <p>
                          <span className="font-medium text-gray-800">Dosage:</span>{" "}
                          {p.dosage}
                        </p>

                        {p.frequency && (
                          <p>
                            <span className="font-medium text-gray-800">Frequency:</span>{" "}
                            {p.frequency}
                          </p>
                        )}

                        {p.duration && (
                          <p>
                            <span className="font-medium text-gray-800">Duration:</span>{" "}
                            {p.duration}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No medicines added for this consultation.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
