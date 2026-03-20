import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, User, ShieldCheck, Phone } from "lucide-react";
import logo from "../assets/healthsync-logo.png";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [doctorLicense, setDoctorLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (role === "doctor") {
      if (doctorLicense.length < 5) {
        toast.error("Doctor license must be at least 5 characters.");
        setLoading(false);
        return;
      }
      if (!/^[0-9]{10}$/.test(phone)) {
        toast.error("Phone number must be exactly 10 digits.");
        setLoading(false);
        return;
      }
    }

    try {

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        toast.error("User creation failed.");
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: email,
          full_name: name,
          role: role,
          doctor_license: role === "doctor" ? doctorLicense : null,
          phone: role === "doctor" ? phone : null,
          status: role === "doctor" ? "pending" : "active",
        });

      if (profileError) throw profileError;

      if (role === "doctor") {
        toast.success(`Doctor registration for ${name} submitted. Admin approval required.`);
        navigate("/login");
      } else {
        toast.success(`Patient account for ${name} created successfully!`);
        navigate("/patient-dashboard");
      }

    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      
      {/* LEFT SECTION — BLOB GRADIENT */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center px-16">

        {/* ORIGINAL GRADIENT — EXACT SAME */}
        <div
          className="absolute inset-0 scale-110"
          style={{
            background: `
        radial-gradient(ellipse 90% 70% at 60% 110%, #38bdf8 0%, transparent 55%),
        radial-gradient(ellipse 80% 70% at 110% 40%, #818cf8 0%, transparent 50%),
        radial-gradient(ellipse 70% 60% at 20% 20%, #2dd4bf 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 80% 0%, #e879f9 0%, transparent 50%)
      `,
            filter: "blur(18px) saturate(1.4)",
          }}
        />

        {/* CONTENT */}
        <div className="relative z-10 max-w-md text-slate-800">

          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Your Health,
            <br />
            <span className="text-sky-600">Simplified</span>
          </h2>

          <p className="text-lg text-slate-600 mb-10">
            Connect with verified doctors, manage your medical
            records, and access healthcare services anytime
            in one secure platform.
          </p>

          <div className="space-y-6">

            <div className="flex gap-4">
              <div>⚡</div>
              <div>
                <h3 className="font-semibold">Instant Appointments</h3>
                <p className="text-sm text-slate-600">
                  Book consultations with trusted doctors within minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div>🔒</div>
              <div>
                <h3 className="font-semibold">Secure Health Records</h3>
                <p className="text-sm text-slate-600">
                  Your medical data protected with advanced encryption.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div>🤖</div>
              <div>
                <h3 className="font-semibold">AI Health Assistant</h3>
                <p className="text-sm text-slate-600">
                  Get instant symptom guidance anytime you need it.
                </p>
              </div>
            </div>

          </div>

          

        </div>

      </div>
      

      


      {/* RIGHT SECTION — SIGNUP CARD */}
      <div className="w-full md:w-1/2 relative bg-gradient-to-br from-sky-50 to-slate-50 flex flex-col items-center justify-center px-6 md:px-8 py-16 md:py-0 min-h-screen">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 md:top-8 md:left-8 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md shadow-sky-300/30 hover:shadow-lg hover:shadow-sky-300/40 transition-all duration-200 hover:-translate-y-0.5 z-50"
        >
          ← Home
        </button>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg shadow-sky-200/30 border border-sky-100/50 px-6 sm:px-10 py-8 sm:py-12 relative mt-2 sm:mt-0">

          {/* LOGO */}
          <div className="flex items-center gap-2 mb-8">
            <img src={logo} className="w-6 h-6 mix-blend-multiply opacity-90" alt="HealthSync" />
            <span className="font-bold text-sm text-sky-500 tracking-tight">
              HealthSync
            </span>
          </div>

          {/* HEADING */}
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            CREATE ACCOUNT
          </h1>

          <p className="text-sm text-slate-500 mb-8">
            Start your journey to better health today.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* ROLE SELECTOR */}
            <div className="flex bg-slate-100 rounded-lg p-1 gap-2">

              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${role === "patient"
                    ? "bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-md shadow-sky-300/30"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Patient
              </button>

              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${role === "doctor"
                    ? "bg-gradient-to-r from-sky-500 to-teal-400 text-white shadow-md shadow-sky-300/30"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Doctor
              </button>

            </div>

            {/* NAME */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Full Name
              </label>

              <div className="flex items-center h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 focus-within:bg-white transition-all">

                <User size={16} className="text-slate-400 mr-2" />

                <input
                  type="text"
                  placeholder=" "
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Email Address
              </label>

              <div className="flex items-center h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 focus-within:bg-white transition-all">

                <Mail size={16} className="text-slate-400 mr-2" />

                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Password
              </label>

              <div className="flex items-center h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 focus-within:bg-white transition-all">

                <Lock size={16} className="text-slate-400 mr-2" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>
            </div>

            {/* DOCTOR FIELDS */}
            {role === "doctor" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Doctor License Number
                  </label>
                  <div className="flex items-center h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 focus-within:bg-white transition-all">
                    <ShieldCheck size={16} className="text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="License Number"
                      className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
                      value={doctorLicense}
                      onChange={(e) => setDoctorLicense(e.target.value)}
                      required={role === "doctor"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center h-[44px] px-4 rounded-lg border border-slate-200 bg-slate-50 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 focus-within:bg-white transition-all">
                    <Phone size={16} className="text-slate-400 mr-2" />
                    <input
                      type="tel"
                      placeholder="10-digit Phone Number"
                      className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={role === "doctor"}
                    />
                  </div>
                </div>
              </>
            )}

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full h-[44px] mt-6 rounded-lg
                bg-gradient-to-r from-sky-500 to-teal-400
                hover:from-sky-400 hover:to-teal-300
                text-white text-sm font-semibold
                shadow-md shadow-sky-300/30
                hover:shadow-lg hover:shadow-sky-300/40
                hover:-translate-y-0.5
                transition-all duration-200
              "
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-sky-500 hover:text-sky-600 transition-colors"
            >
              Login here
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;