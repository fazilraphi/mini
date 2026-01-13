import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const Appointments = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetchSlots();
  }, []);

const fetchSlots = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      date,
      time,
      doctor_id,
      appointment_bookings (
        patient_id
      )
    `);

  if (error) {
    console.error(error);
    return;
  }

  // Filter out slots already booked by this patient
  const available = (data || []).filter(slot => {
    return !slot.appointment_bookings?.some(
      b => b.patient_id === user.id
    );
  });

  setSlots(available);
};

  const bookSlot = async (slot) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User not logged in");
        return;
      }

      const { error } = await supabase.from("appointment_bookings").insert({
        appointment_id: slot.id,
        patient_id: user.id,
        doctor_id: slot.doctor_id,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Appointment booked successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available Appointments</h1>

      {slots.length === 0 && (
        <p className="text-gray-500">No slots available.</p>
      )}

      {slots.map((slot) => (
        <div
          key={slot.id}
          className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
        >
          <div>
            <p className="font-medium">Date: {slot.date}</p>
            <p className="text-sm text-gray-600">Time: {slot.time}</p>
          </div>

          <button
            onClick={() => bookSlot(slot)}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Book
          </button>
        </div>
      ))}
    </div>
  );
};

export default Appointments;
