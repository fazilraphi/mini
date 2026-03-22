import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Mail, Clock, CheckCircle, AlertCircle, RefreshCw, Search, Filter } from "lucide-react";

const AdminForgotPasswordRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("forgot_password")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching forgot password requests:", error);
            toast.error("Failed to load requests");
        } else {
            setRequests(data || []);
        }

        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRequests();
        setRefreshing(false);
        toast.success("Refreshed!");
    };

    const markAsResolved = async (id) => {
        const { error } = await supabase
            .from("forgot_password")
            .update({ status: "resolved" })
            .eq("id", id);

        if (error) {
            toast.error("Failed to update status");
            return;
        }

        setRequests(prev =>
            prev.map(r => r.id === id ? { ...r, status: "resolved" } : r)
        );
        toast.success("Marked as resolved");
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTimeSince = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        return `${days}d ago`;
    };

    // Filter and search
    const filteredRequests = requests.filter(r => {
        const matchesStatus = filterStatus === "all" || r.status === filterStatus;
        const matchesSearch = !searchQuery || r.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = requests.filter(r => r.status === "pending").length;
    const resolvedCount = requests.filter(r => r.status === "resolved").length;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Password Reset Requests
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Manage forgot password requests from users
                    </p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Mail size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{requests.length}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Total Requests</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <AlertCircle size={18} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Pending</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <CheckCircle size={18} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-green-600">{resolvedCount}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Resolved</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-50 transition-all">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-semibold text-gray-700 placeholder-gray-300"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    {["all", "pending", "resolved"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                                filterStatus === status
                                    ? "bg-cyan-50 text-cyan-600 border border-cyan-200"
                                    : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-24 border border-gray-100" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredRequests.length === 0 && (
                <div className="bg-white rounded-2xl p-12 shadow-sm text-center border border-gray-100">
                    <Mail size={40} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-600">No requests found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {filterStatus !== "all" || searchQuery
                            ? "Try changing your filters"
                            : "No password reset requests yet"
                        }
                    </p>
                </div>
            )}

            {/* Requests List */}
            {!loading && filteredRequests.length > 0 && (
                <div className="space-y-3">
                    {filteredRequests.map(request => (
                        <div
                            key={request.id}
                            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                                request.status === "pending"
                                    ? "border-amber-100 border-l-4 border-l-amber-400"
                                    : "border-gray-100 border-l-4 border-l-green-400"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                                {/* Left Info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        request.status === "pending"
                                            ? "bg-amber-50"
                                            : "bg-green-50"
                                    }`}>
                                        {request.status === "pending"
                                            ? <AlertCircle size={20} className="text-amber-500" />
                                            : <CheckCircle size={20} className="text-green-500" />
                                        }
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-bold text-gray-900 truncate">
                                            {request.email}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                <Clock size={12} />
                                                {formatDate(request.created_at)}
                                            </span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs text-gray-400 font-semibold">
                                                {getTimeSince(request.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${
                                        request.status === "pending"
                                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                                            : "bg-green-50 text-green-600 border border-green-200"
                                    }`}>
                                        {request.status}
                                    </span>

                                    {request.status === "pending" && (
                                        <button
                                            onClick={() => markAsResolved(request.id)}
                                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                        >
                                            <CheckCircle size={14} />
                                            Resolve
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default AdminForgotPasswordRequests;
