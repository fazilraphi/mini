import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";



import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

import Appointments from "./pages/patient/Appointments";
import MyAppointments from "./pages/patient/Myappointments";
import Prescriptions from "./pages/patient/PatientPrescriptions";
import PatientProfile from "./pages/patient/PatientProfile";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ChatList from "./components/ChatList";

import "./App.css";

function App() {
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

        <Route path="/patient-dashboard" element={<PatientDashboard />} />

        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="my-appointments" element={<MyAppointments />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="chat" element={<ChatList />} />





      </Routes>

    </BrowserRouter >
  );
}

export default App;