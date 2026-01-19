import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    institution: "",
    speciality: "",
    avatar_url: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, institution, speciality, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({
          full_name: data.full_name || "",
          institution: data.institution || "",
          speciality: data.speciality || "",
          avatar_url: data.avatar_url || "",
        });
      }
    };

    loadProfile();
  }, []);

  const validateProfile = () => {
    if (!profile.full_name.trim()) return "Full name is required";
    if (!profile.institution.trim()) return "Institution is required";
    if (!profile.speciality.trim()) return "Speciality is required";
    return null;
  };

const updateProfile = async () => {
  const validationError = validateProfile();
  if (validationError) return toast.error(validationError);

  setLoading(true);

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profile.full_name.trim(),
      institution: profile.institution.trim(),
      speciality: profile.speciality.trim(),
      avatar_url: profile.avatar_url.trim() || null,
    })
    .eq("id", user.id);

  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Profile updated successfully");
    setIsEditing(false);

    // ✅ ADD THIS: redirect after successful completion
    setTimeout(() => {
      window.location.href = "/doctor-dashboard";
    }, 800);
  }

  setLoading(false);
};


  const updatePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully");
      setPassword("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Doctor Profile
      </h1>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-orange-600">
                  {profile.full_name?.charAt(0) || "D"}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                Profile Information
              </h2>
              <p className="text-sm text-gray-500">
                Manage your professional information
              </p>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {profile.full_name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Institution</p>
                  <p className="font-medium">
                    {profile.institution || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Speciality</p>
                  <p className="font-medium">
                    {profile.speciality || "Not provided"}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Full Name"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />

                <input
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Institution / Hospital"
                  value={profile.institution}
                  onChange={(e) =>
                    setProfile({ ...profile, institution: e.target.value })
                  }
                />

                <input
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Speciality (e.g. Cardiologist)"
                  value={profile.speciality}
                  onChange={(e) =>
                    setProfile({ ...profile, speciality: e.target.value })
                  }
                />

                <input
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Avatar URL (optional)"
                  value={profile.avatar_url}
                  onChange={(e) =>
                    setProfile({ ...profile, avatar_url: e.target.value })
                  }
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 px-5 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNT SETTINGS */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-800">
            Account Settings
          </h2>
          <p className="text-sm text-gray-500">
            Manage login credentials securely
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-500">Email (read-only)</label>
          <div className="mt-1 px-4 py-2 bg-gray-100 rounded-lg text-sm">
            {email}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
          />

          <button
            onClick={updatePassword}
            className="mt-2 bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg text-sm"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
