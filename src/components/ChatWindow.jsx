import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import { Send, Paperclip, FileText, Clock, Mic, X, User } from "lucide-react";
import AudioMessage from "./AudioMessage";

const ChatWindow = ({ booking, currentUserId, onBack }) => {

    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [online, setOnline] = useState(false);

    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editText, setEditText] = useState("");

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Use expiresAt properly provided by ChatList (combining date/time and adding 24hrs)
    const expiresAt = booking.expiresAt ? new Date(booking.expiresAt) : new Date(new Date(booking.booked_at).getTime() + 24 * 60 * 60 * 1000);

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
            console.log(`ChatWindow: Fetched ${data?.length || 0} messages. CurrentUser: [${currentUserId}]`);
            if (data?.length > 0) {
                console.log(`First Msg Sender: [${data[0].sender_id}] Align: [${String(data[0].sender_id).toLowerCase().trim() === String(currentUserId).toLowerCase().trim()}]`);
            }

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

                    setMessages(prev => {
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });

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

        const { data, error } = await supabase
            .from("chat_messages")
            .insert({
                booking_id: booking.id,
                sender_id: currentUserId,
                content: newMsg,
                seen: false
            })
            .select()
            .single();

        if (error) {
            toast.error("Send failed");
        } else {
            setNewMsg("");
            setMessages(prev => {
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
        }

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

    const startEditing = (id, oldText) => {
        setActiveDropdown(null);
        setEditingMsgId(id);
        setEditText(oldText);
    };

    const cancelEditing = () => {
        setEditingMsgId(null);
        setEditText("");
    };

    const saveEdit = async (id) => {
        if (!editText.trim()) {
            cancelEditing();
            return;
        }

        await supabase
            .from("chat_messages")
            .update({
                content: editText,
                edited: true
            })
            .eq("id", id);

        setMessages(prev =>
            prev.map(m =>
                m.id === id
                    ? { ...m, content: editText, edited: true }
                    : m
            )
        );

        cancelEditing();
    };


    /* FILE */

    const uploadFile = async (file) => {

        const path = `chat/${booking.id}-${Date.now()}-${file.name}`;

        const { data: uploadData, error } = await supabase.storage
            .from("chat-files")
            .upload(path, file);

        if (error) { toast.error("File upload failed"); return; }

        const { data } = supabase.storage
            .from("chat-files")
            .getPublicUrl(path);

        const { data: msgData, error: msgError } = await supabase
            .from("chat_messages")
            .insert({
                booking_id: booking.id,
                sender_id: currentUserId,
                file_url: data.publicUrl,
                file_name: file.name,
                seen: false
            })
            .select()
            .single();

        if (msgData) {
            setMessages(prev => prev.find(m => m.id === msgData.id) ? prev : [...prev, msgData]);
        }

    };


    /* AUDIO */

    const startRecording = async () => {

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorderRef.current = new MediaRecorder(stream);

            const chunks = [];

            mediaRecorderRef.current.ondataavailable = e => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                if (chunks.length === 0) {
                    toast.error("No audio recorded");
                    return;
                }

                // Supabase bucket now accepts audio/* - use audio/webm which is what Chrome/Edge records
                const blob = new Blob(chunks, { type: "audio/webm" });
                const ext = "webm";

                const fileName = `audio-${Date.now()}.${ext}`;

                const path = `chat/${booking.id}-${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("chat-files")
                    .upload(path, blob);

                if (uploadError) {
                    console.error("Audio Upload Error:", uploadError);
                    toast.error("Audio upload failed: " + uploadError.message);
                    return;
                }

                const { data } = supabase.storage
                    .from("chat-files")
                    .getPublicUrl(path);

                const { data: msgData, error: dbError } = await supabase
                    .from("chat_messages")
                    .insert({
                        booking_id: booking.id,
                        sender_id: currentUserId,
                        audio_url: data.publicUrl,
                        seen: false
                    })
                    .select()
                    .single();

                if (dbError) {
                    console.error("Database Insert Error:", dbError);
                    toast.error("Send failed: " + dbError.message);
                    return;
                }

                if (msgData) {
                    setMessages(prev => prev.find(m => m.id === msgData.id) ? prev : [...prev, msgData]);
                }

            };

            mediaRecorderRef.current.start();
            setRecording(true);
            setRecordingTime(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error(err);
            toast.error("Could not start recording");
        }

    };


    const stopRecording = (cancel = false) => {

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            if (cancel) {
                // To prevent the upload from triggering, we clear the onstop handler
                mediaRecorderRef.current.onstop = null;
            }
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }

        setRecording(false);
        setRecordingTime(0);

    };

    const formatRecordTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
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
        <div className="max-w-4xl mx-auto w-full h-[85vh] flex flex-col bg-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
            {/* IMAGE MODAL */}
            {isImageModalOpen && booking.otherPartyAvatar && (
                <div 
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center">
                        <button 
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 bg-black/40 rounded-full transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsImageModalOpen(false);
                            }}
                        >
                            <X size={24} />
                        </button>
                        <img 
                            src={booking.otherPartyAvatar} 
                            alt={`${booking.otherPartyName} Full Avatar`} 
                            className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()} // Prevent click-through closing
                        />
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="bg-[#0BC5EA] px-6 py-4 flex justify-between items-center shadow-sm z-10 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    {booking.otherPartyAvatar ? (
                        <button 
                            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm overflow-hidden border-2 border-white/40 cursor-pointer hover:border-white transition-all shadow-sm"
                            onClick={() => setIsImageModalOpen(true)}
                            title="View full profile picture"
                        >
                            <img src={booking.otherPartyAvatar} alt="avatar" className="w-full h-full object-cover" />
                        </button>
                    ) : (
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow-sm">
                            <User size={24} />
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-semibold text-white tracking-wide">
                            {booking.otherPartyRole === "doctor" ? "Dr. " : ""}{booking.otherPartyName}
                        </h1>
                        <p className="text-sm text-cyan-50 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${online ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
                            {online ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                            {unreadCount} New
                        </span>
                    )}
                    <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm font-medium">
                        <Clock size={14} />
                        {timeLeft}
                    </span>
                    <button
                        onClick={onBack}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors ml-2"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.map((msg, index) => {
                    const isMine = String(msg.sender_id).toLowerCase().trim() === String(currentUserId).toLowerCase().trim();
                    return (
                        <div key={msg.id} className="flex flex-col w-full">
                            {index === firstUnreadIndex && unreadCount > 0 && (
                                <div className="flex items-center gap-3 my-6">
                                    <div className="flex-1 h-px bg-red-200" />
                                    <span className="text-xs text-red-500 font-bold uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                                        New Messages
                                    </span>
                                    <div className="flex-1 h-px bg-red-200" />
                                </div>
                            )}

                            <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className={`relative max-w-[75%] px-5 py-3 shadow-sm group ${isMine
                                        ? "bg-[#0BC5EA] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm"
                                    }`}>

                                    {isMine && !msg.deleted && editingMsgId !== msg.id && (
                                        <div className="absolute top-1 -left-9 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === msg.id ? null : msg.id)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-cyan-500 bg-white border border-gray-200 rounded-full shadow-md transition-all hover:border-cyan-300"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                                            </button>

                                            {activeDropdown === msg.id && (
                                                <div className="absolute bottom-8 right-0 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-20 w-[140px]"
                                                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                                                >
                                                    {msg.content && (
                                                        <button
                                                            onClick={() => startEditing(msg.id, msg.content)}
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 flex items-center gap-3 transition-colors font-medium"
                                                        >
                                                            <span className="w-7 h-7 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                            </span>
                                                            Edit
                                                        </button>
                                                    )}
                                                    <div className="h-px bg-gray-100 mx-3" />
                                                    <button
                                                        onClick={() => { setActiveDropdown(null); deleteMessage(msg.id); }}
                                                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                                                    >
                                                        <span className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                                        </span>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.deleted ? (
                                        <p className="italic text-gray-400 text-sm flex items-center gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /></svg>
                                            This message was deleted
                                        </p>
                                    ) : (
                                        <div className="flex flex-col">
                                            {editingMsgId === msg.id ? (
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <textarea
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="w-full text-[15px] p-2 rounded-lg text-gray-800 bg-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none min-w-[200px]"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2 mt-1">
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="text-xs px-3 py-1.5 rounded-md bg-black/10 hover:bg-black/20 text-white font-medium transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => saveEdit(msg.id)}
                                                            className="text-xs px-3 py-1.5 rounded-md bg-white text-cyan-600 hover:bg-gray-100 font-bold shadow-sm transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.content && <p className="text-[15px] leading-relaxed mb-1">{msg.content}</p>}

                                                    {msg.audio_url &&
                                                        <AudioMessage src={msg.audio_url} isMine={isMine} />
                                                    }

                                                    {msg.file_url &&
                                                        <a
                                                            href={msg.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 mt-2 underline text-sm opacity-90"
                                                        >
                                                            <FileText size={16} />
                                                            {msg.file_name}
                                                        </a>
                                                    }

                                                    <p className={`text-[11px] mt-1.5 font-medium ${isMine ? "text-cyan-100" : "text-gray-400"} text-right`}>
                                                        {formatTime(msg.created_at)}
                                                        {msg.edited && " (edited)"}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="bg-white p-4 border-t border-gray-100">
                <form onSubmit={sendMessage} className="flex gap-3 items-center max-w-4xl mx-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={e => uploadFile(e.target.files[0])}
                    />

                    {!recording && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="p-3 text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-full transition-colors flex-shrink-0"
                        >
                            <Paperclip size={22} />
                        </button>
                    )}

                    <div className="flex-1 relative">
                        {recording ? (
                            <div className="w-full border border-red-200 bg-red-50 rounded-full px-5 py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                                    <span className="text-red-500 font-medium font-mono">{formatRecordTime(recordingTime)}</span>
                                </div>
                                <span className="text-red-400 text-sm animate-pulse mr-4">Recording audio...</span>
                            </div>
                        ) : (
                            <input
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full border border-gray-200 bg-gray-50 rounded-full px-5 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-gray-700"
                            />
                        )}
                    </div>

                    {recording ? (
                        <>
                            <button
                                type="button"
                                onClick={() => stopRecording(true)}
                                className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
                            >
                                <X size={22} />
                            </button>
                            <button
                                type="button"
                                onClick={() => stopRecording(false)}
                                className="bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full transition-all shadow-md hover:shadow-lg flex-shrink-0"
                            >
                                <Send size={20} className="ml-1" />
                            </button>
                        </>
                    ) : (
                        newMsg.trim() ? (
                            <button
                                type="submit"
                                className="bg-[#0BC5EA] hover:bg-cyan-500 text-white p-3.5 rounded-full transition-all shadow-md hover:shadow-lg flex-shrink-0"
                            >
                                <Send size={20} className="ml-1" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="bg-[#0BC5EA] hover:bg-cyan-500 text-white p-3.5 rounded-full transition-all shadow-md hover:shadow-lg flex-shrink-0"
                            >
                                <Mic size={20} />
                            </button>
                        )
                    )}
                </form>
            </div>
        </div>
    );

};

export default ChatWindow;