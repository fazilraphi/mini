import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import {
  Mail,
  Shield,
  Award,
  Edit3,
  Camera,
  CheckCircle,
  Clock,
  Zap,
  Heart,
} from "lucide-react";

const DoctorProfile = ({ defaultEditing = false }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: "",
    institution: "",
    speciality: "",
    avatar_url: "",
    doctor_license: "",
    phone: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    institution: "",
    speciality: "",
    avatar_url: "",
    doctor_license: "",
    phone: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [lastLogin] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, institution, speciality, avatar_url, doctor_license, phone")
        .eq("id", user.id)
        .single();

      if (data) {
        const filled = {
          full_name: data.full_name || "",
          institution: data.institution || "",
          speciality: data.speciality || "",
          avatar_url: data.avatar_url || "",
          doctor_license: data.doctor_license || "",
          phone: data.phone || "",
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
    if (!editForm.doctor_license.trim()) return "License number is required";
    if (!editForm.phone.trim()) return "Phone number is required";
    if (!/^[0-9]{10}$/.test(editForm.phone.trim())) return "Phone number must be 10 digits";
    return null;
  };

  const updateProfile = async () => {
    const err = validateProfile();
    if (err) return toast.error(err);

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name.trim(),
        institution: editForm.institution.trim(),
        speciality: editForm.speciality.trim(),
        avatar_url: editForm.avatar_url.trim() || null,
        doctor_license: editForm.doctor_license.trim(),
        phone: editForm.phone.trim(),
      })
      .eq("id", user.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated!");
      setProfile({ ...editForm });
      setIsEditing(false);

      if (defaultEditing) {
        setTimeout(() => navigate("/doctor-dashboard", { replace: true }), 800);
      }
    }

    setLoading(false);
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

      setProfile((prev) => ({ ...prev, avatar_url: publicURL }));
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

  const updatePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setPassword("");
      setShowAccountSettings(false);
    }
  };

  const completionFields = [
    "full_name",
    "institution",
    "speciality",
    "avatar_url",
    "doctor_license",
    "phone",
  ];

  const filledCount = completionFields.filter((f) => profile[f]).length;
  const completionPct = Math.round(
    (filledCount / completionFields.length) * 100
  );

  if (pageLoading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );

  const initial = profile.full_name?.charAt(0)?.toUpperCase() || "D";

  return (
    <>
      {/* MOBILE VIEW (Mobile devices only) */}
      <div className="block md:hidden w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* HEADER - Sticky Top */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg px-5 pt-4 pb-3 border-b border-slate-100/50">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Professional Profile
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your credentials
            </p>
          </div>

          {/* MAIN CONTENT - Flex Column Layout */}
          <div className="flex flex-col w-full px-5 pt-6 pb-8 gap-6">
            
            {/* PREMIUM PROFILE CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 p-6 text-white shadow-2xl transform transition-all duration-300 hover:scale-105">
              {/* Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-900/20 rounded-full blur-2xl"></div>

              <div className="relative z-10 space-y-6">
                {/* Avatar & Name Section */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-white/95 p-0.5 shadow-xl border-2 border-white/30">
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="avatar"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(profile.avatar_url, "_blank")}
                            title="Click to view full image"
                          />
                        ) : (
                          <span className="text-3xl font-black text-blue-500">
                            {initial}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Camera Button */}
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={uploadAvatar}
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center cursor-pointer transition-all shadow-lg border border-white/20"
                    >
                      {uploadingImage ? (
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <Camera size={16} />
                      )}
                    </label>
                  </div>

                  {/* Name & Verified */}
                  <div className="flex-1 pt-1">
                    {isEditing ? (
                      <input
                        value={editForm.full_name}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            full_name: e.target.value,
                          }))
                        }
                        className="w-full bg-white/20 backdrop-blur px-3 py-2 rounded-xl text-white placeholder-white/50 font-bold text-lg mb-2 border border-white/20"
                      />
                    ) : (
                      <h2 className="text-xl font-bold mb-2">
                        {profile.full_name || "Doctor"}
                      </h2>
                    )}

                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                      <CheckCircle size={12} />
                      Verified
                    </div>
                  </div>
                </div>

                {/* Speciality & Institution */}
                <div className="space-y-3 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Shield size={16} className="flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/70 uppercase">Speciality</label>
                        <input
                          value={editForm.speciality}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              speciality: e.target.value,
                            }))
                          }
                          className="w-full bg-white/20 px-3 py-1 rounded-lg text-white placeholder-white/50 text-sm font-semibold border border-white/20"
                        />
                      </div>
                    ) : (
                      <span>Speciality: {profile.speciality || "Not set"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Shield size={16} className="flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/70 uppercase">License Number</label>
                        <input
                          placeholder="License Number"
                          value={editForm.doctor_license}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              doctor_license: e.target.value,
                            }))
                          }
                          className="w-full bg-white/20 px-3 py-1 rounded-lg text-white placeholder-white/50 text-sm font-semibold border border-white/20"
                        />
                      </div>
                    ) : (
                      <span>License: {profile.doctor_license || "Not set"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Zap size={16} className="flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/70 uppercase">Phone Number</label>
                        <input
                          placeholder="Phone Number"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              phone: e.target.value,
                            }))
                          }
                          className="w-full bg-white/20 px-3 py-1 rounded-lg text-white placeholder-white/50 text-sm font-semibold border border-white/20"
                        />
                      </div>
                    ) : (
                      <span>Phone: {profile.phone || "Not set"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Award size={16} className="flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/70 uppercase">Institution</label>
                        <input
                          value={editForm.institution}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              institution: e.target.value,
                            }))
                          }
                          className="w-full bg-white/20 px-3 py-1 rounded-lg text-white placeholder-white/50 text-sm font-semibold border border-white/20"
                        />
                      </div>
                    ) : (
                      <span>Institution: {profile.institution || "Not set"}</span>
                    )}
                  </div>
                </div>

                {/* Edit / Save Buttons */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={updateProfile}
                        className="flex-1 px-4 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm(profile);
                        }}
                        className="flex-1 px-4 py-3 bg-white/20 backdrop-blur text-white rounded-xl font-bold border border-white/30 hover:bg-white/30 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-3 bg-white text-blue-600 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ACCOUNT SECURITY CARD */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">
                  Account Security
                </h3>
                <button
                  onClick={() => setShowAccountSettings(!showAccountSettings)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
                >
                  {showAccountSettings ? "Cancel" : "Change"}
                </button>
              </div>

              {showAccountSettings && (
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <Mail size={16} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">
                        {email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={updatePassword}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Update Password
                  </button>
                </div>
              )}
            </div>

            {/* STATS CARDS - FLEX COLUMN LAYOUT */}
            <div className="flex flex-col gap-4 w-full">
              {/* Profile Completion Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Profile Completion
                    </p>
                    <h4 className="text-3xl font-bold text-slate-900">
                      {completionPct}%
                    </h4>
                  </div>
                  <Zap size={24} className="text-yellow-500" />
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${completionPct}%` }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all duration-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {filledCount} of {completionFields.length} fields filled
                </p>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Account Status
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <h4 className="text-2xl font-bold text-green-600">ACTIVE</h4>
                </div>
                <p className="text-xs text-slate-500 mt-2">Ready to accept patients</p>
              </div>

              {/* Last Session Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Last Session
                    </p>
                    <h4 className="text-sm font-bold text-slate-900">
                      {lastLogin}
                    </h4>
                  </div>
                  <Clock size={20} className="text-blue-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-500">Session information</p>
              </div>
            </div>

            {/* Footer Padding */}
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW (Medium screens and up) */}
      <div className="hidden md:block w-full max-w-6xl mx-auto space-y-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col p-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Professional Profile
          </h1>
          <p className="text-gray-500 font-medium">
            Manage your professional identity and credentials.
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0BC5EA] to-[#2B6CB0] p-10 text-white shadow-xl">

          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-[30px] bg-white p-1 shadow-2xl">
                <div className="w-full h-full rounded-[26px] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(profile.avatar_url, '_blank')}
                      title="Click to view full image"
                    />
                  ) : (
                    <span className="text-4xl font-black text-gray-400">
                      {initial}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={uploadAvatar}
                  disabled={uploadingImage}
                />
                <label 
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors shadow-lg"
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

            {/* Profile Info */}
            <div className="flex-1">

              <div className="flex items-center gap-4 mb-3">

                {isEditing ? (
                  <input
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, full_name: e.target.value }))
                    }
                    className="bg-white/20 px-4 py-2 rounded-xl text-white placeholder-white/60"
                  />
                ) : (
                  <h2 className="text-3xl font-black">
                    {profile.full_name || "Doctor"}
                  </h2>
                )}

                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                  <CheckCircle size={14} />
                  Verified
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-white/90">

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Shield size={16} />
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/70 uppercase">License Number</label>
                      <input
                        placeholder="License Number"
                        value={editForm.doctor_license}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            doctor_license: e.target.value,
                          }))
                        }
                        className="bg-white/20 px-3 py-1 rounded-lg w-40"
                      />
                    </div>
                  ) : (
                    `License: ${profile.doctor_license || "Not set"}`
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Heart size={16} />
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/70 uppercase">Phone Number</label>
                      <input
                        placeholder="Phone Number"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        className="bg-white/20 px-3 py-1 rounded-lg w-40"
                      />
                    </div>
                  ) : (
                    `Phone: ${profile.phone || "Not set"}`
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Shield size={16} />
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/70 uppercase">Speciality</label>
                      <input
                        value={editForm.speciality}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            speciality: e.target.value,
                          }))
                        }
                        className="bg-white/20 px-3 py-1 rounded-lg w-40"
                      />
                    </div>
                  ) : (
                    `Speciality: ${profile.speciality || "Not set"}`
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Award size={16} />
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/70 uppercase">Institution</label>
                      <input
                        value={editForm.institution}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            institution: e.target.value,
                          }))
                        }
                        className="bg-white/20 px-3 py-1 rounded-lg w-40"
                      />
                    </div>
                  ) : (
                    `Institution: ${profile.institution || "Not set"}`
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div>

              {isEditing ? (
                <>
                  <button
                    onClick={updateProfile}
                    className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold shadow"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile);
                    }}
                    className="ml-3 px-6 py-3 bg-white/20 rounded-xl"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white text-gray-900 rounded-xl flex items-center gap-2 font-semibold shadow"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}

            </div>

          </div>
        </div>

        {/* ACCOUNT SECURITY */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black">Account Security</h3>

            <button
              onClick={() => setShowAccountSettings(!showAccountSettings)}
              className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold"
            >
              {showAccountSettings ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showAccountSettings && (
            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2">
                  Email
                </label>

                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
                  <Mail size={16} />
                  <span className="font-bold">{email}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />

                <button
                  onClick={updatePassword}
                  className="mt-3 w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-bold"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INSIGHT CARDS */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <p className="text-xs text-gray-400 font-bold">
              Profile Completion
            </p>
            <h4 className="text-3xl font-black">{completionPct}%</h4>

            <div className="h-2 bg-gray-200 rounded-full mt-3">
              <div
                style={{ width: `${completionPct}%` }}
                className="h-full bg-cyan-500 rounded-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <p className="text-xs text-gray-400 font-bold">Status</p>

            <h4 className="text-xl font-black flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              LIVE
            </h4>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <p className="text-xs text-gray-400 font-bold">
              Last Session
            </p>

            <h4 className="text-lg font-black">{lastLogin}</h4>
          </div>
        </div>

      </div>
    </>
  );
};

export default DoctorProfile;
