import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,.07)", padding: 24 };
const inputStyle = {
  width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px",
  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const Profile = ({ defaultEditing = false }) => {
  const [profile, setProfile] = useState({ full_name: "", institution: "", speciality: "", avatar_url: "" });
  const [editForm, setEditForm] = useState({ full_name: "", institution: "", speciality: "", avatar_url: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [lastLogin] = useState(new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }));

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email);

      const { data } = await supabase.from("profiles").select("full_name, institution, speciality, avatar_url").eq("id", user.id).single();
      if (data) {
        const filled = {
          full_name: data.full_name || "",
          institution: data.institution || "",
          speciality: data.speciality || "",
          avatar_url: data.avatar_url || "",
        };
        setProfile(filled);
        setEditForm(filled);
        if (defaultEditing) setIsEditing(true);
      }
      setPageLoading(false);
    };
    loadProfile();
  }, [defaultEditing]);

  const validateProfile = () => {
    if (!editForm.full_name.trim()) return "Full name is required";
    if (!editForm.institution.trim()) return "Institution is required";
    if (!editForm.speciality.trim()) return "Speciality is required";
    return null;
  };

  const updateProfile = async () => {
    const err = validateProfile();
    if (err) return toast.error(err);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update({
      full_name: editForm.full_name.trim(),
      institution: editForm.institution.trim(),
      speciality: editForm.speciality.trim(),
      avatar_url: editForm.avatar_url.trim() || null,
    }).eq("id", user.id);

    if (error) { toast.error(error.message); }
    else {
      toast.success("Profile updated!");
      setProfile({ ...editForm });
      setIsEditing(false);
      if (defaultEditing) setTimeout(() => window.location.href = "/doctor-dashboard", 800);
    }
    setLoading(false);
  };

  const updatePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setPassword(""); }
  };

  const completionFields = ["full_name", "institution", "speciality", "avatar_url"];
  const filled = completionFields.filter(f => profile[f]).length;
  const completionPct = Math.round((filled / completionFields.length) * 100);

  if (pageLoading) return <div style={{ padding: 40, color: "#718096" }}>Loading profile...</div>;

  const initial = profile.full_name?.charAt(0)?.toUpperCase() || "D";

  return (
    <div className="max-w-[860px] w-full px-4 md:px-0 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Doctor Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your professional information and account security.</p>
        </div>
      </div>

      {/* Profile Info Section */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0BC5EA"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", margin: 0 }}>Profile Information</h2>
        </div>

        <div style={{ ...card, marginBottom: 20 }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-3xl font-bold text-blue-700 border-4 border-blue-50 shadow-sm">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : initial
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-md hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M18.2 12.08c.04-.26.08-.53.08-.08 0-.26-.02-.53-.06-.8l1.71-1.33c.15-.12.19-.34.1-.51l-1.62-2.8c-.1-.18-.3-.24-.48-.18l-2.02.8c-.42-.32-.87-.59-1.36-.8L14.24 5c-.03-.2-.2-.34-.4-.34h-3.24c-.2 0-.36.14-.4.34l-.3 2.14c-.5.21-.94.48-1.37.8l-2-.8c-.2-.07-.4 0-.5.18L4.41 10.12c-.09.17-.05.39.1.51l1.72 1.33c-.04.27-.07.55-.07.86 0 .31.03.59.07.86L4.51 15.01c-.15.12-.19.34-.1.51l1.62 2.8c.1.18.3.25.48.18l2.02-.8c.42.32.87.59 1.36.8l.3 2.14c.04.2.2.34.4.34h3.24c.2 0 .37-.14.4-.34l.3-2.14c.5-.21.95-.48 1.37-.8l2 .8c.2.07.4 0 .5-.18l1.62-2.8c.09-.17.05-.39-.1-.51l-1.7-1.33z" /></svg>
              </div>
            </div>

            {/* Info or Edit form */}
            {isEditing ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name *</label>
                  <input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} style={inputStyle} placeholder="Dr. Jane Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Speciality *</label>
                  <input value={editForm.speciality} onChange={e => setEditForm(p => ({ ...p, speciality: e.target.value }))} style={inputStyle} placeholder="Cardiologist" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Institution *</label>
                  <input value={editForm.institution} onChange={e => setEditForm(p => ({ ...p, institution: e.target.value }))} style={inputStyle} placeholder="St. Hospital" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Avatar URL</label>
                  <input value={editForm.avatar_url} onChange={e => setEditForm(p => ({ ...p, avatar_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={updateProfile} disabled={loading} className="flex-1 bg-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all disabled:opacity-50">
                    {loading ? "Saving..." : "✎ Save Profile"}
                  </button>
                  {!defaultEditing && (
                    <button onClick={() => { setEditForm({ ...profile }); setIsEditing(false); }} className="bg-gray-100 text-gray-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile.full_name || "Doctor"}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {profile.institution && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                        🏥 {profile.institution}
                      </span>
                    )}
                    {profile.speciality && (
                      <span className="bg-cyan-50 text-cyan-600 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-cyan-100">
                        🩺 {profile.speciality}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setEditForm({ ...profile }); setIsEditing(true); }} className="bg-cyan-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all text-sm shrink-0">
                  ✎ Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0BC5EA"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", margin: 0 }}>Account Settings</h2>
          </div>
          <button
            onClick={() => setShowAccountSettings(o => !o)}
            style={{
              fontSize: 13, fontWeight: 600, padding: "8px 18px",
              borderRadius: 10, border: "1px solid #E2E8F0",
              background: showAccountSettings ? "#EBF8FF" : "#fff",
              color: showAccountSettings ? "#0BC5EA" : "#4A5568",
              cursor: "pointer",
            }}
          >
            {showAccountSettings ? "Hide" : "Change Password"}
          </button>
        </div>

        {showAccountSettings && (
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 8 }}>Email Address</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F7FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#A0AEC0"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                <span style={{ fontSize: 14, color: "#4A5568" }}>{email}</span>
              </div>
              <p style={{ fontSize: 12, color: "#A0AEC0", marginTop: 6 }}>Email cannot be changed from this panel.</p>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 8 }}>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <button onClick={updatePassword} style={{
                background: "#1A202C", color: "#fff", border: "none",
                borderRadius: 10, padding: "11px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>
                Update Password
              </button>
            </div>
          </div>
        )}

        {/* Bottom stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div style={{ ...card, border: "1.5px solid #E2E8F0" }}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Profile Completion</p>
            <p className="text-3xl font-black text-gray-900 mb-3">{completionPct}%</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div style={{ width: `${completionPct}%` }} className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500" />
            </div>
          </div>
          <div style={{ ...card, border: "1.5px solid #E2E8F0" }}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Active Status</p>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(72,187,120,0.5)] animate-pulse" />
              <span className="text-xl font-bold text-gray-900">Online</span>
            </div>
          </div>
          <div style={{ ...card }} className="bg-gradient-to-br from-cyan-500 to-blue-700 border-none shadow-lg shadow-cyan-500/20 sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-3">Last Login</p>
            <p className="text-lg font-black text-white">{lastLogin}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const IconBtn = ({ children, title }) => (
  <button title={title} style={{
    width: 38, height: 38, borderRadius: 10, border: "1px solid #E2E8F0",
    background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  }}>
    {children}
  </button>
);

export default Profile;
