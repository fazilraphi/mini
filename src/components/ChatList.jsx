import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ChatWindow from "./ChatWindow";
import { MessageCircle, Clock } from "lucide-react";

const ChatList = () => {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [hideExpired, setHideExpired] = useState(true);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setCurrentUserId(user.id);

        await fetchChats(user.id);

        setupRealtime(user.id);

    };



    /* FETCH CHATS */

    const fetchChats = async (userId) => {

        setLoading(true);

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

        const role = profile?.role;

        let query = supabase
            .from("appointment_bookings")
            .select(`
id,
booked_at,
patient_id,
doctor_id,
appointment_id,
appointments (
date,
time
)
`)
            .order("booked_at", { ascending: false });

        if (role === "patient") {
            query = query.eq("patient_id", userId);
        } else {
            query = query.eq("doctor_id", userId);
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }



        const enriched = await Promise.all(

            (data || []).map(async booking => {

                const otherPartyId =
                    String(userId).toLowerCase().trim() === String(booking.patient_id).toLowerCase().trim()
                        ? booking.doctor_id
                        : booking.patient_id;

                const { data: otherProfile } = await supabase
                    .from("profiles")
                    .select("full_name, role, avatar_url")
                    .eq("id", otherPartyId)
                    .single();

                /* UNREAD COUNT */

                const { count } = await supabase
                    .from("chat_messages")
                    .select("*", { count: "exact", head: true })
                    .eq("booking_id", booking.id)
                    .eq("seen", false)
                    .neq("sender_id", userId);

                // 2. Chat Timeline Logic
                let appointmentDate = new Date();
                let opensAt = new Date();
                let expiresAt = new Date();
                let hasStarted = false;
                let isExpired = false;

                if (booking.appointments?.date && booking.appointments?.time) {
                    // Combine date and time to create a target Date object
                    // time is usually something like "14:30"
                    const dateStr = booking.appointments.date;
                    const timeStr = booking.appointments.time;
                    appointmentDate = new Date(`${dateStr}T${timeStr}`);
                    
                    // 8 hours before appointment
                    opensAt = new Date(appointmentDate.getTime() - 8 * 60 * 60 * 1000);
                    // 24 hours after appointment
                    expiresAt = new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000);

                    const now = new Date();
                    hasStarted = now >= opensAt;
                    isExpired = now >= expiresAt;
                } else {
                    // Fallback to booked_at if appointment details are missing (e.g., legacy data)
                    const bookedAt = new Date(booking.booked_at);
                    opensAt = bookedAt;
                    expiresAt = new Date(bookedAt.getTime() + 24 * 60 * 60 * 1000);
                    const now = new Date();
                    hasStarted = now >= opensAt;
                    isExpired = now >= expiresAt;
                }

                return {
                    ...booking,
                    otherPartyName: otherProfile?.full_name || "Unknown",
                    otherPartyRole: otherProfile?.role || "",
                    otherPartyAvatar: otherProfile?.avatar_url || null,
                    appointmentDate,
                    opensAt,
                    expiresAt,
                    hasStarted,
                    isExpired,
                    unreadCount: count || 0
                };

            })

        );

        setBookings(enriched);
        setLoading(false);

    };



    /* REALTIME LISTENER */

    const setupRealtime = (userId) => {

        const channel = supabase
            .channel("chat-list-live")

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages"
                },
                () => {
                    fetchChats(userId);
                }
            )

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "chat_messages"
                },
                () => {
                    fetchChats(userId);
                }
            )

            .subscribe();

        return () => supabase.removeChannel(channel);

    };



    const getTimeStatus = (booking) => {
        const now = new Date();

        if (booking.isExpired) {
            return { text: "Expired", type: "expired" };
        }

        if (!booking.hasStarted) {
            // Chat hasn't started yet
            const diff = booking.opensAt - now;
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                
                if (days > 0) return { text: `Starts in ${days}d ${hrs}h`, type: "upcoming" };
                if (hrs > 0) return { text: `Starts in ${hrs}h ${mins}m`, type: "upcoming" };
                return { text: `Starts in ${mins}m`, type: "upcoming" };
            }
            return { text: "Starting soon", type: "upcoming" };
        }

        // Chat is active
        const diff = booking.expiresAt - now;
        if (diff > 0) {
            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return { text: `${hrs}h ${mins}m left`, type: "active" };
        }

        return { text: "Expired", type: "expired" };
    };



    if (selectedBooking) {
        return (

            <ChatWindow
                booking={selectedBooking}
                currentUserId={currentUserId}
                onBack={() => {
                    setSelectedBooking(null);
                    fetchChats(currentUserId);
                }}
            />

        );
    }



    return (

        <div className="max-w-6xl mx-auto px-4 space-y-8">

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Messages
                    </h1>

                    <p className="text-sm text-gray-500">
                        Chat with your doctor or patient after booking
                    </p>
                </div>

                <button
                    onClick={() => setHideExpired(!hideExpired)}
                    className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-2 ${hideExpired ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    {hideExpired ? "Show All Chats" : "Hide Expired Chats"}
                </button>
            </div>



            {/* LOADING */}

            {loading && (

                <div className="grid md:grid-cols-2 gap-6">

                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow animate-pulse h-32"
                        />
                    ))}

                </div>

            )}



            {/* EMPTY */}

            {!loading && bookings.length === 0 && (

                <div className="bg-white p-10 rounded-2xl shadow text-center">

                    <MessageCircle size={36} className="mx-auto text-gray-300 mb-3" />

                    <p className="text-lg font-semibold text-gray-700">
                        No conversations yet
                    </p>

                    <p className="text-sm text-gray-500">
                        Chats will appear after booking an appointment.
                    </p>

                </div>

            )}



            {/* ACTIVE */}

            {!loading && bookings.filter(b => !b.isExpired).length > 0 && (

                <div>

                    <h2 className="text-sm font-semibold text-gray-500 mb-3">
                        Active Chats
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        {bookings
                            .filter(b => !b.isExpired)
                            .map(booking => {
                                const status = getTimeStatus(booking);
                                return (
                                <div
                                    key={booking.id}
                                    onClick={() => {
                                        if (booking.hasStarted) setSelectedBooking(booking);
                                        else toast.error(`Chat opens 8 hours before the appointment (${new Date(booking.opensAt).toLocaleString()})`);
                                    }}
                                    className={`bg-white p-6 rounded-2xl shadow transition ${booking.hasStarted ? 'hover:shadow-lg cursor-pointer' : 'opacity-80 cursor-not-allowed border outline outline-1 outline-gray-200'}`}
                                >

                                    <div className="flex justify-between items-center gap-4">

                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                                {booking.otherPartyAvatar ? (
                                                    <img src={booking.otherPartyAvatar} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">

                                                <p className="text-lg font-semibold flex items-center gap-2 truncate">

                                                    {booking.otherPartyRole === "doctor" ? "Dr. " : ""}
                                                    <span className="truncate">{booking.otherPartyName}</span>

                                                    {booking.unreadCount > 0 && booking.hasStarted && (

                                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">

                                                            {booking.unreadCount}

                                                        </span>

                                                    )}

                                                </p>

                                                <p className="text-sm text-gray-500 truncate">
                                                    {booking.appointments?.date} at {booking.appointments?.time}
                                                </p>

                                            </div>

                                        </div>

                                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${
                                            status.type === 'upcoming' 
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                                : 'bg-green-50 text-green-700 border border-green-100'
                                        }`}>

                                            <Clock size={12} />
                                            {status.text}

                                        </span>

                                    </div>

                                </div>

                                );
                            })}

                    </div>

                </div>

            )}

            {/* ALL EXPIRED / NO ACTIVE CHATS MESSAGE */}

            {!loading && bookings.length > 0 && bookings.filter(b => !b.isExpired).length === 0 && (

                <div className="bg-white p-10 rounded-2xl shadow text-center border border-gray-100">

                    <MessageCircle size={36} className="mx-auto text-gray-300 mb-3" />

                    <p className="text-lg font-semibold text-gray-700">
                        No active chats available
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        All your previous conversations have expired.
                    </p>

                </div>

            )}

            {/* EXPIRED */}

            {!loading && !hideExpired && bookings.filter(b => b.isExpired).length > 0 && (

                <div>

                    <h2 className="text-sm font-semibold text-gray-500 mb-3">
                        Expired Chats
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        {bookings
                            .filter(b => b.isExpired)
                            .map(booking => (

                                <div
                                    key={booking.id}
                                    // onClick={() => setSelectedBooking(booking)} - Cannot open expired chats as per constraints, but keeping read-only could be optional. Let's keep it disabled if expired.
                                    className="bg-white p-6 rounded-2xl shadow opacity-60 cursor-not-allowed"
                                >

                                    <div className="flex justify-between items-center gap-4">

                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center grayscale">
                                                {booking.otherPartyAvatar ? (
                                                    <img src={booking.otherPartyAvatar} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">

                                                <p className="text-lg font-semibold text-gray-600 truncate flex items-center gap-2">

                                                    {booking.otherPartyRole === "doctor" ? "Dr. " : ""}
                                                    <span className="truncate">{booking.otherPartyName}</span>

                                                </p>

                                                <p className="text-sm text-gray-500 truncate">
                                                    {booking.appointments?.date} at {booking.appointments?.time}
                                                </p>

                                            </div>
                                        </div>

                                        <span className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-full flex-shrink-0 font-semibold">

                                            <Clock size={12} />
                                            Expired

                                        </span>

                                    </div>

                                </div>

                            ))}

                    </div>

                </div>

            )}

        </div>

    );

};

export default ChatList;