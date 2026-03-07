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
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A202C", margin: "0 0 4px" }}>Doctor Profile</h1>
          <p style={{ color: "#718096", fontSize: 14, margin: 0 }}>Manage your professional information and account security.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <IconBtn title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#718096"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
          </IconBtn>
          <IconBtn title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#718096"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
          </IconBtn>
        </div>
      </div>

      {/* Profile Info Section */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0BC5EA"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", margin: 0 }}>Profile Information</h2>
        </div>

        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16, overflow: "hidden",
                background: "linear-gradient(135deg,#BEE3F8,#90CDF4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: "#2B6CB0",
                border: "3px solid #EBF8FF",
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initial
                }
              </div>
              <div style={{
                position: "absolute", bottom: -6, right: -6, width: 26, height: 26,
                background: "#0BC5EA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff", cursor: "pointer",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M18.2 12.08c.04-.26.08-.53.08-.08 0-.26-.02-.53-.06-.8l1.71-1.33c.15-.12.19-.34.1-.51l-1.62-2.8c-.1-.18-.3-.24-.48-.18l-2.02.8c-.42-.32-.87-.59-1.36-.8L14.24 5c-.03-.2-.2-.34-.4-.34h-3.24c-.2 0-.36.14-.4.34l-.3 2.14c-.5.21-.94.48-1.37.8l-2-.8c-.2-.07-.4 0-.5.18L4.41 10.12c-.09.17-.05.39.1.51l1.72 1.33c-.04.27-.07.55-.07.86 0 .31.03.59.07.86L4.51 15.01c-.15.12-.19.34-.1.51l1.62 2.8c.1.18.3.25.48.18l2.02-.8c.42.32.87.59 1.36.8l.3 2.14c.04.2.2.34.4.34h3.24c.2 0 .37-.14.4-.34l.3-2.14c.5-.21.95-.48 1.37-.8l2 .8c.2.07.4 0 .5-.18l1.62-2.8c.09-.17.05-.39-.1-.51l-1.7-1.33z" /></svg>
              </div>
            </div>

            {/* Info or Edit form */}
            {isEditing ? (
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Full Name *</label>
                  <input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} style={inputStyle} placeholder="Dr. Jane Doe" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Speciality *</label>
                  <input value={editForm.speciality} onChange={e => setEditForm(p => ({ ...p, speciality: e.target.value }))} style={inputStyle} placeholder="Cardiologist" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Institution *</label>
                  <input value={editForm.institution} onChange={e => setEditForm(p => ({ ...p, institution: e.target.value }))} style={inputStyle} placeholder="St. Hospital" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4 }}>Avatar URL</label>
                  <input value={editForm.avatar_url} onChange={e => setEditForm(p => ({ ...p, avatar_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
                </div>
                <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
                  <button onClick={updateProfile} disabled={loading} style={{
                    background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", color: "#fff", border: "none",
                    borderRadius: 10, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  }}>
                    {loading ? "Saving..." : "✎ Save Profile"}
                  </button>
                  {!defaultEditing && (
                    <button onClick={() => { setEditForm({ ...profile }); setIsEditing(false); }} style={{
                      background: "#EDF2F7", color: "#4A5568", border: "none",
                      borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                    }}>Cancel</button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A202C", margin: "0 0 6px" }}>{profile.full_name || "Doctor"}</h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {profile.institution && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#4A5568" }}>
                        🏥 {profile.institution}
                      </span>
                    )}
                    {profile.speciality && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#0BC5EA" }}>
                        🩺 {profile.speciality}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setEditForm({ ...profile }); setIsEditing(true); }} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "9px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                  ✎ Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0BC5EA"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A202C", margin: 0 }}>Account Settings</h2>
        </div>
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

        {/* Bottom stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div style={{ ...card, border: "1.5px solid #E2E8F0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>Profile Completion</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1A202C", margin: "0 0 8px" }}>{completionPct}%</p>
            <div style={{ height: 4, background: "#E2E8F0", borderRadius: 999 }}>
              <div style={{ height: "100%", width: `${completionPct}%`, background: "linear-gradient(90deg,#0BC5EA,#00B5D8)", borderRadius: 999 }} />
            </div>
          </div>
          <div style={{ ...card, border: "1.5px solid #E2E8F0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>Active Status</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#48BB78" }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1A202C" }}>Online</span>
            </div>
          </div>
          <div style={{ ...card, background: "linear-gradient(135deg,#0BC5EA,#2B6CB0)", border: "none" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>Last Login</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{lastLogin}</p>
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
