import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, CheckCircle, BarChart as BarChartIcon, PieChart as PieChartIcon, MessageSquare, Menu, X, ShieldCheck, KeyRound } from "lucide-react";
import healthsyncLogo from "../../assets/healthsync-logo.png";

import DocRegisterer from "./DocRegisterer";
import UserDirectory from "./UserDirectory";
import AdminDoctorAnalytics from "./AdminDoctorAnalytics";
import AdminPatientAnalytics from "./AdminPatientAnalytics";
import AdminComplaints from "./AdminComplaints";
import AdminForgotPasswordRequests from "./AdminForgotPasswordRequests";

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

        // Fetch open complaints count
        const getCounts = async () => {
            const { count } = await supabase
                .from("complaints")
                .select("*", { count: 'exact', head: true })
                .eq("status", "open");
            setOpenComplaintsCount(count || 0);

            const { count: pwCount } = await supabase
                .from("forgot_password")
                .select("*", { count: 'exact', head: true })
                .eq("status", "pending");
            setPendingPasswordRequests(pwCount || 0);
        };
        getCounts();
    }, [navigate]);

    const [openComplaintsCount, setOpenComplaintsCount] = useState(0);
    const [pendingPasswordRequests, setPendingPasswordRequests] = useState(0);

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
        { id: "forgotPassword", label: "Password Resets", icon: KeyRound },
    ];

    return (
        <div className="flex h-screen w-screen bg-[#F7FAFC] font-redhat text-[#333] overflow-hidden relative">

            {/* MOBILE HEADER */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <img src={healthsyncLogo} alt="HealthSync" className="h-7 w-auto object-contain" />
                    <span className="font-extrabold text-xl text-[#0BC5EA] tracking-tight">HealthSync</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-[#0BC5EA]" />
                </div>
            </div>

            {/* OVERLAY */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-45"
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 lg:static
            `}>
                {/* Logo */}
                <div className="p-8 pb-6">
                    <div className="flex items-center gap-3">
                        <img src={healthsyncLogo} alt="HealthSync" className="h-10 w-auto object-contain" />
                        <div>
                            <div className="font-black text-lg text-gray-900 leading-none">HealthSync</div>
                            <div className="text-[10px] text-[#0BC5EA] font-extrabold tracking-widest uppercase mt-1">Admin Portal</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
                    {sidebarItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200
                                    ${isActive
                                        ? "bg-cyan-50 text-[#0BC5EA] shadow-sm shadow-cyan-100"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                                `}
                            >
                                <item.icon size={20} className={isActive ? "text-[#0BC5EA]" : "text-gray-400"} />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.id === "complaints" && openComplaintsCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                        {openComplaintsCount}
                                    </span>
                                )}
                                {item.id === "forgotPassword" && pendingPasswordRequests > 0 && (
                                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                        {pendingPasswordRequests}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile & Logout */}
                <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0BC5EA] to-[#2B6CB0] flex items-center justify-center text-white font-black shadow-md shadow-blue-100 shrink-0">
                            A
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">Administrator</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase truncate">Main Control</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT SPACE */}
            <main className="flex-1 h-full flex flex-col overflow-hidden">
                <div className="flex-1 h-full overflow-y-auto no-scrollbar p-6 lg:p-10 pt-24 lg:pt-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8 block lg:hidden">
                            <h1 className="text-2xl font-black text-gray-800 capitalize">
                                {activeTab.replace(/([A-Z])/g, ' $1').trim()}
                            </h1>
                        </div>
                        {activeTab === "directory" && <UserDirectory />}
                        {activeTab === "registrations" && <DocRegisterer />}
                        {activeTab === "docAnalytics" && <AdminDoctorAnalytics />}
                        {activeTab === "patAnalytics" && <AdminPatientAnalytics />}
                        {activeTab === "complaints" && <AdminComplaints />}
                        {activeTab === "forgotPassword" && <AdminForgotPasswordRequests />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
