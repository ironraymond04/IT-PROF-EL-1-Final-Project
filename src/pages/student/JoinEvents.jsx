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
    const { data: allEvents } = await supabase.from("events").select("*");
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
    <div>
      <h1 className="text-3xl font-bold mb-4">Join Events</h1>
      <ul>
        {events.map(e => (
          <li key={e.id} className="mb-2">
            <strong>{e.title}</strong> - {new Date(e.date).toLocaleDateString()}
            <button
              onClick={() => joinEvent(e.id)}
              className="cursor-pointer ml-3 bg-blue-600 text-white px-2 py-1 rounded"
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}