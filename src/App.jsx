import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PublicLayout from "./layouts/PublicLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      
      {/* Global Toaster */}
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
        {/* Public pages with Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Dashboards without Navbar */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
