import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Eye, X, User, Phone, Mail, Shield, Calendar, Heart, MapPin, Droplets } from "lucide-react";

const UserDirectory = () => {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

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
                .in("status", ["active", "approved"]);

            const { count: pending } = await supabase
                .from("profiles")
                .select("*", { count: 'exact', head: true })
                .eq("role", "doctor")
                .eq("status", "pending");

            setPatients(patients || []);
            setDoctors(doctors || []);
            setPendingCount(pending || 0);

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
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative">
                    <h3 className="text-lg font-medium opacity-80 mb-2">Approved Doctors</h3>
                    <p className="text-5xl font-bold">{doctors.length}</p>
                    {pendingCount > 0 && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full animate-pulse shadow-sm">
                            {pendingCount} PENDING
                        </div>
                    )}
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
                                    <div key={pat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{pat.full_name || "Unknown Patient"}</span>
                                            <span className="text-xs text-gray-500 mt-1">ID: {pat.id.substring(0, 8)}...</span>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedUser(pat); setIsModalOpen(true); }}
                                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
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
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{doc.full_name || "Unknown Doctor"}</span>
                                            <span className="text-xs text-gray-500 mt-1 text-cyan-500">
                                                {doc.speciality || "General Medicine"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedUser(doc); setIsModalOpen(true); }}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                                <p className="text-xs opacity-80 uppercase tracking-widest mt-1">
                                    {selectedUser.role} Details
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center pb-2">
                                <div className="w-24 h-24 rounded-3xl bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center mb-2">
                                    {selectedUser.avatar_url ? (
                                        <img
                                            src={selectedUser.avatar_url}
                                            alt={selectedUser.full_name}
                                            className="w-full h-full object-cover"
                                            onClick={() => window.open(selectedUser.avatar_url, "_blank")}
                                        />
                                    ) : (
                                        <div className="text-3xl font-black text-gray-300 uppercase">
                                            {selectedUser.full_name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    selectedUser.role === 'doctor' ? 'bg-indigo-100 text-indigo-600' : 'bg-cyan-100 text-cyan-600'
                                }`}>
                                    {selectedUser.role}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                                        <p className="text-sm font-semibold text-gray-800 break-all">{selectedUser.email}</p>
                                    </div>
                                </div>

                                {selectedUser.role === "patient" ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Age</p>
                                                    <p className="text-sm font-semibold text-gray-800">{selectedUser.age || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Gender</p>
                                                    <p className="text-sm font-semibold text-gray-800 capitalize">{selectedUser.gender || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedUser.phone || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Address</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedUser.address || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                <Droplets size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Blood Group</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedUser.blood_group || "N/A"}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                    <Shield size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">License Number</p>
                                                    <p className="text-sm font-semibold text-gray-800">{selectedUser.doctor_license || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                    <Phone size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                                                    <p className="text-sm font-semibold text-gray-800">{selectedUser.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Specialization</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedUser.speciality || "General Medicine"}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 mt-4 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDirectory;
