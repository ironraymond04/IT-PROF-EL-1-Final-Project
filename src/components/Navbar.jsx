import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Logout handler
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav className="bg-red-900 shadow-sm px-6 py-3 flex justify-between items-center">
      {/* App Title */}
      <h1 className="text-xl font-bold text-white">
        St. Peter's College - School Event System
      </h1>

      {/* Navigation Links */}
      <div className="space-x-6 flex items-center">

        {/* Always show */}
        <Link to="/" className="text-white hover:text-gray-300">Home</Link>
        <Link to="/events" className="text-white hover:text-gray-300">Events</Link>

        {/* Logged-in View */}
        {user ? (
          <>
            <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>

            <button
              onClick={handleLogout}
              className="cursor-pointer bg-red-600 text-white px-4 py-1 rounded-lg font-semibold
                         hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          /* Logged-out View */
          <Link
            to="/login"
            className="cursor-pointer bg-white text-red-900 px-4 py-1 rounded-lg font-semibold
                       hover:bg-gray-200 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
