import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/login";
import Register from "./pages/Register";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
