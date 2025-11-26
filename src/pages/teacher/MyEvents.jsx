import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  async function fetchMyEvents() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) console.log(error);
    else setEvents(data);
    setLoading(false);
  }

  // Add a new event
  async function addEvent(e) {
    e.preventDefault();
    if (!title || !date || !location) {
      alert("Title, Date, and Location are required!");
      return;
    }

    const { error } = await supabase.from("events").insert([
      {
        title,
        description,
        date,
        location,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Failed to add event.");
    } else {
      // Clear form and close modal
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setModalOpen(false);
      fetchMyEvents();
    }
  }

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">My Events</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Event
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Event</h2>
            <form onSubmit={addEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border px-2 py-1 w-full rounded"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border px-2 py-1 w-full rounded"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border px-2 py-1 w-full rounded"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border px-2 py-1 w-full rounded"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Table */}
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
    </div>
  );
}