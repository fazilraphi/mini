import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import toast from "react-hot-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const AdminDoctorAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [specialtyData, setSpecialtyData] = useState([]);
    const [capacityData, setCapacityData] = useState([]);
    const [timelineData, setTimelineData] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);

            // Fetch active doctors
            const { data: doctors, error: dError } = await supabase
                .from("profiles")
                .select("id, full_name, speciality")
                .eq("role", "doctor")
                .in("status", ["active", "approved"]);

            if (dError) {
                toast.error("Error fetching doctors");
                setLoading(false);
                return;
            }

            // Fetch appointments
            const { data: appointments, error: aError } = await supabase
                .from("appointments")
                .select("id, doctor_id, date, max_patients");

            // Fetch bookings
            const { data: bookings, error: bError } = await supabase
                .from("appointment_bookings")
                .select("id, appointment_id, doctor_id");

            if (aError || bError) {
                toast.error(aError?.message || bError?.message || "Error fetching appointment data");
                setLoading(false);
                return;
            }

            // 1. Process Specialty Data for Pie Chart
            const specialtyCount = {};
            (doctors || []).forEach(doc => {
                let spec = doc.speciality || "General";
                // Basic normalization (Capitalize first letter to group better)
                spec = spec.charAt(0).toUpperCase() + spec.slice(1).toLowerCase();
                specialtyCount[spec] = (specialtyCount[spec] || 0) + 1;
            });
            const sData = Object.keys(specialtyCount).map(key => ({
                name: key,
                value: specialtyCount[key]
            }));
            setSpecialtyData(sData);

            // 2. Process Capacity vs Bookings for Bar Chart
            const docStats = {};
            (doctors || []).forEach(doc => {
                docStats[doc.id] = { name: doc.full_name, capacity: 0, booked: 0 };
            });

            (appointments || []).forEach(app => {
                if (docStats[app.doctor_id]) {
                    docStats[app.doctor_id].capacity += (app.max_patients || 10);
                }
            });

            (bookings || []).forEach(b => {
                if (docStats[b.doctor_id]) {
                    docStats[b.doctor_id].booked += 1;
                }
            });

            // Keep top 10 doctors by booking volume for better visualization
            const cData = Object.values(docStats)
                .sort((a, b) => b.booked - a.booked)
                .slice(0, 10);
            setCapacityData(cData);

            // 3. Process Timeline Data for Line Chart
            const dateCount = {};
            (appointments || []).forEach(app => {
                // Count capacity created per day
                if (!dateCount[app.date]) dateCount[app.date] = { date: app.date, availableSlots: 0, appointmentsBooked: 0 };
                dateCount[app.date].availableSlots += (app.max_patients || 10);
            });

            // Note: `bookings` doesn't reliably have the appointment date easily without joining, so we approximate
            // by using created_at for booking activity. Or mapping booking -> appointment.date.
            // Let's map booking -> appointment.date for accuracy
            const appMap = {};
            (appointments || []).forEach(a => appMap[a.id] = a.date);

            (bookings || []).forEach(b => {
                const bDate = appMap[b.appointment_id];
                if (bDate) {
                    if (!dateCount[bDate]) dateCount[bDate] = { date: bDate, availableSlots: 0, appointmentsBooked: 0 };
                    dateCount[bDate].appointmentsBooked += 1;
                }
            });

            const tData = Object.values(dateCount).sort((a, b) => new Date(a.date) - new Date(b.date));
            setTimelineData(tData);

            setLoading(false);
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <p className="text-gray-500 p-8">Loading analytics...</p>;
    }

    return (
        <div className="space-y-8 p-4">
            <h2 className="text-3xl font-bold text-gray-800">Doctor Analytics</h2>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* SPECIALTY PIE CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Doctors by Specialty</h3>
                    <div className="h-80">
                        {specialtyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={specialtyData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {specialtyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* CAPACITY VS BOOKINGS BAR CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Appointments Capacity vs Booked</h3>
                    <div className="h-80">
                        {capacityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={capacityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar dataKey="capacity" name="Available Slots" fill="#00C49F" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="booked" name="Booked Slots" fill="#0088FE" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* TIMELINE TREND CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Appointment Trends over Time</h3>
                    <div className="h-80">
                        {timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="availableSlots" name="Available Capacity" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="appointmentsBooked" name="Booked Appointments" stroke="#FF8042" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDoctorAnalytics;
