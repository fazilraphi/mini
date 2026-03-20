import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState(null);

    const [replyingId, setReplyingId] = useState(null);
    const [adminMessage, setAdminMessage] = useState("");

    const fetchComplaints = async () => {
        setLoading(true);

        const { data: complaintsData, error: cError } = await supabase
            .from("complaints")
            .select("*")
            .order("created_at", { ascending: false });

        if (cError) {
            toast.error(cError.message);
            setLoading(false);
            return;
        }

        const userIds = [...new Set((complaintsData || []).map(c => c.user_id))];

        let profileMap = {};

        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, full_name, role")
                .in("id", userIds);

            (profilesData || []).forEach(p => {
                profileMap[p.id] = p;
            });
        }

        const merged = (complaintsData || []).map(c => ({
            ...c,
            profiles: profileMap[c.user_id] || null,
        }));

        setComplaints(merged);
        if (merged.length > 0) {
            toast.success(`Found ${merged.length} complaints`);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const resolveComplaint = async (complaint) => {

        if (!adminMessage.trim()) {
            toast.error("Please write a message to the user");
            return;
        }

        setUpdatingId(complaint.id);

        const { error } = await supabase
            .from("complaints")
            .update({
                status: "resolved",
                admin_response: adminMessage,
                resolved_at: new Date()
            })
            .eq("id", complaint.id);

        if (error) {
            toast.error(error.message);
            setUpdatingId(null);
            return;
        }

        const { error: notifError } = await supabase
            .from("notifications")
            .insert({
                user_id: complaint.user_id,
                title: "Complaint Resolved",
                message: adminMessage,
                read: false
            });

        if (notifError) {
            toast.error(notifError.message);
        }

        toast.success("Complaint resolved and user notified");

        setComplaints(prev =>
            prev.map(c =>
                c.id === complaint.id
                    ? { ...c, status: "resolved", admin_response: adminMessage }
                    : c
            )
        );

        setAdminMessage("");
        setReplyingId(null);
        setUpdatingId(null);
    };

    const filtered = complaints.filter(c => {
        const s = c.status || "open";
        if (filter === "all") return true;
        return s === filter;
    });

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Complaints</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Review and manage complaints from users
                    </p>
                </div>
                <button
                    onClick={fetchComplaints}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"
                    title="Refresh Complaints"
                    disabled={loading}
                >
                    REFRESH
                </button>
            </div>

            <div className="flex gap-2">
                {[
                    { id: "all", label: "All", count: complaints.length },
                    { id: "open", label: "Open", count: complaints.filter(c => (c.status || "open") === "open").length },
                    { id: "resolved", label: "Resolved", count: complaints.filter(c => c.status === "resolved").length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            filter === tab.id
                                ? "bg-gray-900 text-white shadow-lg"
                                : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            filter === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-gray-400">Loading complaints...</p>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
                    No complaints found
                </div>
            ) : (
                <div className="space-y-4">

                    {filtered.map((c) => (

                        <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">

                            <div className="flex flex-col gap-3">

                                <div className="flex items-center gap-3">

                                    <span className="font-bold text-gray-800">
                                        {c.profiles?.full_name || "Unknown"}
                                    </span>

                                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
                                        {c.profiles?.role || c.user_role}
                                    </span>

                                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "open"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-700"
                                        }`}>
                                        {c.status}
                                    </span>

                                </div>

                                <p className="font-semibold text-gray-700 text-sm">
                                    {c.subject}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {c.message}
                                </p>

                                {c.admin_response && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                                        <strong>Admin Response:</strong> {c.admin_response}
                                    </div>
                                )}

                                {c.status === "open" && replyingId !== c.id && (

                                    <button
                                        onClick={() => setReplyingId(c.id)}
                                        className="self-start border border-green-500 text-green-600 px-4 py-2 rounded-lg text-sm"
                                    >
                                        Resolve & Message User
                                    </button>

                                )}

                                {replyingId === c.id && (

                                    <div className="space-y-3">

                                        <textarea
                                            placeholder="Write a message to the user..."
                                            value={adminMessage}
                                            onChange={(e) => setAdminMessage(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                                            rows={3}
                                        />

                                        <button
                                            onClick={() => resolveComplaint(c)}
                                            disabled={updatingId === c.id}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                        >
                                            Send Message & Resolve
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>

                    ))}

                </div>
            )}
        </div>
    );
};

export default AdminComplaints;