import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const STATUS_COLORS = {
    open: { bg: "#FEF9C3", color: "#92400E" },
    resolved: { bg: "#DCFCE7", color: "#166534" },
};

const DoctorComplaints = () => {
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
            user_role: "doctor",
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

    const card = {
        background: "#fff",
        borderRadius: 16,
        padding: "28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        border: "1px solid #E2E8F0",
    };

    return (
        <div style={{ width: "100%", maxWidth: 1000 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A202C" }}>Submit a Complaint</h1>
                <p style={{ color: "#718096", marginTop: 4, fontSize: 14 }}>
                    Report an issue or concern and we'll review it promptly.
                </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 32, maxWidth: 640 }}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4A5568", marginBottom: 6 }}>
                        Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        style={{
                            width: "100%", border: "1px solid #CBD5E0", borderRadius: 10,
                            padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
                        }}
                    />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4A5568", marginBottom: 6 }}>
                        Message
                    </label>
                    <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your complaint in detail..."
                        style={{
                            width: "100%", border: "1px solid #CBD5E0", borderRadius: 10,
                            padding: "10px 14px", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        background: submitting ? "#90CDF4" : "#0BC5EA",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: "11px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                >
                    {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
            </form>

            {/* PAST COMPLAINTS */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A202C", margin: 0 }}>Your Past Complaints</h2>
                <button
                    onClick={() => setShowHistory(o => !o)}
                    style={{
                        fontSize: 13, fontWeight: 600, padding: "8px 18px",
                        borderRadius: 10, border: "1px solid #E2E8F0",
                        background: showHistory ? "#EBF8FF" : "#fff",
                        color: showHistory ? "#0BC5EA" : "#4A5568",
                        cursor: "pointer",
                    }}
                >
                    {showHistory ? "Hide" : `Show (${complaints.length})`}
                </button>
            </div>
            {showHistory && (
                loading ? (
                    <p style={{ color: "#A0AEC0" }}>Loading...</p>
                ) : complaints.length === 0 ? (
                    <p style={{ color: "#A0AEC0" }}>You haven't submitted any complaints yet.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {complaints.map((c) => (
                            <div key={c.id} style={card}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12 }}>
                                    <span style={{ fontWeight: 600, color: "#1A202C", fontSize: 15 }}>{c.subject}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                                        background: STATUS_COLORS[c.status]?.bg || "#F3F4F6",
                                        color: STATUS_COLORS[c.status]?.color || "#374151",
                                    }}>
                                        {c.status?.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ fontSize: 14, color: "#4A5568", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{c.message}</p>
                                <p style={{ fontSize: 12, color: "#A0AEC0", marginTop: 12 }}>{new Date(c.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default DoctorComplaints;




