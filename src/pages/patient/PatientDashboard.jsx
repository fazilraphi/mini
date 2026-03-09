import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ChatList from "../../components/ChatList";
import Appointments from "./Appointments";
import MyAppointments from "./MyAppointments";
import Prescriptions from "./PatientPrescriptions";
import PatientProfile from "./PatientProfile";
import PatientChatbot from "./PatientChatbot";
import PatientComplaints from "./PatientComplaints";
import NotificationBell from "../../components/NotificationBell";

const PatientDashboard = () => {

  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [profile, setProfile] = useState(null);

  useEffect(() => {

    const loadProfile = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);

      const required = [
        "full_name",
        "age",
        "gender",
        "phone",
        "address",
        "blood_group",
        "emergency_contact"
      ];

      const incomplete = required.some(
        (field) => !data[field] || data[field].toString().trim() === ""
      );

      if (incomplete) {
        navigate("/complete-profile");
      }

    };

    loadProfile();

  }, [navigate]);



  const logout = async () => {

    await supabase.auth.signOut();
    navigate("/login");

  };


  if (!profile) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;
  }


  return (

    <div className="min-h-screen flex bg-[#F6F8FB]">

      {/* SIDEBAR */}

      <div className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">

        <div>

          <div className="flex items-center justify-between mb-10">
            <h2
              className="text-xl font-bold text-cyan-600 cursor-pointer"
              onClick={() => setActivePage("dashboard")}
            >
              HealthSync
            </h2>
            <NotificationBell />
          </div>

          <ul className="space-y-4 text-gray-700">

            <li
              onClick={() => setActivePage("dashboard")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "dashboard"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Dashboard
            </li>


            <li
              onClick={() => setActivePage("appointments")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "appointments"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Appointments
            </li>


            <li
              onClick={() => setActivePage("myappointments")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "myappointments"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              My Appointments
            </li>


            <li
              onClick={() => setActivePage("prescriptions")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "prescriptions"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Prescriptions
            </li>

            <li
              onClick={() => setActivePage("chat")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "chat"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Chat
            </li>

            <li
              onClick={() => setActivePage("records")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "records"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Medical Records
            </li>

            <li
              onClick={() => setActivePage("chatbot")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "chatbot"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Health Assistant
            </li>

            <li
              onClick={() => setActivePage("complaints")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "complaints"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Complaints
            </li>

            <li
              onClick={() => setActivePage("settings")}
              className={`cursor-pointer px-4 py-2 rounded-lg ${activePage === "settings"
                ? "bg-cyan-500 text-white"
                : "hover:text-cyan-600"
                }`}
            >
              Settings
            </li>
          </ul>

        </div>


        <div className="space-y-4">

          <button
            onClick={logout}
            className="w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>

          <button className="bg-red-500 text-white py-3 rounded-lg w-full">
            Emergency Call
          </button>

        </div>

      </div>



      {/* MAIN CONTENT */}

      <div className="flex-1 p-8">

        {/* DASHBOARD */}

        {activePage === "dashboard" && (

          <>

            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                Welcome back, {profile.full_name}
              </h1>
              <p className="text-gray-500">Your health dashboard</p>
            </div>


            <h2 className="text-xl font-semibold mb-4">
              Health Overview
            </h2>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Blood Group</p>
                <p className="text-2xl font-bold">{profile.blood_group}</p>
              </div>


              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Age</p>
                <p className="text-2xl font-bold">{profile.age}</p>
              </div>


              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Gender</p>
                <p className="text-2xl font-bold">{profile.gender}</p>
              </div>


              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="text-2xl font-bold break-words">
                  {profile.phone}
                </p>
              </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">

              <h3 className="font-semibold mb-4">
                Quick Actions
              </h3>

              <button
                onClick={() => setActivePage("appointments")}
                className="w-full bg-cyan-500 text-white py-2 rounded-lg mb-3"
              >
                Book Appointment
              </button>

              <button
                onClick={() => setActivePage("chat")}
                className="w-full border py-2 rounded-lg"
              >
                Message Doctor
              </button>

            </div>

          </>

        )}


        {/* APPOINTMENTS */}

        {activePage === "appointments" && <Appointments />}


        {/* MY APPOINTMENTS */}

        {activePage === "myappointments" && <MyAppointments />}


        {/* PRESCRIPTIONS */}

        {activePage === "prescriptions" && <Prescriptions />}


        {/* SETTINGS */}

        {activePage === "settings" && <PatientProfile />}


        {activePage === "chat" && <ChatList />}

        {/* MEDICAL RECORDS */}

        {activePage === "records" && <Prescriptions />}

        {/* CHATBOT PAGE */}

        {activePage === "chatbot" && <PatientChatbot />}

        {/* COMPLAINTS */}

        {activePage === "complaints" && <PatientComplaints />}

      </div>

    </div>

  );

};

export default PatientDashboard;