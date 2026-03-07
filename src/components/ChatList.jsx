import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ChatWindow from "./ChatWindow";
import { MessageCircle, Clock } from "lucide-react";

const ChatList = () => {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

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
                    role === "patient"
                        ? booking.doctor_id
                        : booking.patient_id;

                const { data: otherProfile } = await supabase
                    .from("profiles")
                    .select("full_name,role")
                    .eq("id", otherPartyId)
                    .single();

                /* UNREAD COUNT */

                const { count } = await supabase
                    .from("chat_messages")
                    .select("*", { count: "exact", head: true })
                    .eq("booking_id", booking.id)
                    .eq("seen", false)
                    .neq("sender_id", userId);

                const bookedAt = new Date(booking.booked_at);
                const expiresAt = new Date(bookedAt.getTime() + 24 * 60 * 60 * 1000);
                const isExpired = new Date() > expiresAt;

                return {
                    ...booking,
                    otherPartyName: otherProfile?.full_name || "Unknown",
                    otherPartyRole: otherProfile?.role || "",
                    isExpired,
                    expiresAt,
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



    const getTimeRemaining = (expiresAt) => {

        const diff = new Date(expiresAt) - new Date();

        if (diff <= 0) return "Expired";

        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hrs}h ${mins}m left`;

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

            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Messages
                </h1>

                <p className="text-sm text-gray-500">
                    Chat with your doctor or patient after booking
                </p>
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
                            .map(booking => (

                                <div
                                    key={booking.id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                                >

                                    <div className="flex justify-between items-center">

                                        <div>

                                            <p className="text-lg font-semibold flex items-center gap-2">

                                                {booking.otherPartyRole === "doctor" ? "Dr. " : ""}
                                                {booking.otherPartyName}

                                                {booking.unreadCount > 0 && (

                                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">

                                                        {booking.unreadCount}

                                                    </span>

                                                )}

                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {booking.appointments?.date}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {booking.appointments?.time}
                                            </p>

                                        </div>

                                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">

                                            <Clock size={12} />
                                            {getTimeRemaining(booking.expiresAt)}

                                        </span>

                                    </div>

                                </div>

                            ))}

                    </div>

                </div>

            )}



            {/* EXPIRED */}

            {!loading && bookings.filter(b => b.isExpired).length > 0 && (

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
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white p-6 rounded-2xl shadow opacity-70 cursor-pointer"
                                >

                                    <div className="flex justify-between items-center">

                                        <div>

                                            <p className="text-lg font-semibold text-gray-600">

                                                {booking.otherPartyRole === "doctor" ? "Dr. " : ""}
                                                {booking.otherPartyName}

                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {booking.appointments?.date}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {booking.appointments?.time}
                                            </p>

                                        </div>

                                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">

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