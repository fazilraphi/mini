import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import VideoCall from "../../components/Videocall";

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,.07)", padding: 24 };

const STATUS_STYLES = {
  upcoming: { background: "#FEFCBF", color: "#D69E2E", label: "UPCOMING" },
  "checked-in": { background: "#C6F6D5", color: "#276749", label: "CHECKED-IN" },
  completed: { background: "#E2E8F0", color: "#718096", label: "COMPLETED" },
};

const DoctorAppointments = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medicines, setMedicines] = useState([]);

  const [callRoom, setCallRoom] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const dateStr = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  useEffect(() => {


    const channel = supabase
      .channel("doctor-appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointment_bookings"
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };


  }, []);

  /* LOAD BOOKINGS */

  const loadBookings = async () => {

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    setDoctorName(profile?.full_name || "Doctor");

    const { data, error } = await supabase
      .from("appointment_bookings")
      .select(`
      id,
      doctor_id,
      booked_at,
      queue_position,
      consultation_started,
      consultation_completed,
      call_room,
      patient_id,
      appointment_id,
      appointments(
        date,
        time
      ),
      profiles:patient_id(
        full_name,
        age,
        gender
      )
    `)
      .eq("doctor_id", user.id)
      .eq("status", "booked")
      .order("queue_position", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const filtered = (data || []).filter(
      b => b.appointments?.date === dateStr
    );

    setBookings(filtered);
    setLoading(false);
  };

  /* START CONSULTATION */

  const startConsultation = async (booking) => {

    const { data: active } = await supabase
      .from("appointment_bookings")
      .select("id")
      .eq("consultation_started", true)
      .maybeSingle();

    if (active) {
      toast.error("Another consultation is already running");
      return;
    }

    await supabase
      .from("appointment_bookings")
      .update({ consultation_started: true })
      .eq("id", booking.id);

    toast.success("Consultation started");

    loadBookings();
  };

  /* END CONSULTATION */

  const endConsultation = async (booking) => {

    await supabase
      .from("appointment_bookings")
      .update({
        consultation_started: false,
        consultation_completed: true
      })
      .eq("id", booking.id);

    toast.success("Consultation completed");

    loadBookings();


  };

  /* OPEN PATIENT */

  const openPatient = async (booking) => {


    setSelected(booking);
    setTitle("");
    setDescription("");
    setMedicines([]);

    const { data } = await supabase
      .from("medical_records")
      .select(`
        id,
        title,
        description,
        created_at,
        prescriptions(medicine_name, dosage, frequency, duration)
      `)
      .eq("patient_id", booking.patient_id)
      .order("created_at", { ascending: false });

    setHistory(data || []);


  };

  const addMedicine = () => {

    setMedicines([
      ...medicines,
      { medicine_name: "", dosage: "", frequency: "", duration: "" }
    ]);


  };

  const updateMedicine = (i, f, v) => {


    const copy = [...medicines];
    copy[i][f] = v;
    setMedicines(copy);


  };

  const saveConsultation = async () => {


    const { data: { user } } = await supabase.auth.getUser();

    if (!title) return toast.error("Title required");

    const { data: record } = await supabase
      .from("medical_records")
      .insert({
        patient_id: selected.patient_id,
        doctor_id: user.id,
        appointment_booking_id: selected.id,
        title,
        description
      })
      .select()
      .single();

    if (medicines.length > 0) {

      await supabase
        .from("prescriptions")
        .insert(
          medicines.map(m => ({
            ...m,
            record_id: record.id
          }))
        );

    }

    toast.success("Consultation saved");

    openPatient(selected);


  };

  /* STATUS */

  const getStatus = (b) => {

    if (b.consultation_completed) return "completed";
    if (b.consultation_started) return "checked-in";

    return "upcoming";


  };

  if (callRoom) {

    return (
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Video Consultation</h1>
          <button onClick={() => setCallRoom(null)}>Leave Call</button>
        </div>
        <VideoCall
          roomName={callRoom}
          userName={`Dr. ${doctorName}`}
          onLeave={() => setCallRoom(null)}
        />
      </div>
    );

  }

  if (selected) {


    const p = selected.profiles;

    return (
      <div style={{ maxWidth: 900 }}>
        <button onClick={() => setSelected(null)}>← Back to Patients</button>
      </div>
    );


  }

  return (


    <div style={{ maxWidth: 900 }}>

      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        Booked Patients
      </h1>

      {loading && <p>Loading...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {bookings.map(b => {

          const status = getStatus(b);
          const style = STATUS_STYLES[status];

          const name = b.profiles?.full_name || "Patient";
          const time = b.appointments?.time?.slice(0, 5);

          return (

            <div key={b.id} style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>
                  {name}
                </p>

                <p style={{ fontSize: 13, color: "#718096" }}>
                  🕐 {time} | Queue #{b.queue_position}
                </p>
              </div>

              <span style={{
                ...style,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700
              }}>
                {style.label}
              </span>

              {!b.consultation_started && !b.consultation_completed && (
                <button onClick={() => startConsultation(b)}>
                  Start Consultation
                </button>
              )}

              {b.consultation_started && (
                <button onClick={() => endConsultation(b)}>
                  End Consultation
                </button>
              )}

              {b.consultation_started && !b.consultation_completed && (
                <button onClick={() => setCallRoom(b.call_room || `consult-${b.id}`)} style={{ marginLeft: 8, background: "#48BB78", color: "white", padding: "4px 12px", borderRadius: 4, border: "none" }}>
                  Join Video Call
                </button>
              )}

              <button onClick={() => openPatient(b)}>
                Open Patient
              </button>

            </div>

          );

        })}

      </div>

    </div>


  );

};

export default DoctorAppointments;
