import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        event_registrations (
          id,
          student_id
        )
      `)
      .order("date", { ascending: true });

    if (error) console.log(error);
    else setEvents(data);

    setLoading(false);
  }

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Analytics</h1>

      <table className="table-auto border-collapse border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Event</th>
            <th className="border px-2 py-1">Participants</th>
          </tr>
        </thead>

        <tbody>
          {events.map(e => (
            <tr key={e.id}>
              <td className="border px-2 py-1">{e.title}</td>
              <td className="border px-2 py-1">
                {e.event_registrations?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}