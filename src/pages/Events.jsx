import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_open", true) // Only fetch open events
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data);
    }
    setLoading(false);
  }

  if (loading) return <p className="p-8">Loading upcoming events...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md"
          >
            <h3 className="text-lg font-bold">{event.title}</h3>
            <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
            <p className="text-gray-500">{event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
