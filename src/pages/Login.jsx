
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/healthsync-logo.png";

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

      if (role === "admin") {
        toast.error("Please login from the admin portal.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

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

        toast.success("Welcome Doctor");
        navigate("/doctor-dashboard");
        setLoading(false);
        return;
      }

      if (role === "patient") {
        toast.success("Login successful");
        navigate("/patient-dashboard");
        setLoading(false);
        return;
      }

      toast.error("Unknown account type.");
    } catch (err) {
      console.error(err);
      toast.error("Login failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      <button
        onClick={() => navigate("/") }
        className="absolute top-6 left-6 bg-gradient-to-r from-sky-500 to-teal-400 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition"
      >
        ← Home
      </button>

      {/* LEFT LOGIN SECTION */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-sky-50 to-slate-50 flex items-center justify-center px-6 md:px-8 py-16">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-sky-100 px-10 py-12">

          <div className="flex items-center gap-2 mb-8">
            <img src={logo} className="w-6 h-6" alt="HealthSync"/>
            <span className="font-bold text-sm text-sky-500">
              HealthSync
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-2">
            LOGIN
          </h1>

          <p className="text-sm text-slate-500 mb-8">
            Sign in to access your health portal.
          </p>

          {/* EMAIL */}
          <div className="mb-5">
            <label className="block text-xs font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3">

            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium">
                Password
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-sky-500 hover:text-sky-700 hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex items-center h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none"
              />

              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="text-slate-400"
              >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>

            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-[44px] mt-6 rounded-lg bg-gradient-to-r from-sky-500 to-teal-400 text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-sm mt-6 text-slate-500">
            Don't have an account yet?{" "}
            <NavLink to="/register" className="text-sky-500 font-semibold">
              Register for free
            </NavLink>
          </p>

        </div>

      </div>


      {/* RIGHT GRADIENT SECTION */}
      
      {/* RIGHT GRADIENT SECTION — EXACT STYLE */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center px-16 text-white relative overflow-hidden"
        style={{
          background: `
      radial-gradient(circle at 0% 0%, #2dd4bf 0%, transparent 40%),
      radial-gradient(circle at 100% 0%, #e879f9 0%, transparent 40%),
      radial-gradient(circle at 50% 100%, #38bdf8 0%, transparent 45%),
      linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)
    `
        }}
      >

        {/* CONTENT */}
        <div className="max-w-md text-gray-800">

          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Your Health,
            <br />
            <span className="text-sky-500">Simplified</span>
          </h2>

          <p className="text-lg text-gray-600 mb-10">
            Connect with verified doctors, manage your
            medical records, and access healthcare services
            anytime in one secure platform.
          </p>

          <div className="space-y-6">

            <div className="flex gap-4">
              <div>⚡</div>
              <div>
                <h3 className="font-semibold">Instant Appointments</h3>
                <p className="text-gray-600 text-sm">
                  Book consultations with trusted doctors within minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div>🔒</div>
              <div>
                <h3 className="font-semibold">Secure Health Records</h3>
                <p className="text-gray-600 text-sm">
                  Your medical data protected with advanced encryption.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div>🤖</div>
              <div>
                <h3 className="font-semibold">Medical Support Desk</h3>
                <p className="text-gray-600 text-sm">
                  Get instant symptom guidance anytime you need it.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-12 text-sm text-gray-600">
            
          </div>

        </div>

      </div>
      


    </div>
  );
};

export default Login;

