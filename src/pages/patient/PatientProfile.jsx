import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { Camera, Mail, Lock, Bell, Shield, Smartphone } from "lucide-react";

const initialForm = {
  full_name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  blood_group: "",
  emergency_contact: "",
  medical_history: "",
  avatar_url: "",
};

const PatientProfile = ({ defaultEditing = false }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setEmail(user.email);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) toast.error(error.message);
    else {
      const filled = { ...initialForm, ...data };
      setForm(filled);
      setEditForm(filled);
      if (defaultEditing) setIsEditing(true);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setEditForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const openEdit = () => {
    setEditForm({ ...form });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditForm({ ...form });
    setIsEditing(false);
  };

  const validateForm = () => {
    if (!editForm.full_name?.trim()) return "Full name required";
    if (!editForm.age) return "Age required";
    if (!editForm.gender) return "Gender required";
    if (!editForm.phone) return "Phone required";
    if (!editForm.address) return "Address required";
    if (!editForm.blood_group) return "Blood group required";
    if (!editForm.emergency_contact) return "Emergency contact required";
    return null;
  };

  const saveProfile = async () => {
    const errorMsg = validateForm();
    if (errorMsg) return toast.error(errorMsg);

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({ ...editForm, age: Number(editForm.age) })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
      setForm({ ...editForm, age: Number(editForm.age) });
      setIsEditing(false);

      if (defaultEditing) {
        setTimeout(() => navigate("/patient-dashboard", { replace: true }), 800);
      }
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicURL = urlData.publicUrl;

      setForm((prev) => ({ ...prev, avatar_url: publicURL }));
      setEditForm((prev) => ({ ...prev, avatar_url: publicURL }));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ avatar_url: publicURL })
          .eq("id", user.id);
        toast.success("Profile photo updated!");
      }
    } catch (error) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const changePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPassword("");
    }
  };

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Loading profile...</p>
        </div>
      </div>
    );

  const initial = form.full_name?.charAt(0)?.toUpperCase() || "P";

  return (
    <>
      {/* ===== MOBILE VIEW ===== */}
      <div className="block md:hidden w-full bg-gradient-to-br from-cyan-50 via-white to-blue-50 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* HEADER */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg px-5 pt-4 pb-3 border-b border-cyan-100/50">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {defaultEditing ? "Complete Your Profile" : "Patient Profile"}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {defaultEditing ? "Set up your health information" : "Your health information"}
            </p>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex flex-col w-full px-5 pt-6 pb-8 gap-6">

            {/* PROFILE CARD */}
            {isEditing ? (
              // EDIT MODE
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-100 to-cyan-200 shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                      {form.avatar_url ? (
                        <img
                          src={form.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-black text-cyan-600">{initial}</span>
                      )}
                    </div>
                    <input
                      type="file"
                      id="patient-avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={uploadAvatar}
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="patient-avatar-upload"
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-lg border-4 border-white"
                    >
                      {uploadingImage ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Camera size={18} />
                      )}
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <Field
                    label="Full Name *"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Age *"
                      name="age"
                      type="number"
                      value={editForm.age}
                      onChange={handleChange}
                      placeholder="Age"
                    />

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Gender *</label>
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleChange}
                        className="border border-cyan-200 bg-cyan-50 rounded-2xl px-4 py-3 w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Blood Group *</label>
                    <select
                      name="blood_group"
                      value={editForm.blood_group}
                      onChange={handleChange}
                      className="border border-cyan-200 bg-cyan-50 rounded-2xl px-4 py-3 w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    >
                      <option value="">Select blood group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label="Phone *"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                  />

                  <Field
                    label="Emergency Contact *"
                    name="emergency_contact"
                    value={editForm.emergency_contact}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                  />

                  <Field
                    label="Address / Location *"
                    name="address"
                    value={editForm.address}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Medical History</label>
                    <textarea
                      name="medical_history"
                      value={editForm.medical_history}
                      onChange={handleChange}
                      placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
                      rows={3}
                      className="border border-cyan-200 bg-cyan-50 rounded-2xl px-4 py-3 w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full bg-cyan-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                  {!defaultEditing && (
                    <button
                      onClick={cancelEdit}
                      className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // VIEW MODE
              <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 p-6 text-white shadow-xl">
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-900/20 rounded-full blur-2xl"></div>

                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-white/95 p-0.5 shadow-lg border-2 border-white/30 overflow-hidden flex items-center justify-center">
                      {form.avatar_url ? (
                        <img
                          src={form.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(form.avatar_url, "_blank")}
                        />
                      ) : (
                        <span className="text-3xl font-black text-cyan-600">{initial}</span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold">{form.full_name || "Patient"}</h2>
                      <p className="text-white/80 text-sm font-semibold flex items-center justify-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        Verified Patient
                      </p>
                    </div>

                    <button
                      onClick={openEdit}
                      className="mt-2 px-6 py-2.5 bg-white text-cyan-600 rounded-full font-bold text-sm hover:bg-cyan-50 transition-all shadow-lg active:scale-95"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Health Info Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="AGE" value={`${form.age || "-"}`} icon="📅" />
                    <InfoCard label="GENDER" value={form.gender || "-"} icon="👤" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="BLOOD GROUP" value={form.blood_group || "-"} icon="🩸" />
                    <InfoCard label="PHONE" value={form.phone || "-"} icon="📱" />
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-white rounded-2xl shadow-md border border-cyan-200 p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📍 Location</p>
                  <p className="font-bold text-gray-900 text-sm leading-relaxed">{form.address || "-"}</p>
                </div>

                {/* Emergency Contact Card */}
                <div className="bg-white rounded-2xl shadow-md border border-cyan-200 p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🚨 Emergency Contact</p>
                  <p className="font-bold text-gray-900 text-sm">{form.emergency_contact || "-"}</p>
                </div>

                {/* Medical History */}
                {form.medical_history && (
                  <div className="bg-white rounded-2xl shadow-md border border-cyan-200 p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📋 Medical History</p>
                    <div className="flex flex-wrap gap-2">
                      {form.medical_history
                        .split(",")
                        .map((item, i) => (
                          <span
                            key={i}
                            className="bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-full text-xs font-bold text-cyan-700"
                          >
                            {item.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACCOUNT SETTINGS - Only in view mode */}
            {!isEditing && (
              <div className="bg-white rounded-2xl shadow-md border border-cyan-200 overflow-hidden">
                <button
                  onClick={() => setShowAccountSettings(!showAccountSettings)}
                  className="w-full px-5 py-4 flex justify-between items-center hover:bg-cyan-50 transition-all"
                >
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Account Security</h3>
                  <span className>
                    Change Password
                  </span>
                </button>

                {showAccountSettings && (
                  <div className="px-5 py-4 border-t border-cyan-100 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                      <div className="bg-cyan-50 px-4 py-3 rounded-xl border border-cyan-200 flex items-center gap-2">
                        <Mail size={16} className="text-cyan-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-700 break-all">{email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-cyan-200 bg-cyan-50 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      />
                      <button
                        onClick={changePassword}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BOTTOM CARDS - Only in view mode */}
            {!isEditing && (
              <div className="space-y-3">
                <SmallCard title="Notifications" subtitle="Manage alerts" icon="🔔" />
                <SmallCard title="Privacy" subtitle="Data sharing" icon="🔒" />
                <SmallCard title="Sessions" subtitle="Logged in devices" icon="📱" />
              </div>
            )}

            {/* Footer Padding */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP VIEW ===== */}
      <div className="hidden md:block w-full bg-gradient-to-br from-cyan-50 via-white to-blue-50 min-h-screen">
        <div className="space-y-8 max-w-5xl mx-auto p-8">

          {/* HEADER */}
          <div className="pt-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {defaultEditing ? "Complete Your Profile" : "Patient Profile"}
            </h1>
            <p className="text-gray-500 font-semibold mt-2">
              {defaultEditing ? "Set up your health information" : "Your comprehensive health information"}
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-cyan-200">
            <div className="grid md:grid-cols-3 gap-0">
              {/* Avatar & Side Panel */}
              <div className="bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-900/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-3xl bg-white/95 p-1 shadow-xl border-4 border-white/30 overflow-hidden flex items-center justify-center mb-6">
                    {form.avatar_url ? (
                      <img
                        src={form.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(form.avatar_url, "_blank")}
                      />
                    ) : (
                      <span className="text-6xl font-black text-cyan-600">{initial}</span>
                    )}
                  </div>

                  <input
                    type="file"
                    id="patient-avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadAvatar}
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="patient-avatar-upload"
                    className="px-6 py-2 bg-white/20 backdrop-blur text-white rounded-full font-bold text-sm hover:bg-white/30 cursor-pointer transition-all border border-white/30"
                  >
                    {uploadingImage ? "Uploading..." : "Change Photo"}
                  </label>

                  <div className="mt-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">{form.full_name || "Patient"}</h2>
                    <p className="text-white/80 text-sm font-semibold flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                      Verified Patient
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2 p-10">
                {isEditing ? (
                  // EDIT MODE
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      Edit Profile
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <Field
                        label="Full Name *"
                        name="full_name"
                        value={editForm.full_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />

                      <Field
                        label="Age *"
                        name="age"
                        type="number"
                        value={editForm.age}
                        onChange={handleChange}
                        placeholder="25"
                      />

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Gender *</label>
                        <select
                          name="gender"
                          value={editForm.gender}
                          onChange={handleChange}
                          className="border border-cyan-200 bg-cyan-50 rounded-xl px-4 py-3 w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Blood Group *</label>
                        <select
                          name="blood_group"
                          value={editForm.blood_group}
                          onChange={handleChange}
                          className="border border-cyan-200 bg-cyan-50 rounded-xl px-4 py-3 w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        >
                          <option value="">Select blood group</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <Field
                        label="Phone *"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />

                      <Field
                        label="Emergency Contact *"
                        name="emergency_contact"
                        value={editForm.emergency_contact}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />

                      <div className="col-span-2">
                        <Field
                          label="Address / Location *"
                          name="address"
                          value={editForm.address}
                          onChange={handleChange}
                          placeholder="City, State, Country"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Medical History</label>
                        <textarea
                          name="medical_history"
                          value={editForm.medical_history}
                          onChange={handleChange}
                          placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
                          rows={3}
                          className="border border-cyan-200 bg-cyan-50 rounded-xl px-4 py-3 w-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex-1 bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {saving ? "Saving..." : "Save Profile"}
                      </button>
                      {!defaultEditing && (
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                        Health Information
                      </h3>
                      <button
                        onClick={openEdit}
                        className="bg-cyan-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 transition-all active:scale-95"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-2 gap-6">
                      <DesktopInfo label="AGE" value={`${form.age || "-"} Years`} icon="📅" />
                      <DesktopInfo label="GENDER" value={form.gender || "-"} icon="👤" />
                      <DesktopInfo label="BLOOD GROUP" value={form.blood_group || "-"} icon="🩸" />
                      <DesktopInfo label="PHONE" value={form.phone || "-"} icon="📱" />
                      <DesktopInfo label="EMERGENCY" value={form.emergency_contact || "-"} icon="🚨" />
                      <DesktopInfo label="LOCATION" value={form.address || "-"} icon="📍" />
                    </div>

                    {/* MEDICAL HISTORY */}
                    {form.medical_history && (
                      <div className="pt-4 border-t border-cyan-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">📋 Medical History</p>
                        <div className="flex flex-wrap gap-3">
                          {form.medical_history
                            .split(",")
                            .map((item, i) => (
                              <span
                                key={i}
                                className="bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-full text-sm font-bold text-cyan-700"
                              >
                                {item.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACCOUNT SETTINGS — only shown in view mode */}
          {!isEditing && (
            <>
              <div className="bg-white rounded-3xl shadow-md border border-cyan-200 overflow-hidden">
                <button
                  onClick={() => setShowAccountSettings(!showAccountSettings)}
                  className="w-full px-8 py-6 flex justify-between items-center hover:bg-cyan-50/50 transition-all"
                >
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Account Security</h3>
                  <span className={`text-2xl transition-transform ${showAccountSettings ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {showAccountSettings && (
                  <div className="px-8 py-6 border-t border-cyan-200 grid grid-cols-2 gap-10">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Registered Email Address</label>
                      <div className="bg-cyan-50 px-6 py-4 rounded-xl border border-cyan-200 flex items-center gap-2">
                        <Mail size={20} className="text-cyan-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-700 break-all">{email}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-400 mt-2">
                        Contact admin to change your primary email.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Update Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-cyan-200 bg-cyan-50 rounded-xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      />
                      <button
                        onClick={changePassword}
                        className="w-full py-4 bg-cyan-600 text-white rounded-xl font-black shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 transition-all active:scale-95"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM CARDS */}
              <div className="grid grid-cols-3 gap-6">
                <DesktopSmallCard title="Notifications" subtitle="Manage alerts & emails" icon="🔔" />
                <DesktopSmallCard title="Privacy" subtitle="Data sharing settings" icon="🔒" />
                <DesktopSmallCard title="Sessions" subtitle="Manage logged in devices" icon="📱" />
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium"
    />
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group hover:bg-white hover:border-gray-100 transition-all">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="font-black text-gray-900">{value || "-"}</p>
  </div>
);

const InfoCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl shadow-md border border-cyan-200 p-4 flex flex-col items-center justify-center text-center gap-1 min-h-[90px] w-full overflow-hidden">
    <span className="text-xl mb-1">{icon}</span>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
    <p className="font-bold text-gray-900 text-sm break-all w-full leading-tight">{value || "-"}</p>
  </div>
);

const SmallCard = ({ title, subtitle, icon }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <p className="font-black text-gray-900 group-hover:text-cyan-600 transition-colors uppercase tracking-tight text-sm">{title}</p>
        <p className="text-xs font-bold text-gray-400">{subtitle}</p>
      </div>
    </div>
  </div>
);

const DesktopInfo = ({ label, value, icon }) => (
  <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-6 hover:shadow-md transition-all">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{icon} {label}</p>
    <p className="font-black text-gray-900 text-lg">{value || "-"}</p>
  </div>
);

const DesktopSmallCard = ({ title, subtitle, icon }) => (
  <div className="bg-white rounded-2xl shadow-md border border-cyan-200 p-6 hover:shadow-lg hover:border-cyan-400 transition-all group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform group-hover:bg-cyan-100">{icon}</div>
      <div>
        <p className="font-black text-gray-900 uppercase tracking-tight text-sm group-hover:text-cyan-600 transition-colors">{title}</p>
        <p className="text-xs font-semibold text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default PatientProfile;
