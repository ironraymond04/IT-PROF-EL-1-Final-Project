export const events = [
  { id: 1, name: "Math Olympiad", date: "Nov 18, 2025", location: "Auditorium" },
  { id: 2, name: "Science Fair", date: "Nov 20, 2025", location: "Gymnasium" },
];

export default function Events() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md"
          >
            <h3 className="text-lg font-bold">{event.name}</h3>
            <p className="text-gray-600">{event.date}</p>
            <p className="text-gray-500">{event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}