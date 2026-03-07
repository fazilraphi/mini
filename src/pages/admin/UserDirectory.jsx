import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const UserDirectory = () => {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);

            const { data: patients } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "patient");

            const { data: doctors } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "doctor")
                .eq("status", "active");

            setPatients(patients || []);
            setDoctors(doctors || []);

            setLoading(false);
        };

        fetchUsers();
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">User Directory</h2>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-lg font-medium opacity-80 mb-2">Total Patients</h3>
                    <p className="text-5xl font-bold">{patients.length}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-lg font-medium opacity-80 mb-2">Approved Doctors</h3>
                    <p className="text-5xl font-bold">{doctors.length}</p>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading user lists...</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* PATIENTS LIST */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Patients</h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {patients.length === 0 ? (
                                <p className="text-sm text-gray-400">No patients registered.</p>
                            ) : (
                                patients.map((pat) => (
                                    <div key={pat.id} className="flex flex-col p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <span className="font-semibold text-gray-800">{pat.full_name || "Unknown Patient"}</span>
                                        <span className="text-xs text-gray-500 mt-1">ID: {pat.id}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* DOCTORS LIST */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Doctors</h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {doctors.length === 0 ? (
                                <p className="text-sm text-gray-400">No approved doctors available.</p>
                            ) : (
                                doctors.map((doc) => (
                                    <div key={doc.id} className="flex flex-col p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <span className="font-semibold text-gray-800">{doc.full_name || "Unknown Doctor"}</span>
                                        <span className="text-xs text-gray-500 mt-1 text-cyan-500">
                                            {doc.specialty || "General Medicine"}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDirectory;
