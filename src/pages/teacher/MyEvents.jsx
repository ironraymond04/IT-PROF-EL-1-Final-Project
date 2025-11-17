import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  async function fetchMyEvents() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", userData.user.id)
      .order("date", { ascending: true });
    if (error) console.log(error);
    else setEvents(data);
    setLoading(false);
  }

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">My Events</h1>
      <ul>
        {events.map(e => (
          <li key={e.id}>
            <strong>{e.title}</strong> - {new Date(e.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
