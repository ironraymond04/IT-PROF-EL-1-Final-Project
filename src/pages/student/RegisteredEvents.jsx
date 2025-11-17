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

    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id, title, date")
      .in("id", eventIds);

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
    <div>
      <h1 className="text-3xl font-bold mb-4">Registered Events</h1>
      {events.length === 0 ? (
        <p>You haven't registered for any events yet.</p>
      ) : (
        <ul>
          {events.map(e => (
            <li key={e.id}>
              <strong>{e.title}</strong> - {new Date(e.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}