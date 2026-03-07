import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import PatientProfile from "./patient/PatientProfile";
import DoctorProfile from "./doctor/Profile";

const CompleteProfile = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data?.role) {
        setRole(data.role);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Unable to load profile
      </div>
    );
  }

  // Wrap in a page layout so the form looks good as a full page
  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col">
      <div className="bg-white shadow-sm px-8 py-4">
        <h1 className="text-xl font-bold text-cyan-600">HealthSync</h1>
      </div>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-1">
            Please fill in the required details to continue.
          </p>
        </div>

        {role === "patient"
          ? <PatientProfile defaultEditing={true} />
          : <DoctorProfile defaultEditing={true} />
        }
      </div>
    </div>
  );
};

export default CompleteProfile;
