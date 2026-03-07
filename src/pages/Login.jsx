import { useState } from "react";
import { supabase } from "../supabaseClient";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // Authenticate
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        toast.error("User profile missing.");
        setLoading(false);
        return;
      }

      const role = profile.role;
      const status = profile.status;

      // ADMIN
      if (role === "admin") {
        toast.error("Please login from the admin portal.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // DOCTOR
      if (role === "doctor") {
        if (status === "pending") {
          toast.error("Your account is awaiting admin approval.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (status === "rejected") {
          toast.error("Your doctor registration was rejected.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // allow approved OR legacy doctors (status null)
        toast.success("Welcome Doctor");
        navigate("/doctor-dashboard");
        setLoading(false);
        return;
      }

      // PATIENT
      if (role === "patient") {
        toast.success("Login successful");
        navigate("/patient-dashboard");
        setLoading(false);
        return;
      }

      // fallback
      toast.error("Unknown account type.");

    } catch (err) {
      console.error(err);
      toast.error("Login failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f3f7] to-[#cfdde3] flex flex-col">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-5 bg-white shadow-sm">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 bg-cyan-500 rounded-full"></div>
          HealthSync
        </NavLink>

        <div className="flex items-center gap-6">
          <NavLink className="text-gray-600 hover:text-black">
            Find a Doctor
          </NavLink>

          <button className="bg-cyan-500 text-white px-5 py-2 rounded-lg">
            Help
          </button>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">

        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg grid md:grid-cols-2 overflow-hidden">

          {/* IMAGE PANEL */}
          <div
            className="hidden md:flex flex-col justify-end p-12 text-white bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://image2url.com/r2/default/images/1772634318695-66815854-2f00-4a14-89a3-d44ba4784fde.png')",
            }}
          >
            <h2 className="text-4xl font-bold leading-snug">
              Your Health,
              <br />
              Through a Clearer
              <br />
              Lens.
            </h2>

            <p className="text-sm mt-4 opacity-90">
              Connect with world-class specialists from the comfort of your home.
            </p>
          </div>

          {/* FORM */}
          <div className="p-10 flex flex-col justify-center">

            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>

            <p className="text-gray-500 mb-6">
              Sign in to access your secure health portal.
            </p>

            {/* EMAIL */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email Address</label>

              <div className="flex items-center border rounded-xl px-3 py-2 mt-1">
                <Mail size={18} className="text-gray-400 mr-2" />

                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-3">

              <div className="flex justify-between text-sm mb-1">
                <label className="text-gray-600">Password</label>

                <button className="text-cyan-500 text-xs">
                  Forgot Password?
                </button>
              </div>

              <div className="flex items-center border rounded-xl px-3 py-2">
                <Lock size={18} className="text-gray-400 mr-2" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none"
                />

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* LOGIN */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium shadow-md transition disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="text-sm text-gray-500 text-center mt-6">
              Don’t have an account?{" "}
              <NavLink to="/register" className="text-cyan-500 font-medium">
                Create Account
              </NavLink>
            </p>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 pb-6 space-x-6">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
        <span>Cookie Settings</span>
        <p className="mt-2">
          © 2026 HealthSync Health Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;