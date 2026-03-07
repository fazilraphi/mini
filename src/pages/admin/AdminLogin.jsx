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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-700">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
                        <Lock className="text-white" size={24} />
                    </div>

                    <h1 className="text-2xl font-bold text-white">
                        Admin Portal
                    </h1>

                    <p className="text-gray-400 mt-2 text-sm text-center">
                        Sign in to access the MediGlass Health Systems administration dashboard.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm text-gray-400">
                            Email Address
                        </label>

                        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-2 focus-within:border-cyan-500 transition">
                            <Mail size={18} className="text-gray-500 mr-3" />

                            <input
                                type="email"
                                placeholder="admin@mediglass.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent text-white outline-none placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-sm text-gray-400">
                            Password
                        </label>

                        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-2 focus-within:border-cyan-500 transition">
                            <Lock size={18} className="text-gray-500 mr-3" />

                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 bg-transparent text-white outline-none placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/30 transition disabled:opacity-60"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AdminLogin;