import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, CheckCircle } from "lucide-react";

import DocRegisterer from "./DocRegisterer";
import UserDirectory from "./UserDirectory";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("directory");

    useEffect(() => {
        // Quick auth check
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/admin");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (profile?.role !== "admin") {
                navigate("/");
            }
        };
        checkUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin");
    };

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex font-sans">
            {/* SIDEBAR */}
            <div className="w-72 bg-gray-900 text-white flex flex-col pt-8">
                <div className="px-8 mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-wide">AdminSync</span>
                </div>

                <div className="px-4 flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab("directory")}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all ${activeTab === "directory" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        <Users size={20} />
                        User Directory
                    </button>

                    <button
                        onClick={() => setActiveTab("registrations")}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all ${activeTab === "registrations" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        <CheckCircle size={20} />
                        Doc Registrations
                    </button>
                </div>

                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 rounded-xl transition"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT SPACE */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {activeTab === "directory" ? <UserDirectory /> : <DocRegisterer />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
