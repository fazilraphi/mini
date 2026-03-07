import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, User } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      // UPSERT instead of insert to avoid duplicate key errors
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: email,
          full_name: name,
          role: role,
          status: role === "doctor" ? "pending" : "active",
        });

      if (profileError) throw profileError;

      if (role === "doctor") {
        toast.success(
          "Doctor registration submitted. Admin approval required."
        );
        navigate("/login");
      } else {
        toast.success("Account created successfully!");
        navigate("/patient-dashboard");
      }

    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f3f7] to-[#cfdde3] flex flex-col">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-5 bg-white shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 bg-cyan-500 rounded-full"></div>
          HealthSync
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            Already have an account?
          </span>

          <Link
            to="/login"
            className="border border-cyan-500 text-cyan-600 px-5 py-2 rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT SIDE INFO */}
          <div className="space-y-6">

            <span className="bg-cyan-100 text-cyan-600 px-4 py-1 rounded-full text-xs font-medium">
              TRUSTED BY 50K+ PATIENTS
            </span>

            <h1 className="text-5xl font-bold leading-tight">
              Healthcare <span className="text-cyan-500">simplified</span> for you and your family.
            </h1>

            <p className="text-gray-600">
              Join thousands of users who consult with top-certified doctors instantly.
              Your health, our priority.
            </p>

            <div className="space-y-4 mt-6">

              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 w-8 h-8 rounded-full"></div>
                HD Video Consultations
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 w-8 h-8 rounded-full"></div>
                Digital Prescriptions
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 w-8 h-8 rounded-full"></div>
                24/7 Availability
              </div>

            </div>
          </div>

          {/* RIGHT SIGNUP FORM */}
          <div className="bg-white rounded-3xl shadow-lg p-10">

            <h2 className="text-2xl font-bold mb-2">
              Create Your Account
            </h2>

            <p className="text-gray-500 mb-6">
              Start your journey to better health today.
            </p>

            <form onSubmit={handleRegister} className="space-y-5">

              {/* ROLE SELECTOR */}
              <div className="flex bg-gray-100 rounded-lg p-1">

                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`flex-1 py-2 rounded-lg ${role === "patient"
                    ? "bg-cyan-500 text-white"
                    : "text-gray-600"
                    }`}
                >
                  Patient
                </button>

                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`flex-1 py-2 rounded-lg ${role === "doctor"
                    ? "bg-cyan-500 text-white"
                    : "text-gray-600"
                    }`}
                >
                  Doctor
                </button>

              </div>

              {/* NAME */}
              <div>
                <label className="text-sm text-gray-600">Full Name</label>

                <div className="flex items-center border rounded-xl px-3 py-2 mt-1">
                  <User size={18} className="text-gray-400 mr-2" />

                  <input
                    type="text"
                    placeholder="John Doe"
                    className="flex-1 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm text-gray-600">Email Address</label>

                <div className="flex items-center border rounded-xl px-3 py-2 mt-1">
                  <Mail size={18} className="text-gray-400 mr-2" />

                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="flex-1 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm text-gray-600">Password</label>

                <div className="flex items-center border rounded-xl px-3 py-2 mt-1">
                  <Lock size={18} className="text-gray-400 mr-2" />

                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-medium shadow-md transition disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account →"}
              </button>

            </form>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 pb-6">
        © 2026 HealthSync Health Systems. All rights reserved.
      </div>
    </div>
  );
};

export default Register;