import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const DEFAULT_CAPACITY = 10;

const Appointments = () => {
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  useEffect(() => {
    fetchSlots();
  }, []);

 const fetchSlots = async () => {
  setLoading(true);

  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch all upcoming slots
  const { data: slotsData, error: slotsError } = await supabase
    .from("appointments")
    .select(`
      id,
      date,
      time,
      doctor_id,
      max_patients,
      profiles:doctor_id (
        full_name,
        institution,
        speciality
      )
    `)
    .gte("date", today)
    .order("date", { ascending: true });

  if (slotsError) {
    toast.error(slotsError.message);
    setLoading(false);
    return;
  }

  // 2. Fetch booking counts separately
  const { data: bookingCounts } = await supabase
    .from("appointment_bookings")
    .select("appointment_id");

  const countMap = {};
  (bookingCounts || []).forEach(b => {
    countMap[b.appointment_id] = (countMap[b.appointment_id] || 0) + 1;
  });

  // 3. Merge counts into slots
  const merged = (slotsData || []).map(slot => ({
    ...slot,
    bookedCount: countMap[slot.id] || 0
  }));

  // 4. Remove slots already booked by this user
  const { data: myBookings } = await supabase
    .from("appointment_bookings")
    .select("appointment_id")
    .eq("patient_id", user.id);

  const bookedSet = new Set((myBookings || []).map(b => b.appointment_id));

  const available = merged.filter(s => !bookedSet.has(s.id));

  available.sort((a, b) => a.time.localeCompare(b.time));

  setSlots(available);
  setFilteredSlots(available);
  setLoading(false);
};


const applyFilter = () => {
  if (!selectedDate) {
    toast.error("Please select a date");
    return;
  }

  // Convert dd-mm-yyyy → yyyy-mm-dd
  const parts = selectedDate.split("-");
  const normalized =
    parts[0].length === 4
      ? selectedDate
      : `${parts[2]}-${parts[1]}-${parts[0]}`;

  const filtered = slots.filter(s => s.date === normalized);

  setAppliedDate(selectedDate);
  setFilteredSlots(filtered);
};


  const clearFilter = () => {
    setSelectedDate("");
    setAppliedDate("");
    setFilteredSlots(slots);
  };

  const bookSlot = async (slot) => {
    try {
      setBookingId(slot.id);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("appointment_bookings").insert({
        appointment_id: slot.id,
        patient_id: user.id,
        doctor_id: slot.doctor_id,
      });

      if (error) toast.error(error.message);
      else {
        toast.success("Appointment booked successfully");
        fetchSlots();
      }
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Available Appointments
        </h1>
        <p className="text-sm text-gray-500">
          Choose a date and book your preferred doctor
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-white p-5 rounded-2xl shadow flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="text-sm text-gray-500">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
          />
        </div>

        <button
          onClick={applyFilter}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Show Slots
        </button>

        {appliedDate && (
          <button
            onClick={clearFilter}
            className="text-sm text-gray-500 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* SKELETON */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-24 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredSlots.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow text-center text-gray-600">
          No slots found for this date.
        </div>
      )}

      {/* LIST */}
      {!loading && filteredSlots.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSlots.map((slot) => {
           const booked = slot.bookedCount || 0;

            const capacity = slot.max_patients || DEFAULT_CAPACITY;
            const full = booked >= capacity;

            return (
              <div
                key={slot.id}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col sm:flex-row justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-semibold">
                    Dr. {slot.profiles?.full_name || "Unknown"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {slot.profiles?.speciality || "General Physician"}
                  </p>

                  <p className="text-xs text-gray-400">
                    {slot.profiles?.institution || "Independent Practice"}
                  </p>

                  <div className="pt-2 text-sm text-gray-600">
                    <p>Date: {slot.date}</p>
                    <p>Time: {slot.time}</p>
                    <p className="text-xs mt-1">
                      Slots: {booked}/{capacity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => bookSlot(slot)}
                  disabled={full || bookingId === slot.id}
                  className={`px-5 py-2 rounded-lg transition ${
                    full
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {full
                    ? "Fully Booked"
                    : bookingId === slot.id
                    ? "Booking..."
                    : "Book"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Appointments;
