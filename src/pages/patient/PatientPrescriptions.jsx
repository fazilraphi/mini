import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";

const PatientPrescriptions = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const downloadPDF = async (record) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. HEADER (HealthSync Branding)
    // Cyan background for header
    doc.setFillColor(11, 197, 234); // #0BC5EA
    doc.rect(0, 0, pageWidth, 45, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text("HealthSync", 20, 30);

    // Subtitle right aligned
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official E-Prescription", pageWidth - 20, 30, { align: "right" });

    // Body text color reset
    doc.setTextColor(30, 30, 30);

    // 2. DOCTOR & RECORD DETAILS
    // Add Doctor Image if available
    if (record.doctor?.avatar_url) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = record.doctor.avatar_url;
        });
        doc.addImage(img, "JPEG", 20, 50, 20, 20);
      } catch (e) {
        console.error("Could not add doctor image to PDF", e);
      }
    }

    const doctorTextX = record.doctor?.avatar_url ? 45 : 20;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Dr. ${record.doctor?.full_name || "Unknown"}`, doctorTextX, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(record.doctor?.speciality || "General Physician", doctorTextX, 67);
    doc.text("HealthSync Digital Clinic Partner", doctorTextX, 74);

    // Record details on the right
    const dateObj = new Date(record.created_at);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    doc.setTextColor(30, 30, 30);
    doc.text(`Date: ${dateStr}`, pageWidth - 20, 60, { align: "right" });
    doc.text(`Time: ${timeStr}`, pageWidth - 20, 67, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`Ref ID: #${record.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 74, { align: "right" });

    // Divider Line
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 82, pageWidth - 20, 82);

    // 3. CONSULTATION & CLINICAL NOTES
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("Reason For Consultation:", 20, 100);
    doc.setFont("helvetica", "normal");
    doc.text(record.title || "Health Checkup", 75, 100);

    doc.setFont("helvetica", "bold");
    doc.text("Clinical Notes & Diagnosis:", 20, 115);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const notesArr = doc.splitTextToSize(record.description || "Patient is secure and healthy.", pageWidth - 40);
    doc.text(notesArr, 20, 125);

    let startY = 125 + (notesArr.length * 6) + 15;

    // 4. MEDICINES (Rx Section)
    doc.setFontSize(28);
    doc.setFont("times", "italic");
    doc.text("Rx", 20, startY);

    startY += 10;

    // Table Header
    doc.setFillColor(235, 235, 235); // Light grey table header
    doc.rect(20, startY, pageWidth - 40, 10, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Medicine Name", 25, startY + 6.5);
    doc.text("Dosage", 100, startY + 6.5);
    doc.text("Frequency", 140, startY + 6.5);
    doc.text("Duration", 175, startY + 6.5);

    startY += 18;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);

    record.prescriptions?.forEach((p, i) => {
      doc.text(`${i + 1}.  ${p.medicine_name}`, 25, startY);
      doc.text(p.dosage || "-", 100, startY);
      doc.text(p.frequency || "-", 140, startY);
      doc.text(p.duration || "-", 175, startY);

      doc.setDrawColor(240, 240, 240);
      doc.line(20, startY + 3.5, pageWidth - 20, startY + 3.5);

      startY += 10;
    });

    // 5. SIGNATURE & FOOTER
    // Digital Approval Stamp
    const stampX = pageWidth - 70;
    const stampY = pageHeight - 65;

    doc.setFillColor(11, 197, 234); // Cyan stamp
    doc.roundedRect(stampX, stampY, 50, 15, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("E-APPROVED", stampX + 25, stampY + 9.5, { align: "center" });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Digitally Signed by Dr. ${record.doctor?.full_name || "Unknown"}`, pageWidth - 20, pageHeight - 42, { align: "right" });

    // Footer Disclaimer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    const footerText1 = "This document is an electronically generated and officially authorized prescription by HealthSync.";
    const footerText2 = "Valid at all registered pharmacies. Do not dispense if information appears altered or tampered with.";
    doc.text(footerText1, pageWidth / 2, pageHeight - 20, { align: "center" });
    doc.text(footerText2, pageWidth / 2, pageHeight - 15, { align: "center" });

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
          full_name,
          speciality,
          avatar_url
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 bg-teal-50">
                    {record.doctor?.avatar_url ? (
                      <img 
                        src={record.doctor.avatar_url} 
                        alt="Doctor" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-teal-500 text-white flex items-center justify-center font-bold">
                        {record.doctor?.full_name?.charAt(0) || "D"}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">
                      Dr. {record.doctor?.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {record.doctor?.speciality || "General Physician"}
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
                    className="w-full border border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Download Prescription PDF
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