import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const DEFAULT_CAPACITY = 10;

const Appointments = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  const fetchSlots = async (date) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: slotsData, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        date,
        time,
        doctor_id,
        max_patients,
        profiles:doctor_id (
          full_name,
          institution,
          speciality
        ),
        appointment_bookings (id)
      `
      )
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: myBookings } = await supabase
      .from("appointment_bookings")
      .select("appointment_id")
      .eq("patient_id", user.id);

    const bookedSet = new Set(
      (myBookings || []).map((b) => b.appointment_id)
    );

    const processed = (slotsData || []).map((slot) => {
      const bookedCount = slot.appointment_bookings
        ? slot.appointment_bookings.length
        : 0;

      return {
        ...slot,
        bookedCount,
      };
    });

    const available = processed.filter(
      (slot) => !bookedSet.has(slot.id)
    );

    setSlots(available);
    setLoading(false);
  };

  const bookSlot = async (slot) => {
    try {
      setBookingId(slot.id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("appointment_bookings")
        .insert({
          appointment_id: slot.id,
          patient_id: user.id,
          doctor_id: slot.doctor_id,
        });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Appointment booked successfully");
        fetchSlots(selectedDate);
      }
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Available Appointments
        </h1>
        <p className="text-sm text-gray-500">
          Select a date and book your consultation
        </p>
      </div>

      {/* DATE SELECTOR */}
      <div className="bg-white p-6 rounded-2xl shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <label className="text-sm text-gray-500 block mb-1">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
        </div>

        <div className="text-sm text-gray-500">
          Showing slots for:{" "}
          <span className="font-medium text-gray-800">
            {selectedDate}
          </span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow animate-pulse h-40"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && slots.length === 0 && (
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <p className="text-lg font-medium text-gray-700">
            No appointments available
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Try selecting another date.
          </p>
        </div>
      )}

      {/* SLOT LIST */}
      {!loading && slots.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {slots.map((slot) => {
            const capacity = slot.max_patients || DEFAULT_CAPACITY;
            const full = slot.bookedCount >= capacity;

            return (
              <div
                key={slot.id}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex justify-between"
              >
                <div>
                  <p className="text-lg font-semibold">
                    Dr. {slot.profiles?.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {slot.profiles?.speciality}
                  </p>
                  <p className="text-xs text-gray-400">
                    {slot.profiles?.institution}
                  </p>

                  <div className="mt-3 text-sm text-gray-700">
                    <p>Date: {slot.date}</p>
                    <p>Time: {slot.time}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {slot.bookedCount}/{capacity} booked
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => bookSlot(slot)}
                  disabled={full || bookingId === slot.id}
                  className={`px-5 py-2 rounded-lg h-fit transition ${
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