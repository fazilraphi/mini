import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const AppointmentCreator = () => {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmPm] = useState("AM");
  const [maxPatients, setMaxPatients] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);

  const loadSlots = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", user.id)
      .gte("date", today) // only future & today
      .order("date", { ascending: true });

    if (!error) setSlots(data || []);
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const createSlot = async () => {
    if (!date) return toast.error("Please select a date");

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return toast.error("Cannot create slots in the past");
    }

    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    const formattedTime = `${String(h).padStart(2, "0")}:${minute}:00`;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("date", date)
      .eq("time", formattedTime)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      return toast.error("Slot already exists");
    }

    const { error } = await supabase.from("appointments").insert({
      doctor_id: user.id,
      date,
      time: formattedTime,
      max_patients: maxPatients,
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Slot created");
      loadSlots();
    }

    setLoading(false);
  };

  const deleteSlot = async (id) => {
    if (!confirm("Delete this slot?")) return;

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);

    if (error) toast.error(error.message);
    else {
      toast.success("Slot deleted");
      loadSlots();
    }
  };

  return (
    <div className="max-w-4xl space-y-10">

      {/* CREATE SLOT */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Create Slot</h2>
          <p className="text-sm text-gray-500">Add your available consultation time.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Max Patients</label>
            <input
              type="number"
              min={1}
              value={maxPatients}
              onChange={(e) => setMaxPatients(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Time</label>
          <div className="flex gap-3 mt-1">
            <select value={hour} onChange={(e) => setHour(e.target.value)} className="border rounded-xl px-3 py-2">
              {Array.from({ length: 12 }, (_, i) => {
                const v = String(i + 1).padStart(2, "0");
                return <option key={v}>{v}</option>;
              })}
            </select>

            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="border rounded-xl px-3 py-2">
              {["00", "15", "30", "45"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <button
              onClick={() => setAmPm(ampm === "AM" ? "PM" : "AM")}
              className="border rounded-xl px-4 font-medium hover:bg-gray-50"
            >
              {ampm}
            </button>
          </div>
        </div>

        <button
          onClick={createSlot}
          disabled={loading}
          className="bg-orange-500 text-white py-2.5 px-6 rounded-xl hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Add Slot"}
        </button>
      </div>

      {/* UPCOMING SLOTS */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Upcoming Slots</h3>
          <p className="text-sm text-gray-500">Manage your available appointments.</p>
        </div>

        {slots.length === 0 && (
          <p className="text-sm text-gray-500">No upcoming slots.</p>
        )}

        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{slot.date}</p>
                <p className="text-sm text-gray-500">
                  {slot.time} · Max {slot.max_patients} patients
                </p>
              </div>

              <button
                onClick={() => deleteSlot(slot.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCreator;
