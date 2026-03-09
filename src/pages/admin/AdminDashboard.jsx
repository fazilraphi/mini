import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, CheckCircle, BarChart as BarChartIcon, PieChart as PieChartIcon, MessageSquare, Menu, X } from "lucide-react";

import DocRegisterer from "./DocRegisterer";
import UserDirectory from "./UserDirectory";
import AdminDoctorAnalytics from "./AdminDoctorAnalytics";
import AdminPatientAnalytics from "./AdminPatientAnalytics";
import AdminComplaints from "./AdminComplaints";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("directory");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const sidebarItems = [
        { id: "directory", label: "User Directory", icon: Users },
        { id: "registrations", label: "Doc Registrations", icon: CheckCircle },
        { id: "docAnalytics", label: "Doctor Analytics", icon: BarChartIcon },
        { id: "patAnalytics", label: "Patient Analytics", icon: PieChartIcon },
        { id: "complaints", label: "Complaints", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex font-sans relative">

            {/* MOBILE HEADER */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-50 px-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="text-lg font-bold tracking-wide">AdminSync</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={16} className="text-white" />
                </div>
            </div>

            {/* OVERLAY */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <div className={`
                fixed lg:relative z-50 lg:z-auto
                w-72 bg-gray-900 text-white flex flex-col pt-8 h-screen
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="px-8 mb-12 hidden lg:flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-wide">AdminSync</span>
                </div>

                <div className="lg:hidden px-8 mb-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Management</p>
                </div>

                <div className="px-4 flex-1 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all ${activeTab === item.id
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent text-gray-400 py-4 rounded-xl transition-all font-semibold"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT SPACE */}
            <div className="flex-1 p-4 md:p-8 lg:p-12 pt-24 lg:pt-12 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto mb-10">
                    <div className="mb-8 block lg:hidden">
                        <h1 className="text-2xl font-bold text-gray-800 capitalize">
                            {activeTab.replace(/([A-Z])/g, ' $1').trim()}
                        </h1>
                    </div>
                    {activeTab === "directory" && <UserDirectory />}
                    {activeTab === "registrations" && <DocRegisterer />}
                    {activeTab === "docAnalytics" && <AdminDoctorAnalytics />}
                    {activeTab === "patAnalytics" && <AdminPatientAnalytics />}
                    {activeTab === "complaints" && <AdminComplaints />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
