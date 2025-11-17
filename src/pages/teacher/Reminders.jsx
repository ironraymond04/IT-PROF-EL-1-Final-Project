import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("teacher_id", userData.user.id)
      .order("date", { ascending: true });
    if (error) console.log(error);
    else setReminders(data);
    setLoading(false);
  }

  if (loading) return <p>Loading reminders...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Reminders</h1>
      <ul>
        {reminders.map(r => (
          <li key={r.id}>
            <strong>{r.title}</strong> - {new Date(r.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}