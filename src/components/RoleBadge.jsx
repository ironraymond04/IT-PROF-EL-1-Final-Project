export default function RoleBadge({ role }) {
  const roleStyles = {
    admin: "bg-red-100 text-red-700 border-red-300",
    student: "bg-green-100 text-green-700 border-green-300",
    staff: "bg-blue-100 text-blue-700 border-blue-300",
    guest: "bg-gray-100 text-gray-700 border-gray-300",
  };

  const label =
    role?.charAt(0).toUpperCase() + role?.slice(1) || "Unknown Role";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
        roleStyles[role] || "bg-gray-200 text-gray-700 border-gray-300"
      }`}
    >
      {label}
    </span>
  );
}
