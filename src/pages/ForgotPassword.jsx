import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import logo from "../assets/healthsync-logo.png";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from("forgot_password")
                .insert({
                    email: email.trim().toLowerCase(),
                    status: "pending",
                });

            if (error) {
                console.error("Forgot password insert error:", error);
                toast.error("Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            setSubmitted(true);
            toast.success("Request submitted successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit request.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-4">

            <button
                onClick={() => navigate("/login")}
                className="absolute top-6 left-6 bg-gradient-to-r from-sky-500 to-teal-400 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back to Login
            </button>

            <div className="w-full max-w-md">

                {!submitted ? (
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-sky-100/50">

                        {/* Header */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-cyan-200">
                                <Mail className="text-white" size={30} />
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <img src={logo} className="w-5 h-5" alt="HealthSync" />
                                <span className="font-bold text-sm text-sky-500">HealthSync</span>
                            </div>

                            <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">
                                Forgot Password
                            </h1>

                            <p className="text-gray-500 mt-3 text-sm text-center font-medium leading-relaxed max-w-xs">
                                Enter your registered email address. Our admin team will review your request and contact you to reset your password.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    Email Address
                                </label>

                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50 transition-all duration-200">
                                    <Mail size={18} className="text-gray-400 mr-3 flex-shrink-0" />

                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-300 font-semibold"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-sky-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>

                        </form>

                        {/* Info Note */}
                        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5">
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                <span className="font-black">⚠️ Note:</span> This is a manual password reset process. An admin will review your request and reach out to you directly. Please allow up to 24 hours.
                            </p>
                        </div>

                    </div>
                ) : (
                    /* Success State */
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-green-100/50 text-center">

                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                            <CheckCircle className="text-white" size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-3">
                            Request Submitted!
                        </h2>

                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto">
                            Your password reset request has been submitted successfully. An admin will review it and contact you at <strong className="text-gray-700">{email}</strong>.
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-gradient-to-r from-sky-500 to-teal-400 text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default ForgotPassword;
