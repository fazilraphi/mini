import { useState } from "react";
import { supabase } from "../supabaseClient";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  toast.error(error.message);
} else {
  // Fetch user role from profiles
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    toast.error("Failed to fetch user role");
    return;
  }

  toast.success("Login successful");

  // Role-based navigation
  if (profile.role === "doctor") {
    navigate("/doctor-dashboard");
  } else {
    navigate("/patient-dashboard");
  }
}

  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm grid md:grid-cols-2 overflow-hidden">

        {/* LEFT BRAND PANEL */}
        <div className="hidden md:flex flex-col justify-center bg-[#ED7D27]/10 p-10">
          <h2 className="font-exo text-3xl font-bold mb-4 text-[#141414]">
            Welcome Back
          </h2>
          <p className="font-redhat text-gray-600 leading-relaxed">
            Sign in to continue managing appointments, patients, and healthcare
            records through your professional dashboard.
          </p>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="font-exo text-2xl font-bold mb-2">Login</h1>
          <p className="font-redhat text-sm text-gray-600 mb-8">
            Enter your credentials to access your account.
          </p>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-redhat text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED7D27]/40"
              />
            </div>

            {/* Password with eye icon */}
            <div>
              <label className="block font-redhat text-sm mb-1">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-[#ED7D27]/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-[#ED7D27] text-white py-2 rounded-lg hover:bg-[#d96a1f] transition font-redhat font-medium"
            >
              Sign In
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-6 font-redhat">
            Don’t have an account?{" "}
            <NavLink to="/register" className="text-[#ED7D27] font-medium">
              Create one
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
