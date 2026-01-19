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

  return role === "patient" ? <PatientProfile /> : <DoctorProfile />;
};

export default CompleteProfile;
