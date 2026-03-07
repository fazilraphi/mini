import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import { Send, Paperclip, FileText, Clock, Mic } from "lucide-react";

const ChatWindow = ({ booking, currentUserId, onBack }) => {

    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [online, setOnline] = useState(false);

    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const bookedAt = new Date(booking.booked_at);
    const expiresAt = new Date(bookedAt.getTime() + 24 * 60 * 60 * 1000);

    const [timeLeft, setTimeLeft] = useState("");
    const [expired, setExpired] = useState(false);

    const otherUserId =
        booking.patient_id === currentUserId
            ? booking.doctor_id
            : booking.patient_id;


    /* TIMER */

    useEffect(() => {

        const timer = setInterval(() => {

            const diff = expiresAt - new Date();

            if (diff <= 0) {
                setExpired(true);
                setTimeLeft("Expired");
                return;
            }

            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${hrs}h ${mins}m`);

        }, 1000);

        return () => clearInterval(timer);

    }, []);


    /* UPDATE MY LAST SEEN */

    useEffect(() => {

        const updateLastSeen = async () => {

            await supabase
                .from("profiles")
                .update({ last_seen: new Date() })
                .eq("id", currentUserId);

        };

        updateLastSeen();

        const interval = setInterval(updateLastSeen, 30000);

        return () => clearInterval(interval);

    }, [currentUserId]);


    /* CHECK OTHER USER ONLINE */

    useEffect(() => {

        const checkStatus = async () => {

            const { data } = await supabase
                .from("profiles")
                .select("last_seen")
                .eq("id", otherUserId)
                .single();

            if (!data?.last_seen) return;

            const diff = new Date() - new Date(data.last_seen);

            setOnline(diff < 60000);

        };

        checkStatus();

        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);

    }, [otherUserId]);


    /* FETCH MESSAGES */

    useEffect(() => {

        const fetchMessages = async () => {

            setLoading(true);

            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("booking_id", booking.id)
                .order("created_at", { ascending: true });

            if (error) {
                toast.error("Failed to load messages");
                return;
            }

            setMessages(data || []);

            const unread = data.filter(
                m => !m.seen && m.sender_id !== currentUserId
            ).length;

            setUnreadCount(unread);

            await supabase
                .from("chat_messages")
                .update({ seen: true })
                .eq("booking_id", booking.id)
                .neq("sender_id", currentUserId)
                .eq("seen", false);

            setLoading(false);

        };

        fetchMessages();

    }, [booking.id]);


    /* REALTIME */

    useEffect(() => {

        const channel = supabase.channel(`chat-${booking.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `booking_id=eq.${booking.id}`
                },
                payload => {

                    const newMessage = payload.new;

                    setMessages(prev => [...prev, newMessage]);

                    if (newMessage.sender_id !== currentUserId) {

                        setUnreadCount(prev => prev + 1);

                        supabase
                            .from("chat_messages")
                            .update({ seen: true })
                            .eq("id", newMessage.id);

                    }

                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);

    }, []);


    /* SCROLL */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    /* SEND MESSAGE */

    const sendMessage = async (e) => {

        e.preventDefault();

        if (!newMsg.trim()) return;

        const { error } = await supabase
            .from("chat_messages")
            .insert({
                booking_id: booking.id,
                sender_id: currentUserId,
                content: newMsg,
                seen: false
            });

        if (error) toast.error("Send failed");

        else setNewMsg("");

    };


    /* DELETE */

    const deleteMessage = async (id) => {

        await supabase
            .from("chat_messages")
            .update({ deleted: true })
            .eq("id", id);

        setMessages(prev =>
            prev.map(m => m.id === id ? { ...m, deleted: true } : m)
        );

    };


    /* EDIT */

    const editMessage = async (id, oldText) => {

        const text = prompt("Edit message", oldText);

        if (!text) return;

        await supabase
            .from("chat_messages")
            .update({
                content: text,
                edited: true
            })
            .eq("id", id);

        setMessages(prev =>
            prev.map(m =>
                m.id === id
                    ? { ...m, content: text, edited: true }
                    : m
            )
        );

    };


    /* FILE */

    const uploadFile = async (file) => {

        const path = `chat/${booking.id}-${Date.now()}-${file.name}`;

        await supabase.storage
            .from("chat-files")
            .upload(path, file);

        const { data } = supabase.storage
            .from("chat-files")
            .getPublicUrl(path);

        await supabase
            .from("chat_messages")
            .insert({
                booking_id: booking.id,
                sender_id: currentUserId,
                file_url: data.publicUrl,
                file_name: file.name,
                seen: false
            });

    };


    /* AUDIO */

    const startRecording = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorderRef.current = new MediaRecorder(stream);

        const chunks = [];

        mediaRecorderRef.current.ondataavailable = e => {
            chunks.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {

            const blob = new Blob(chunks, { type: "audio/webm" });

            const fileName = `audio-${Date.now()}.webm`;

            const path = `chat-audio/${fileName}`;

            await supabase.storage
                .from("chat-files")
                .upload(path, blob);

            const { data } = supabase.storage
                .from("chat-files")
                .getPublicUrl(path);

            await supabase
                .from("chat_messages")
                .insert({
                    booking_id: booking.id,
                    sender_id: currentUserId,
                    audio_url: data.publicUrl,
                    seen: false
                });

        };

        mediaRecorderRef.current.start();

        setRecording(true);

    };


    const stopRecording = () => {

        mediaRecorderRef.current.stop();

        setRecording(false);

    };


    /* TIME FORMAT */

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });


    /* FIRST UNREAD */

    const firstUnreadIndex = messages.findIndex(
        m => !m.seen && m.sender_id !== currentUserId
    );


    return (

        <div className="max-w-6xl mx-auto px-4 space-y-6">


            {/* HEADER */}

            <div className="flex justify-between items-center">

                <div>

                    <button
                        onClick={onBack}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>

                    <h1 className="text-2xl font-bold mt-2">
                        {booking.otherPartyName}
                    </h1>

                    <p className={`text-xs ${online ? "text-green-600" : "text-gray-400"}`}>
                        {online ? "Online" : "Offline"}
                    </p>

                    {unreadCount > 0 && (
                        <p className="text-xs text-red-500">
                            {unreadCount} unread message{unreadCount > 1 && "s"}
                        </p>
                    )}

                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">

                    <Clock size={12} />
                    {timeLeft}

                </span>

            </div>


            {/* CHAT */}

            <div className="bg-white rounded-2xl shadow flex flex-col h-[65vh]">


                {/* MESSAGES */}

                <div className="flex-1 overflow-y-auto p-6 space-y-3">

                    {messages.map((msg, index) => {

                        const isMine = msg.sender_id === currentUserId;

                        return (

                            <div key={msg.id}>

                                {index === firstUnreadIndex && unreadCount > 0 && (

                                    <div className="flex items-center gap-3 my-4">

                                        <div className="flex-1 h-px bg-red-300" />

                                        <span className="text-xs text-red-500 font-semibold">
                                            New Messages
                                        </span>

                                        <div className="flex-1 h-px bg-red-300" />

                                    </div>

                                )}

                                <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>

                                    <div className={`max-w-sm px-4 py-2 rounded-xl text-sm
${isMine
                                            ? "bg-cyan-500 text-white"
                                            : "bg-gray-100 text-gray-800"
                                        }`}>

                                        {msg.deleted ? (
                                            <p className="italic text-gray-400">
                                                Message deleted
                                            </p>
                                        ) : (

                                            <>

                                                {msg.content && <p>{msg.content}</p>}

                                                {msg.audio_url &&
                                                    <audio controls src={msg.audio_url} className="mt-1" />
                                                }

                                                {msg.file_url &&
                                                    <a
                                                        href={msg.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 mt-1 underline"
                                                    >
                                                        <FileText size={14} />
                                                        {msg.file_name}
                                                    </a>
                                                }

                                                <p className="text-[10px] opacity-70 mt-1 text-right">

                                                    {formatTime(msg.created_at)}

                                                    {msg.edited && " (edited)"}

                                                    {isMine && msg.seen && " ✓✓"}

                                                </p>

                                            </>

                                        )}

                                        {isMine && !msg.deleted &&

                                            <div className="text-[10px] mt-1 flex gap-2">

                                                <button onClick={() => editMessage(msg.id, msg.content)}>
                                                    Edit
                                                </button>

                                                <button onClick={() => deleteMessage(msg.id)}>
                                                    Delete
                                                </button>

                                            </div>

                                        }

                                    </div>
                                </div>
                            </div>

                        );

                    })}

                    <div ref={messagesEndRef} />

                </div>


                {/* INPUT */}

                <div className="border-t p-4">

                    <form onSubmit={sendMessage} className="flex gap-2">

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={e => uploadFile(e.target.files[0])}
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="px-3 text-gray-500"
                        >
                            <Paperclip size={20} />
                        </button>

                        <input
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-lg px-4 py-2 text-sm"
                        />

                        <button
                            type="submit"
                            className="bg-cyan-500 text-white px-4 rounded-lg"
                        >
                            <Send size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={recording ? stopRecording : startRecording}
                            className="px-3 text-gray-500"
                        >
                            <Mic size={20} />
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

};

export default ChatWindow;