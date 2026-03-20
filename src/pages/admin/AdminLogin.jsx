import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Mail } from "lucide-react";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        try {
            setLoading(true);

            // Step 1 — Authenticate user
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                setLoading(false);
                return;
            }

            const user = data?.user;

            if (!user) {
                toast.error("Authentication failed.");
                setLoading(false);
                return;
            }

            // Step 2 — Fetch profile
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profileError || !profile) {
                toast.error("Admin profile not found.");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // Step 3 — Check admin role
            if (profile.role !== "admin") {
                toast.error("Unauthorized access.");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // Success
            toast.success("Welcome, Admin");
            navigate("/admin-dashboard");

        } catch (err) {
            console.error(err);
            toast.error("Login failed. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-cyan-100/50">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-200">
                        <Lock className="text-white" size={28} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Admin Portal
                    </h1>

                    <p className="text-gray-500 mt-2 text-sm text-center font-medium">
                        Sign in to access the HealthSync administration dashboard.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    {/* EMAIL */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                            Email Address
                        </label>

                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 transition-all duration-200">
                            <Mail size={18} className="text-gray-400 mr-3" />

                            <input
                                type="email"
                                placeholder="admin@healthsync.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-300 font-semibold"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                            Password
                        </label>

                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 transition-all duration-200">
                            <Lock size={18} className="text-gray-400 mr-3" />

                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-300 font-semibold"
                            />
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-cyan-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                    >
                        {loading ? "Authenticating..." : "Sign In →"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AdminLogin;