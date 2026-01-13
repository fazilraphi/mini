import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const PatientProfile = () => {
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    blood_group: "",
    emergency_contact: "",
    medical_history: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setEmail(user.email);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) setForm(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Biodata saved successfully");
      setIsEditing(false);
    }
  };

  const changeEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) toast.error(error.message);
    else toast.success("Verification email sent to new address");
  };

  const changePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else toast.success("Password updated successfully");
  };

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-center">Patient Profile</h1>

      {/* BIODATA CARD */}
      <div className="bg-white p-8 rounded-2xl shadow space-y-6">
        <h2 className="text-lg font-medium text-center text-gray-800">
          Biodata
        </h2>

        {!isEditing ? (
          // ===== VIEW MODE =====
          <div className="space-y-5 text-gray-700">
            <Field label="Full Name" value={form.full_name} />
            <Field label="Age" value={form.age} />
            <Field label="Gender" value={form.gender} />
            <Field label="Phone" value={form.phone} />
            <Field label="Blood Group" value={form.blood_group} />
            <Field label="Emergency Contact" value={form.emergency_contact} />
            <Field label="Address" value={form.address} />
            <Field label="Medical History" value={form.medical_history} />

            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          // ===== EDIT MODE =====
          <div className="space-y-4">
            <input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <input
              name="age"
              type="number"
              placeholder="Age"
              value={form.age || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <select
              name="gender"
              value={form.gender || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <input
              name="blood_group"
              placeholder="Blood Group (e.g. O+)"
              value={form.blood_group || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <input
              name="emergency_contact"
              placeholder="Emergency Contact"
              value={form.emergency_contact || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <textarea
              name="address"
              placeholder="Address"
              value={form.address || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <textarea
              name="medical_history"
              placeholder="Medical History (optional)"
              value={form.medical_history || ""}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                className="bg-orange-500 text-white px-5 py-2 rounded"
              >
                Save Biodata
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-5 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ACCOUNT SETTINGS (UNCHANGED) */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold">Account Settings</h2>

        <input
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={changeEmail}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Change Email
        </button>

        <input
          className="border p-2 w-full rounded"
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={changePassword}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base">{value || "Not provided"}</p>
  </div>
);

export default PatientProfile;
