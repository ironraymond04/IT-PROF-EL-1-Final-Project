import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function JoinEvents({ onJoin }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data: allEvents } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("student_id", userData.user.id);

    const registeredIds = regs?.map(r => r.event_id) || [];
    const available = allEvents.filter(e => !registeredIds.includes(e.id));

    setEvents(available);
    setLoading(false);
  }

  async function joinEvent(eventId) {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("event_registrations").insert([
      { student_id: userData.user.id, event_id: eventId },
    ]);

    if (error) console.log(error);
    else {
      fetchEvents();       // Refresh available events
      onJoin?.();          // Notify parent to refresh RegisteredEvents
    }
  }

  if (loading) return <p>Loading available events...</p>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Join Events</h1>
      
      {events.length === 0 ? (
        <p className="text-gray-600">No available events to join at the moment.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-2 text-left">Title</th>
                <th className="border px-2 py-2 text-left">Date</th>
                <th className="border px-2 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="border px-2 py-2">{e.title}</td>
                  <td className="border px-2 py-2">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-2">
                    <button
                      onClick={() => joinEvent(e.id)}
                      className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Join
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}