import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import { generateAIDescription } from "../../lib/gemini";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch all events
  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) console.log(error);
    else setEvents(data);
    setLoading(false);
  }

  // Generate AI description
  const handleGenerateAI = async () => {
    try {
      if (!title || !date || !location) {
        alert("Please fill in Title, Date, and Location first!");
        return;
      }

      setIsGenerating(true);
      const aiDescription = await generateAIDescription(title, date, location);
      setDescription(aiDescription);
      
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate AI description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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
      fetchEvents();
    }
  }

  // Delete an event
  async function deleteEvent(id) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) console.log(error);
    else fetchEvents();
  }

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Manage Events</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Event
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50">
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
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || !title || !date || !location}
                className="cursor-pointer px-1.5 py-0.1 rounded border bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
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
              <th className="border px-2 py-2 text-left">Action</th>
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
                <td className="border px-2 py-2">
                  <button
                    onClick={() => deleteEvent(e.id)}
                    className="cursor-pointer bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}