

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { supabase } from "./supabaseClient";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import "./App.css";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (e.g., login in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      setSession(session);
      
      // If the user signed in or out elsewhere, we might want to refresh to prevent identity drift
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // We only reload if the user ID has actually changed to avoid infinite loops
        // But for simplicity and safety, a full reload is often best to clear all state
        // window.location.reload(); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "12px",
            background: "#111827",
            color: "#fff",
            padding: "14px 16px",
            fontSize: "14px",
          },
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Dashboards (Role-protected via internal logic) */}
        <Route 
          path="/patient-dashboard" 
          element={<PatientDashboard key={session?.user?.id || "none"} />} 
        />
        <Route 
          path="/doctor-dashboard" 
          element={<DoctorDashboard key={session?.user?.id || "none"} />} 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter >
  );
}

export default App;