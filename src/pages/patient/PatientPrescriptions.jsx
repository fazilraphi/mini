import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";

const PatientPrescriptions = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const downloadPDF = (record) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER (HealthSync Branding)
    // Dark slate background for header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("HealthSync", 20, 26);

    // Subtitle right aligned
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official E-Prescription", pageWidth - 20, 26, { align: "right" });

    // Reset text color to black for body
    doc.setTextColor(0, 0, 0);

    // 2. DOCTOR & RECORD DETAILS
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Dr. ${record.doctor?.full_name || "Unknown"}`, 20, 55);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("General Physician", 20, 62);
    doc.text("HealthSync Digital Clinic Partner", 20, 69);
    doc.setTextColor(0, 0, 0);

    // Record details on the right
    const dateStr = new Date(record.created_at).toLocaleDateString();
    const timeStr = new Date(record.created_at).toLocaleTimeString();
    doc.setFontSize(10);
    doc.text(`Date: ${dateStr}`, pageWidth - 20, 55, { align: "right" });
    doc.text(`Time: ${timeStr}`, pageWidth - 20, 62, { align: "right" });
    doc.text(`Ref ID: #${record.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 69, { align: "right" });

    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, pageWidth - 20, 75);

    // 3. CONSULTATION & CLINICAL NOTES
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Reason For Consultation:", 20, 90);
    doc.setFont("helvetica", "normal");
    doc.text(record.title || "N/A", 75, 90);

    doc.setFont("helvetica", "bold");
    doc.text("Clinical Notes & Diagnosis:", 20, 105);
    doc.setFont("helvetica", "normal");
    const notesArr = doc.splitTextToSize(record.description || "No specific clinical notes provided.", pageWidth - 40);
    doc.text(notesArr, 20, 115);

    let startY = 115 + (notesArr.length * 6) + 10;

    // 4. MEDICINES (Rx Section)
    // Rx Logo simulation
    doc.setFontSize(26);
    doc.setFont("times", "italic");
    doc.text("Rx", 20, startY);

    startY += 8;

    // Table Header
    doc.setFillColor(244, 246, 248);
    doc.rect(20, startY, pageWidth - 40, 10, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Medicine Name", 25, startY + 7);
    doc.text("Dosage", 100, startY + 7);
    doc.text("Frequency", 140, startY + 7);
    doc.text("Duration", 170, startY + 7);

    startY += 15;
    doc.setFont("helvetica", "normal");

    record.prescriptions?.forEach((p, i) => {
      doc.text(`${i + 1}.  ${p.medicine_name}`, 25, startY);
      doc.text(p.dosage || "-", 100, startY);
      doc.text(p.frequency || "-", 140, startY);
      doc.text(p.duration || "-", 170, startY);

      doc.setDrawColor(240, 240, 240);
      doc.line(20, startY + 3, pageWidth - 20, startY + 3);

      startY += 10;
    });

    // 5. SIGNATURE & FOOTER
    const pageHeight = doc.internal.pageSize.getHeight();

    // Digital Signature Area
    doc.setDrawColor(0, 0, 0);
    // simulated digital stamp/symbol
    doc.setFillColor(15, 23, 42);
    doc.rect(pageWidth - 70, pageHeight - 65, 50, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("E-APPROVED", pageWidth - 45, pageHeight - 56, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Digitally Signed by Dr. ${record.doctor?.full_name || "Unknown"}`, pageWidth - 45, pageHeight - 45, { align: "center" });

    // Official Footer text
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("This document is an electronically generated and officially authorized prescription by HealthSync.", pageWidth / 2, pageHeight - 20, { align: "center" });
    doc.text("Valid at all registered pharmacies. Do not dispense if information appears altered or tampered with.", pageWidth / 2, pageHeight - 15, { align: "center" });

    doc.save(`HealthSync_Prescription_${record.id.slice(0, 8)}.pdf`);
  };

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
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          My Prescriptions
        </h1>
        <p className="text-gray-500 mt-2">
          View your past consultations and prescribed medicines
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow animate-pulse space-y-4"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && records.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow text-center text-gray-500">
          No prescriptions yet
        </div>
      )}

      {/* RECORDS */}
      {!loading && records.length > 0 && (
        <div className="space-y-8">

          {records.map((record) => (

            <div
              key={record.id}
              className="bg-white rounded-2xl shadow p-8 flex flex-col lg:flex-row gap-8"
            >

              {/* LEFT SECTION */}
              <div className="flex-1 space-y-6">

                {/* CATEGORY + DATE */}
                <div className="flex justify-between items-start">

                  <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                    Consultation
                  </span>

                  <div className="text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleString()}
                  </div>

                </div>

                {/* TITLE */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {record.title}
                </h2>

                {/* DOCTOR */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center">
                    👨‍⚕️
                  </div>

                  <div>
                    <p className="font-medium">
                      Dr. {record.doctor?.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      General Physician
                    </p>
                  </div>
                </div>

                {/* CLINICAL NOTES */}
                {record.description && (
                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs font-semibold text-blue-600 mb-2">
                      CLINICAL NOTES
                    </p>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {record.description}
                    </p>

                  </div>
                )}

              </div>

              {/* RIGHT SECTION (MEDICINES) */}
              <div className="w-full lg:w-80 space-y-4">

                <p className="text-sm font-semibold text-gray-600">
                  Prescribed Medicines
                </p>

                {record.prescriptions?.length > 0 ? (
                  record.prescriptions.map((p) => (

                    <div
                      key={p.id}
                      className="border rounded-xl p-4 space-y-2"
                    >

                      <div className="flex justify-between items-center">

                        <p className="font-semibold">
                          {p.medicine_name}
                        </p>

                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          ACTIVE
                        </span>

                      </div>

                      <p className="text-sm text-gray-500">
                        {p.dosage} • {p.frequency}
                      </p>

                      {p.duration && (
                        <p className="text-xs text-gray-400">
                          Duration: {p.duration}
                        </p>
                      )}

                    </div>

                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No medicines added.
                  </p>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-4">

                  <button
                    onClick={() => downloadPDF(record)}
                    className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-sm hover:bg-blue-50"
                  >
                    Download PDF
                  </button>

                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Order Refill
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;