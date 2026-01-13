import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    institution: "",
    avatar_url: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      setEmail(user.email);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, institution, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    };

    loadProfile();
  }, []);

  // Update profile info
  const updateProfile = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully");
      setIsEditing(false);
    }

    setLoading(false);
  };

  // Update email
  const updateEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email });

    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent to new address.");
  };

  // Update password
  const updatePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else toast.success("Password updated successfully.");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-mono text-center">Doctor Profile</h1>

      {/* PROFILE CARD */}
      <div className="bg-white p-8 rounded-2xl shadow space-y-6">
        <h2 className="text-lg font-medium text-gray-800 text-center">
          Profile Information
        </h2>

        {!isEditing ? (
          <div className="space-y-5 text-gray-700">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-base">
                {profile.full_name || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Institution</p>
              <p className="text-base">
                {profile.institution || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Avatar URL</p>
              <p className="text-base">
                {profile.avatar_url || "Not provided"}
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          // EDIT MODE
          <div className="space-y-4">
            <input
              className="border p-2 w-full rounded"
              placeholder="Full Name"
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Institution / Hospital"
              value={profile.institution || ""}
              onChange={(e) =>
                setProfile({ ...profile, institution: e.target.value })
              }
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Avatar URL (optional)"
              value={profile.avatar_url || ""}
              onChange={(e) =>
                setProfile({ ...profile, avatar_url: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Save Profile
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ACCOUNT SETTINGS */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold">Account Settings</h2>

        <input
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={updateEmail}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Change Email
        </button>

        <input
          className="border p-2 w-full rounded"
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={updatePassword}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
