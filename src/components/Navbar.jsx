import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import supabase from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch user role
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        
        setUserRole(userData?.role);

        // If student, fetch reminders
        if (userData?.role === "student") {
          fetchReminders(user.id);
        }
      }
    }
    loadUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setUserRole(null);
        setReminders([]);
        setUnreadCount(0);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

// Fetch reminders for students
async function fetchReminders(userId) {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .select("id, title, note, remind_at")  // ← Added 'id' here
      .eq("user_id", userId)                 // ← Added user filter
      .gte("remind_at", new Date().toISOString())
      .order("remind_at", { ascending: true });

    if (error) throw error;

    setReminders(data || []);
    
    // Count upcoming reminders (within next 24 hours)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingCount = data?.filter(
      r => new Date(r.remind_at) <= tomorrow
    ).length || 0;
    
    setUnreadCount(upcomingCount);
  } catch (error) {
    console.error("Error fetching reminders:", error);
  }
}

  // Logout handler
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `in ${diffMins} minutes`;
    if (diffHours < 24) return `in ${diffHours} hours`;
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    return `in ${diffDays} days`;
  }

  return (
    <nav className="bg-red-900 shadow-sm px-6 py-3 flex justify-between items-center relative">
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

            {/* Notification Button - Only for Students */}
            {userRole === "student" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-white hover:text-gray-300 transition p-2"
                  aria-label="Notifications"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">Upcoming Reminders</h3>
                    </div>
                    
                    {reminders.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No upcoming reminders
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {reminders.map((reminder) => (
                          <div key={reminder.id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                              <span className="text-xs text-red-600 font-medium">
                                {formatDate(reminder.remind_at)}
                              </span>
                            </div>
                            {reminder.note && (
                              <p className="text-sm text-gray-600 mt-1">{reminder.note}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(reminder.remind_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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