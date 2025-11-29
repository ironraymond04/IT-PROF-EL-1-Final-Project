import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function RegisteredEvents({ refresh }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistered();
  }, [refresh]);

  async function fetchRegistered() {
    setLoading(true);

    // Get the current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      setLoading(false);
      return;
    }

    // Get the registered event IDs
    const { data: registrations, error: regError } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("student_id", user.id);

    if (regError) {
      console.error(regError);
      setLoading(false);
      return;
    }

    const eventIds = registrations.map(r => r.event_id);

    if (eventIds.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Fetch event details (including description and location)
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id, title, description, date, location")
      .in("id", eventIds)
      .order("date", { ascending: true });

    if (eventError) {
      console.error(eventError);
      setLoading(false);
      return;
    }

    setEvents(eventData);
    setLoading(false);
  }

  if (loading) return <p>Loading registered events...</p>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Registered Events</h1>
      
      {events.length === 0 ? (
        <p className="text-gray-600">You haven't registered for any events yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-2 text-left">Title</th>
                <th className="border px-2 py-2 text-left">Description</th>
                <th className="border px-2 py-2 text-left">Date</th>
                <th className="border px-2 py-2 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="border px-2 py-2">{e.title}</td>
                  <td className="border px-2 py-2">{e.description}</td>
                  <td className="border px-2 py-2">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-2">{e.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}