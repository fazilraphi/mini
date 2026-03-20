import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Search, Bell, ChevronRight, Users, Calendar, CheckCircle, Play, PieChart as PieIcon } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

const DoctorDashboardHome = ({ onNavigate, profile: initialProfile }) => {
    const [stats, setStats] = useState({ totalPatients: 0, appointmentsToday: 0, completed: 0 });
    const [doctorProfile, setDoctorProfile] = useState({ full_name: "Doctor", speciality: "" });
    const [nextPatient, setNextPatient] = useState(null);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile if not provided by prop
            if (initialProfile) {
                setDoctorProfile(initialProfile);
            } else {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, speciality")
                    .eq("id", user.id)
                    .single();
                if (profile) setDoctorProfile(profile);
            }

            // Fetch stats and queue
            const { data: bookings } = await supabase
                .from("appointment_bookings")
                .select(`
                    id, 
                    patient_id,
                    booked_at, 
                    status,
                    appointments(date), 
                    profiles:patient_id(full_name, age, gender, medical_history)
                `)
                .eq("doctor_id", user.id);

            if (bookings) {
                const todayStr = new Date().toISOString().split("T")[0];
                const todayBookings = bookings.filter(b => b.appointments?.date === todayStr);
                const completedCount = bookings.filter(b => b.status === "Completed").length;

                setStats({
                    totalPatients: [...new Set(bookings.map(b => b.patient_id))].length,
                    appointmentsToday: todayBookings.length,
                    completed: completedCount
                });

                const pendingQueue = todayBookings.filter(b => b.status === "Upcoming" || b.status === "Active");
                setQueue(pendingQueue);
                if (pendingQueue.length > 0) {
                    setNextPatient(pendingQueue[0]);
                }
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="flex flex-col font-redhat text-[#333] animate-fadeIn">
            {/* Header */}
            <header className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Hi {(initialProfile?.full_name || doctorProfile.full_name)?.split(' ')[0] || "Doctor"} 👋,</h1>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-50">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                            <Calendar size={18} />
                        </div>
                        <span className="font-bold text-sm">Today: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="p-1 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center">
                        <NotificationBell />
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column (Main) */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

                    {/* Hero Banner */}
                    <div className="relative h-48 rounded-[32px] bg-gradient-to-r from-[#27AE60] to-[#2ECC71] overflow-hidden p-8 text-white flex items-center shadow-lg">
                        <div className="z-10 max-w-md">
                            <h2 className="text-2xl font-bold mb-2">Manage your consultations easily</h2>
                            <p className="text-white/80 text-sm mb-4">You have {stats.appointmentsToday} appointments scheduled for today. Ready to start?</p>
                            <button
                                onClick={() => onNavigate('appointments')}
                                className="px-6 py-2.5 bg-white text-[#27AE60] font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                Start Consulting
                            </button>
                        </div>
                        <div className="absolute right-8 bottom-0 w-64 h-full flex items-end justify-center">
                            <div className="w-48 h-56 bg-white/10 rounded-t-full relative overflow-hidden flex items-center justify-center">
                                <Users size={80} className="text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Today's Specialist Box (Patients Queue) */}
                    <div className="seba-card flex-1 p-6 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Patient Queue</h3>
                            <button
                                onClick={() => onNavigate('appointments')}
                                className="text-sm font-bold text-[#0BC5EA] flex items-center gap-1 hover:underline"
                            >
                                View All <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {queue.map((item, idx) => (
                                <div key={item.id} className="min-w-[160px] p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center hover:border-[#0BC5EA] transition-all cursor-pointer group">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0BC5EA] to-[#2D9CDB] flex items-center justify-center text-white font-bold text-lg">
                                            {item.profiles?.full_name?.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm truncate w-full">{item.profiles?.full_name}</div>
                                    <div className="text-[11px] text-gray-400 mt-1">{item.profiles?.age} yrs • {item.profiles?.gender}</div>
                                </div>
                            ))}
                            {queue.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center py-8 text-gray-400">
                                    <Users size={40} className="mb-2 opacity-20" />
                                    <p>No patients in queue</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Featured Consultations (Recent Activity) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Next Consultation</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {nextPatient ? (
                                <div className="seba-card p-4 flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-600 font-bold text-xl">
                                            {nextPatient.profiles?.full_name?.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">{nextPatient.profiles?.full_name}</div>
                                        <div className="text-xs text-gray-400 mt-1 italic">Waiting for consultation...</div>
                                        <button
                                            onClick={() => onNavigate('prescriptions')}
                                            className="mt-2 text-[#0BC5EA] text-xs font-bold flex items-center gap-1 group hover:underline"
                                        >
                                            Get Consultation <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="seba-card p-8 col-span-2 text-center text-gray-400">
                                    No immediate consultations
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Stats & Sidebar) */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">

                    {/* Compact Stat Card */}
                    <div className="bg-[#9B51E0] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg">
                        <div className="relative z-10">
                            <div className="text-5xl font-bold mb-2">{stats.totalPatients}</div>
                            <div className="text-sm font-medium opacity-80 leading-snug max-w-[120px]">
                                Total patients you have treated
                            </div>
                        </div>
                        <div className="absolute right-2 bottom-2 opacity-20 transform rotate-12">
                            <Users size={120} />
                        </div>
                    </div>

                    {/* Small Quick Action Cards */}
                    <div className="seba-card p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold">Quick Metrics</h3>
                            <button
                                onClick={() => onNavigate('appointments')}
                                className="text-xs font-bold text-[#0BC5EA] hover:underline"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4 overflow-y-auto no-scrollbar pr-2">
                            {[
                                { title: "Completed", value: stats.completed, color: "text-[#27AE60]", bg: "bg-[#E8F5E9]" },

                            ].map((metric, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                                    <span className="text-sm font-semibold text-gray-500">{metric.title}</span>
                                    <span className={`text-sm font-black p-2 rounded-xl min-w-[32px] text-center ${metric.bg} ${metric.color}`}>
                                        {metric.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100 overflow-hidden">
                            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <PieIcon size={16} className="text-[#9B51E0]" />
                                Patient Distribution
                            </h4>
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#F2E7FE" strokeWidth="4" />
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#9B51E0" strokeWidth="4"
                                            strokeDasharray="75, 100" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-bold">
                                        <span className="text-[#9B51E0]">75%</span>
                                        <span className="text-gray-400">New</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#9B51E0]"></div>
                                        <span className="text-[11px] font-bold text-gray-500">New Patients (75%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#F2E7FE] border border-[#9B51E0]/20"></div>
                                        <span className="text-[11px] font-bold text-gray-400">Regular (25%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DoctorDashboardHome;
