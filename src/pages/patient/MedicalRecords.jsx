import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState("consultations");
  const [records, setRecords] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [newHistory, setNewHistory] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch clinical records
    const { data: recordsData, error: recordsError } = await supabase
      .from("medical_records")
      .select(`
        *,
        doctor:doctor_id(full_name, speciality, avatar_url),
        prescriptions(*)
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (recordsError) {
      toast.error("Error fetching records: " + recordsError.message);
    } else {
      setRecords(recordsData || []);
    }

    // Fetch patient profile for medical history
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, medical_history")
      .eq("id", user.id)
      .single();

    if (profileError) {
      toast.error("Error fetching profile: " + profileError.message);
    } else {
      setProfile(profileData);
      setNewHistory(profileData?.medical_history || "");
    }

    // Fetch uploaded reports
    const { data: reportsData, error: reportsError } = await supabase
      .from("patient_reports")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (!reportsError) {
      setReports(reportsData || []);
    }

    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return toast.error("Only images and PDFs are allowed.");
    }

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('medical-reports')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medical-reports')
      .getPublicUrl(filePath);

    // 3. Save to Database
    const { error: dbError } = await supabase
      .from("patient_reports")
      .insert({
        patient_id: user.id,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type
      });

    if (dbError) {
      toast.error("Error saving report info: " + dbError.message);
    } else {
      toast.success("Report uploaded successfully.");
      fetchData();
    }
    setUploading(false);
  };

  const deleteReport = async (report) => {
    if (!window.confirm("Delete this report?")) return;

    const { error: dbError } = await supabase
      .from("patient_reports")
      .delete()
      .eq("id", report.id);

    if (dbError) {
      toast.error("Failed to delete record.");
    } else {
      // Best effort storage cleanup
      const path = report.file_url.split('/medical-reports/').pop();
      await supabase.storage.from('medical-reports').remove([path]);
      
      toast.success("Report removed.");
      setReports(reports.filter(r => r.id !== report.id));
    }
  };

  const updateMedicalHistory = async () => {
    if (!profile) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ medical_history: newHistory })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update health record: " + error.message);
    } else {
      toast.success("Health record updated professionally.");
      setProfile({ ...profile, medical_history: newHistory });
      setIsEditingHistory(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading medical history...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
        <p className="text-gray-500 mt-2">Manage and view your professional medical history</p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-[#F6F8FB] pt-2 z-10">
        <button
          onClick={() => setActiveTab("consultations")}
          className={`pb-4 px-6 text-sm font-semibold transition-colors relative ${
            activeTab === "consultations" ? "text-cyan-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Clinical Consultations
          {activeTab === "consultations" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`pb-4 px-6 text-sm font-semibold transition-colors relative ${
            activeTab === "personal" ? "text-cyan-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Personal Health Record
          {activeTab === "personal" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-600"></div>
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {activeTab === "consultations" ? (
          <div className="space-y-6">
            {records.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
                <div className="text-4xl mb-4">🩺</div>
                <h3 className="text-xl font-semibold text-gray-700">No Professional Consultations Found</h3>
                <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                  Once you have a consultation with a doctor, your clinical notes and prescriptions will appear here.
                </p>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{record.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Consultation
                        </span>
                        <span className="text-gray-400 text-xs font-medium">
                          • {new Date(record.created_at).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">Dr. {record.doctor?.full_name}</p>
                        <p className="text-xs text-cyan-600 font-medium">{record.doctor?.speciality}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-50 bg-cyan-50">
                        {record.doctor?.avatar_url ? (
                          <img 
                            src={record.doctor.avatar_url} 
                            alt="Doctor" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cyan-600 font-bold">
                            {record.doctor?.full_name?.charAt(0) || "D"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Notes</h4>
                    <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {record.description}
                    </p>
                  </div>

                  {record.prescriptions?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Prescribed Medications</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {record.prescriptions.map((p) => (
                          <div key={p.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                              💊
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{p.medicine_name}</p>
                              <p className="text-xs text-gray-500">
                                {p.dosage} • {p.frequency} • {p.duration}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* PERSONAL HEALTH RECORD TAB */
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Personal Health History</h3>
                  <p className="text-sm text-gray-500 mt-1">Information you've added about your allergies, past surgeries, or chronic conditions.</p>
                </div>
                {!isEditingHistory && (
                  <button
                    onClick={() => setIsEditingHistory(true)}
                    className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-sm px-4 py-2 rounded-lg border border-cyan-100 hover:bg-cyan-50 transition-all"
                  >
                    <span>✎</span> Edit History
                  </button>
                )}
              </div>
              
              {/* History content remains same... */}
              {isEditingHistory ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 flex gap-3 items-start mb-2">
                    <span className="text-lg">💡</span>
                    <p className="text-xs text-cyan-800 leading-relaxed font-medium">
                      Enter your medical conditions, allergies, or past surgeries separated by commas for better visibility. Doctors will see this information to provide better care.
                    </p>
                  </div>
                  <textarea
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    placeholder="e.g. Type 2 Diabetes, Penicillin Allergy, Appendectomy (2018)"
                    className="w-full min-h-[200px] bg-gray-50 border border-gray-200 rounded-2xl p-6 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all resize-none shadow-inner"
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end mt-4">
                    <button
                      onClick={() => {
                        setNewHistory(profile?.medical_history || "");
                        setIsEditingHistory(false);
                      }}
                      className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateMedicalHistory}
                      className="px-8 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 shadow-md shadow-cyan-100 active:transform active:scale-95 transition-all"
                    >
                      Save History
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {profile?.medical_history ? (
                    <div className="flex flex-wrap gap-3">
                      {profile.medical_history.split(',').map((item, idx) => (
                        <div key={idx} className="bg-gray-100 border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-3 group hover:bg-white hover:border-cyan-200 hover:shadow-sm transition-all">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform"></span>
                          <span className="text-gray-700 font-bold text-sm">{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">Your medical history is currently empty.</p>
                      <button
                        onClick={() => setIsEditingHistory(true)}
                        className="mt-4 text-cyan-600 font-bold text-sm hover:underline"
                      >
                        Click here to add your health information
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LAB REPORTS & DOCUMENTS SECTION */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Lab Reports & Documents</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload and manage your digital lab results, X-rays, and other medical papers.</p>
                </div>
                <label className={`flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-800 transition-all active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? 'Uploading...' : '+ Upload Document'}
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept="image/*,.pdf"
                  />
                </label>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="text-3xl mb-3">📄</div>
                  <p className="text-gray-400 font-medium text-sm">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map((report) => (
                    <div key={report.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-cyan-200 hover:shadow-lg transition-all">
                      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                        {report.file_type.startsWith('image/') ? (
                          <img 
                            src={report.file_url} 
                            alt={report.file_name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl">
                            PDF
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                          <a 
                            href={report.file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                            title="View Image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </a>
                          <button 
                            onClick={() => deleteReport(report)}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                            title="Delete File"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold text-gray-800 truncate" title={report.file_name}>
                          {report.file_name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                          Added on {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">⚠️</span>
                  <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider">Note for Doctors</h4>
                </div>
                <p className="text-sm text-orange-700 leading-relaxed font-medium">
                  Doctors you have an appointment with will be able to see these reports to assist in your diagnosis.
                </p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🔒</span>
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Secure Storage</h4>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed font-medium">
                  Your medical data is encrypted and stored securely on our HealthSync infrastructure.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
