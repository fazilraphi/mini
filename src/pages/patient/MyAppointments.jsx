import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const MyAppointments = ({ statusFilter = "all" }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(
        `
        id,
        status,
        booked_at,
        appointments (
          date,
          time,
          doctor_id,
          profiles:doctor_id (
            full_name,
            speciality,
            institution
          )
        )
      `,
      )
      .eq("patient_id", user.id)
      .order("booked_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    let filtered = data || [];

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setAppointments(filtered);
    setLoading(false);
  };

  const cancelBooking = async (bookingId) => {
    try {
      setCancelId(bookingId);

      const { error } = await supabase
        .from("appointment_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Appointment cancelled");

        // Update UI immediately without full refetch
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === bookingId ? { ...item, status: "cancelled" } : item,
          ),
        );
      }
    } finally {
      setCancelId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "booked":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-sm text-gray-500">View and manage your bookings</p>
      </div>

      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow animate-pulse h-40"
            />
          ))}
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <p className="text-lg font-medium text-gray-700">
            No appointments found
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Try changing the filter or book a consultation.
          </p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {appointments.map((item) => {
            const slot = item.appointments;
            const doctor = slot?.profiles;

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">
                      Dr. {doctor?.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doctor?.speciality}
                    </p>
                    <p className="text-xs text-gray-400">
                      {doctor?.institution}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  <p>Date: {slot?.date}</p>
                  <p>Time: {slot?.time}</p>
                </div>

                {item.status === "booked" && (
                  <button
                    onClick={() => cancelBooking(item.id)}
                    disabled={cancelId === item.id}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    {cancelId === item.id ? "Cancelling..." : "Cancel Booking"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
