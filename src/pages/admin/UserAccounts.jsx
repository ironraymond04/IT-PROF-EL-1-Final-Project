import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";

export default function UserAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) console.log(error);
    else setUsers(data);
    setLoading(false);
  }

  async function deleteUser(id) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) console.log(error);
    else fetchUsers();
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">User Accounts</h1>
      <table className="table-auto border-collapse border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.role}</td>
              <td className="border px-2 py-1">
                <button onClick={() => deleteUser(u.id)} className="cursor-pointer bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}