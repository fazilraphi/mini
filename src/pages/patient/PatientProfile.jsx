import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const initialForm = {
  full_name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  blood_group: "",
  emergency_contact: "",
  medical_history: "",
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
      // If defaultEditing was requested (e.g. from /complete-profile), open edit mode
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

      // If we came from /complete-profile, navigate to the dashboard
      if (defaultEditing) {
        setTimeout(() => navigate("/patient-dashboard", { replace: true }), 800);
      }
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
      <div className="p-10 text-center text-gray-500">
        Loading profile...
      </div>
    );

  return (
    <div className="space-y-10">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl p-8 shadow flex flex-col md:flex-row gap-8">

        {/* avatar */}
        <div className="relative self-start">
          <div className="w-28 h-28 rounded-xl bg-orange-200 flex items-center justify-center text-4xl">
            👤
          </div>

          {!isEditing && (
            <button
              onClick={openEdit}
              className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-lg"
              title="Edit profile"
            >
              ✎
            </button>
          )}
        </div>

        {/* info / form */}
        <div className="flex-1">

          {isEditing ? (
            /* ─── EDIT FORM ─── */
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {defaultEditing ? "Complete Your Profile" : "Edit Profile"}
                </h2>
                {!defaultEditing && (
                  <button
                    onClick={cancelEdit}
                    className="text-gray-500 hover:text-gray-700 text-sm border border-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">

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
                  <label className="block text-xs text-gray-500 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Blood Group *</label>
                  <select
                    name="blood_group"
                    value={editForm.blood_group}
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
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

                <div className="md:col-span-2">
                  <Field
                    label="Address / Location *"
                    name="address"
                    value={editForm.address}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Medical History (comma-separated)</label>
                  <textarea
                    name="medical_history"
                    value={editForm.medical_history}
                    onChange={handleChange}
                    placeholder="Diabetes, Hypertension"
                    rows={2}
                    className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  />
                </div>

              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-cyan-600 text-white px-8 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                {!defaultEditing && (
                  <button
                    onClick={cancelEdit}
                    className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            /* ─── READ-ONLY VIEW ─── */
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">
                    {form.full_name || "Patient"}
                  </h2>
                  <p className="text-cyan-600 text-sm flex items-center gap-2 mt-1">
                    ✔ Verified Patient
                  </p>
                </div>

                <button
                  onClick={openEdit}
                  className="bg-cyan-600 text-white px-5 py-2 rounded-lg"
                >
                  Edit Profile
                </button>
              </div>

              {/* DETAILS */}
              <div className="grid md:grid-cols-3 gap-6 mt-6 text-sm">
                <Info label="AGE" value={`${form.age || "-"} Years`} />
                <Info label="GENDER" value={form.gender} />
                <Info label="BLOOD GROUP" value={form.blood_group} />
                <Info label="PHONE" value={form.phone} />
                <Info label="EMERGENCY CONTACT" value={form.emergency_contact} />
                <Info label="LOCATION" value={form.address} />
              </div>

              {/* MEDICAL HISTORY */}
              <div className="mt-6">
                <p className="font-semibold text-gray-700 mb-2">Medical History</p>
                <div className="flex flex-wrap gap-2">
                  {(form.medical_history || "None")
                    .split(",")
                    .map((item, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 px-3 py-1 rounded-lg text-sm"
                      >
                        {item.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ACCOUNT SETTINGS — only shown in view mode */}
      {!isEditing && (
        <>
          <div className="bg-white rounded-2xl p-8 shadow grid md:grid-cols-2 gap-10">

            {/* EMAIL */}
            <div>
              <h3 className="font-semibold mb-4">Account Settings</h3>
              <label className="text-sm text-gray-500">Registered Email Address</label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg mt-2">{email}</div>
              <p className="text-xs text-gray-400 mt-2">
                Contact admin to change your primary email.
              </p>
            </div>

            {/* PASSWORD */}
            <div className="space-y-4">
              <label className="text-sm text-gray-500">Update Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full"
              />
              <button
                onClick={changePassword}
                className="bg-black text-white w-full py-2 rounded-lg"
              >
                Update Password
              </button>
            </div>

          </div>

          {/* BOTTOM CARDS */}
          <div className="grid md:grid-cols-3 gap-6">
            <SmallCard title="Notifications" subtitle="Manage alerts & emails" />
            <SmallCard title="Privacy" subtitle="Data sharing settings" />
            <SmallCard title="Sessions" subtitle="Manage logged in devices" />
          </div>
        </>
      )}

    </div>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

const SmallCard = ({ title, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow">
    <p className="font-semibold">{title}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default PatientProfile;