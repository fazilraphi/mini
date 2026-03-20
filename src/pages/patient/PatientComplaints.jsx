import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const STATUS_COLORS = {
    open: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
};

const PatientComplaints = () => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const fetchComplaints = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
            .from("complaints")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) toast.error(error.message);
        else setComplaints(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            toast.error("Please fill in both subject and message.");
            return;
        }
        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSubmitting(false); return; }

        const { error } = await supabase.from("complaints").insert({
            user_id: user.id,
            user_role: "patient",
            subject: subject.trim(),
            message: message.trim(),
            status: "open"
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Complaint submitted successfully!");
            setSubject("");
            setMessage("");
            fetchComplaints();
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Submit a Complaint</h1>
                <p className="text-gray-500 mt-1">Report an issue and we'll get back to you as soon as possible.</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5 max-w-2xl">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your complaint in detail..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
            </form>

            {/* PAST COMPLAINTS */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Your Past Complaints</h2>
                    <button
                        onClick={() => setShowHistory(o => !o)}
                        className="text-sm px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    >
                        {showHistory ? "Hide" : `Show (${complaints.length})`}
                    </button>
                </div>

                {showHistory && (
                    loading ? (
                        <p className="text-gray-400">Loading...</p>
                    ) : complaints.length === 0 ? (
                        <p className="text-gray-400">You haven't submitted any complaints yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map((c) => (
                                <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="font-semibold text-gray-800">{c.subject}</h3>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-600"}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.message}</p>
                                    <p className="text-xs text-gray-400 mt-3">{new Date(c.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default PatientComplaints;
