import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import VideoCall from "../../components/Videocall";

const MyAppointments = ({ statusFilter = "all" }) => {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelId, setCancelId] = useState(null);

    const [callRoom, setCallRoom] = useState(null);
    const [callDoctorName, setCallDoctorName] = useState("");
    const [userName, setUserName] = useState("");
    const [hidePast, setHidePast] = useState(true);

    /* LOAD APPOINTMENTS ON PAGE LOAD */

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter]);

    /* REALTIME LISTENER */

    useEffect(() => {

        const channel = supabase
            .channel("appointments-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "appointment_bookings"
                },
                () => {
                    fetchAppointments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    /* FETCH APPOINTMENTS */

    const fetchAppointments = async () => {

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

        setUserName(profile?.full_name || "Patient");

        const { data, error } = await supabase
            .from("appointment_bookings")
            .select(`
        id,
        status,
        booked_at,
        call_room,
        queue_position,
        consultation_started,
        consultation_completed,
        appointments (
          date,
          time,
          doctor_id,
          profiles:doctor_id (
            full_name,
            speciality,
            institution,
            avatar_url
          )
        )
      `)
            .eq("patient_id", user.id)
            .order("booked_at", { ascending: false });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        let filtered = data || [];

        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter(
                (item) => item.status === statusFilter
            );
        }

        setAppointments(filtered);
        setLoading(false);

    };

    /* CANCEL BOOKING */

    const cancelBooking = async (bookingId) => {

        try {

            setCancelId(bookingId);

            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("appointment_bookings")
                .update({ status: "cancelled" })
                .eq("id", bookingId)
                .eq("patient_id", user.id)
                .select();

            if (error) {
                toast.error(error.message);
                return;
            }

            if (!data || data.length === 0) {
                toast.error("Update blocked by RLS policy");
                return;
            }

            toast.success("Appointment cancelled");

            setAppointments(prev =>
                prev.map(item =>
                    item.id === bookingId
                        ? { ...item, status: "cancelled" }
                        : item
                )
            );

        } finally {
            setCancelId(null);
        }

    };

    /* STATUS CONFIG */

    const getStatusConfig = (status) => {
        switch (status) {
            case "booked":
                return {
                    badge: "bg-blue-100 text-blue-700 border border-blue-200",
                    border: "border-l-blue-500",
                    dot: "bg-blue-500"
                };
            case "completed":
                return {
                    badge: "bg-green-100 text-green-700 border border-green-200",
                    border: "border-l-green-500",
                    dot: "bg-green-500"
                };
            case "cancelled":
                return {
                    badge: "bg-red-100 text-red-700 border border-red-200",
                    border: "border-l-red-400",
                    dot: "bg-red-400"
                };
            default:
                return {
                    badge: "bg-gray-100 text-gray-600 border border-gray-200",
                    border: "border-l-gray-400",
                    dot: "bg-gray-400"
                };
        }
    };

    /* CALL TIME WINDOW */

    const canJoinCall = (date, time) => {

        if (!date || !time) return false;

        const now = new Date();
        let appointment = new Date(`${date} ${time}`);

        if (isNaN(appointment.getTime())) {
            appointment = new Date(`${date}T${time}`);
        }

        if (isNaN(appointment.getTime())) {
            return false;
        }

        const openTime = new Date(appointment.getTime() - 10 * 60000); // 10 mins before
        const closeTime = new Date(appointment.getTime() + 90 * 60000); // 90 mins after

        return now >= openTime && now <= closeTime;

    };

    /* FORMAT DATE */

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short", year: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "-";
        try {
            const [h, m] = timeStr.split(":");
            const d = new Date();
            d.setHours(+h, +m);
            return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        } catch {
            return timeStr;
        }
    };

    /* VIDEO CALL SCREEN */

    if (callRoom) {

        return (

            <div className="max-w-6xl mx-auto px-4 space-y-4">

                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Video Consultation</h1>
                        {callDoctorName && (
                            <p className="text-sm text-gray-500 mt-0.5">with Dr. {callDoctorName}</p>
                        )}
                    </div>
                </div>

                <VideoCall
                    roomName={callRoom}
                    userName={userName}
                    onLeave={() => {
                        setCallRoom(null);
                        setCallDoctorName("");
                    }}
                />

            </div>

        );

    }

    /* MAIN PAGE */

    const displayAppointments = appointments.filter(item => {
        if (!hidePast) return true;
        if (item.status === "completed" || item.status === "cancelled") return false;

        const slot = item.appointments;
        if (!slot?.date || !slot?.time) return true;

        let appointmentDate = new Date(`${slot.date} ${slot.time}`);
        if (isNaN(appointmentDate.getTime())) {
            appointmentDate = new Date(`${slot.date}T${slot.time}`);
        }

        if (isNaN(appointmentDate.getTime())) return true;

        const now = new Date();
        return appointmentDate.getTime() + (2 * 60 * 60 * 1000) > now.getTime();
    });

    return (

        <div className="max-w-6xl mx-auto px-4 space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage your consultations</p>
                </div>

                <button
                    onClick={() => setHidePast(!hidePast)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all text-sm flex items-center gap-2 border shadow-sm ${hidePast
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d={hidePast
                                ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            }
                        />
                    </svg>
                    {hidePast ? "Show All Bookings" : "Hide Past Bookings"}
                </button>
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-48"
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && displayAppointments.length === 0 && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">No appointments found</p>
                    <p className="text-sm text-gray-400 mt-1">Try changing the filter or book a new consultation.</p>
                </div>
            )}

            {/* Appointment Cards */}
            {!loading && displayAppointments.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">

                    {displayAppointments.map((item) => {

                        const slot = item.appointments;
                        const doctor = slot?.profiles;
                        const statusConfig = getStatusConfig(item.status);

                        const appointmentDateTime = new Date(`${slot?.date}T${slot?.time}`);
                        const now = new Date();
                        const canCancel = appointmentDateTime > now;

                        const joinable = item.status === "booked"
                            && !item.consultation_completed
                            && canJoinCall(slot?.date, slot?.time);

                        const showQueue = item.status === "booked"
                            && !canJoinCall(slot?.date, slot?.time);

                        return (

                            <div
                                key={item.id}
                                className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${statusConfig.border} hover:shadow-md transition-all duration-200 overflow-hidden`}
                            >
                                {/* Card Header */}
                                <div className="px-6 pt-5 pb-4">
                                    <div className="flex justify-between items-start gap-3">

                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden border border-gray-100">
                                                {doctor?.avatar_url ? (
                                                    <img src={doctor.avatar_url} alt="Dr. Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                                        {doctor?.full_name?.charAt(0) || "D"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-bold text-gray-900 truncate">
                                                    Dr. {doctor?.full_name || "—"}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">{doctor?.speciality || ""}</p>
                                                {doctor?.institution && (
                                                    <p className="text-xs text-gray-400 truncate">{doctor.institution}</p>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 capitalize ${statusConfig.badge}`}>
                                            {item.status}
                                        </span>

                                    </div>

                                    {/* Date & Time */}
                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(slot?.date)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatTime(slot?.time)}
                                        </span>
                                    </div>

                                </div>

                                {/* Card Footer Actions */}
                                <div className="px-6 pb-5 flex flex-wrap gap-2">

                                    {/* Queue Info */}
                                    {showQueue && (
                                        <div className="w-full flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-sm text-yellow-700">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Queue #{item.queue_position || "—"} · Video link opens 10 min before</span>
                                        </div>
                                    )}

                                    {/* Join Video Call */}
                                    {joinable && (
                                        <div className="w-full flex flex-col gap-3">
                                            {item.consultation_started && (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100 animate-fadeIn">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Doctor is ready and waiting for you</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setCallRoom(item.call_room || `consult-${item.id}`);
                                                    setCallDoctorName(doctor?.full_name || "");
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Join Video Consultation
                                            </button>
                                        </div>
                                    )}

                                    {/* Cancel */}
                                    {item.status === "booked" && canCancel && (
                                        <button
                                            onClick={() => cancelBooking(item.id)}
                                            disabled={cancelId === item.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                                        >
                                            {cancelId === item.id ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Cancelling...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Cancel Booking
                                                </>
                                            )}
                                        </button>
                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>
            )}

        </div>

    );

};

export default MyAppointments;