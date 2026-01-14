import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created. Verify email before login.");
      setEmail("");
      setPassword("");
      setRole("patient");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg grid md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center px-10 bg-orange-50">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to <span className="text-orange-500">HealthSync</span>
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Create your account to access a secure healthcare management platform designed
            for patients and doctors to collaborate seamlessly.
          </p>
        </div>

        {/* RIGHT PANEL (FORM) */}
        <div className="p-8 sm:p-12">
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">
            Join the healthcare management platform.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* ROLE SELECTOR */}
            <div>
              <label className="block text-sm font-medium mb-2">Register As</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    role === "patient"
                      ? "bg-white shadow text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    role === "doctor"
                      ? "bg-white shadow text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  Doctor
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
