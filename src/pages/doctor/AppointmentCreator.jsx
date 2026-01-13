import { useState } from "react";
import { supabase } from "../../supabaseClient";

const AppointmentCreator = () => {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmPm] = useState("AM");
  const [maxPatients, setMaxPatients] = useState(1);
  const [loading, setLoading] = useState(false);

  const createSlot = async () => {
    if (!date) return alert("Please select a date");

    setLoading(true);

    // Convert 12-hour to 24-hour for DB
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    const formattedTime = `${String(h).padStart(2, "0")}:${minute}:00`;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("appointments").insert({
      doctor_id: user.id,
      date,
      time: formattedTime,
      max_patients: maxPatients,
    });

    if (error) alert(error.message);
    else alert("Appointment slot created");

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-xl space-y-5">
      <h2 className="text-lg font-semibold">Create Appointment Slot</h2>

      {/* Date */}
      <div>
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          className="border p-2 w-full rounded mt-1"
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Time */}
      <div>
        <label className="text-sm font-medium">Time</label>
        <div className="flex gap-2 mt-1">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="border p-2 rounded w-20"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const v = String(i + 1).padStart(2, "0");
              return (
                <option key={v} value={v}>
                  {v}
                </option>
              );
            })}
          </select>

          <span className="self-center">:</span>

          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="border p-2 rounded w-20"
          >
            {["00", "15", "30", "45"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            onClick={() => setAmPm(ampm === "AM" ? "PM" : "AM")}
            className="border px-4 rounded font-medium hover:bg-gray-100"
          >
            {ampm}
          </button>
        </div>
      </div>

      {/* Max Patients */}
      <div>
        <label className="text-sm font-medium">Max Patients</label>
        <input
          type="number"
          min={1}
          value={maxPatients}
          onChange={(e) => setMaxPatients(Math.max(1, Number(e.target.value)))}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* Button */}
      <button
        disabled={loading}
        onClick={createSlot}
        className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Add Slot"}
      </button>
    </div>
  );
};

export default AppointmentCreator;
