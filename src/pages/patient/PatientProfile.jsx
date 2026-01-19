import { useEffect, useState } from "react";
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

const PatientProfile = () => {
  const [form, setForm] = useState(initialForm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) toast.error(error.message);
    else if (data) setForm({ ...initialForm, ...data });

    setLoading(false);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.full_name?.trim()) return "Full name is required";
    if (!form.age || Number(form.age) <= 0) return "Valid age required";
    if (!form.gender) return "Gender is required";
    if (!form.phone?.trim()) return "Phone is required";
    if (!form.address?.trim()) return "Address is required";
    if (!form.blood_group?.trim()) return "Blood group is required";
    if (!form.emergency_contact?.trim()) return "Emergency contact is required";
    return null;
  };

const saveProfile = async () => {
  const validationError = validateForm();
  if (validationError) return toast.error(validationError);

  setSaving(true);

  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    ...form,
    age: Number(form.age),
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Profile updated successfully");
    setIsEditing(false);

    // ✅ ADD THIS: redirect after successful completion
    setTimeout(() => {
      window.location.href = "/patient-dashboard";
    }, 800);
  }

  setSaving(false);
};


  const changePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully");
      setPassword("");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-8 rounded-2xl shadow animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Patient Profile
      </h1>

      {/* BIODATA */}
      <div className="bg-white p-8 rounded-2xl shadow space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">Biodata</h2>
          <p className="text-sm text-gray-500">
            Manage your personal and medical information
          </p>
        </div>

        {!isEditing ? (
          <div className="grid sm:grid-cols-2 gap-6 text-gray-700">
            <Field label="Full Name" value={form.full_name} />
            <Field label="Age" value={form.age} />
            <Field label="Gender" value={form.gender} />
            <Field label="Phone" value={form.phone} />
            <Field label="Blood Group" value={form.blood_group} />
            <Field label="Emergency Contact" value={form.emergency_contact} />
            <Field label="Address" value={form.address} />
            <Field label="Medical History" value={form.medical_history} />

            <div className="sm:col-span-2 flex justify-center pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg transition"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: "full_name", placeholder: "Full Name" },
              { name: "age", type: "number", placeholder: "Age" },
              { name: "phone", placeholder: "Phone Number" },
              { name: "blood_group", placeholder: "Blood Group" },
              { name: "emergency_contact", placeholder: "Emergency Contact" },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                type={field.type || "text"}
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
              />
            ))}

            <select
              name="gender"
              value={form.gender || ""}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <textarea
              name="address"
              placeholder="Address"
              value={form.address || ""}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full sm:col-span-2"
            />

            <textarea
              name="medical_history"
              placeholder="Medical History"
              value={form.medical_history || ""}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full sm:col-span-2"
            />

            <div className="sm:col-span-2 flex gap-3 justify-center pt-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ACCOUNT SETTINGS */}
      <div className="bg-white p-8 rounded-2xl shadow space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Account Settings
        </h2>

        <div className="space-y-2">
          <label className="text-sm text-gray-500">Email (read-only)</label>
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm">
            {email}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="Enter new password"
          />
          <button
            onClick={changePassword}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "Not provided"}</p>
  </div>
);

export default PatientProfile;
