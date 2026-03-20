import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Check, X, User } from "lucide-react";

const DocRegisterer = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingDoctors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "doctor")
            .eq("status", "pending");

        if (error) {
            toast.error(error.message);
        } else {
            setPendingDoctors(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const handleUpdateStatus = async (id, status) => {

        const { error } = await supabase
            .from("profiles")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast.error(`Failed to ${status} doctor`);
            return;
        }

        toast.success(`Doctor ${status === 'active' ? 'approved' : status} successfully`);

        // refresh pending list
        fetchPendingDoctors();
    };
    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending Doctor Registrations</h2>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : pendingDoctors.length === 0 ? (
                <p className="text-gray-500">No pending registrations.</p>
            ) : (
                <div className="space-y-4">
                    {pendingDoctors.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{doc.full_name}</h3>
                                    <p className="text-sm text-gray-500">{doc.email}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <p className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">
                                            License: {doc.doctor_license || "N/A"}
                                        </p>
                                        <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                            Phone: {doc.phone || "N/A"}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">ID: {doc.id.substring(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleUpdateStatus(doc.id, "active")}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    <Check size={18} />
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(doc.id, "rejected")}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    <X size={18} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocRegisterer;
