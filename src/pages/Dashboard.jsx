import { useEffect, useState } from "react";
import { CalendarDays, Users, Settings, BarChart3 } from "lucide-react";
import supabase from "../lib/supabase";
import RoleBadge from "../components/RoleBadge";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    // Listen for login/logout events → refresh dashboard UI
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadUser() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) console.log(error);

      // Correct role assignment logic
      if (profile?.role) {
        setRole(profile.role);
      } else {
        setRole("student"); // Default role for newly logged-in users
      }
    } else {
      setRole("guest");
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Top */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-blue-600">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
          <RoleBadge role={role} />
        </div>
      </div>

      {/* User info */}
      {user ? (
        <p className="text-gray-700 mb-6">
          Welcome, <span className="font-semibold">{user.email}</span> 👋
        </p>
      ) : (
        <p className="text-gray-600 mb-4">
          You are currently browsing as a guest.
        </p>
      )}

      {/* Panels */}
      {role === "admin" && <AdminPanel />}
      {role === "teacher" && <TeacherPanel />}
      {role === "student" && <StudentPanel />}
      {role === "guest" && <GuestPanel />}

      {/* Gemini Tips */}
      <div className="mt-10 p-5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          💡 Gemini Assistant Tip
        </h2>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          {role === "admin" && (
            <>
              <li>Summarize all events with low attendance this month.</li>
              <li>Generate a report of the top 5 most attended events.</li>
            </>
          )}
          {role === "teacher" && (
            <>
              <li>Create a reminder for the Science Fair.</li>
              <li>Show me my upcoming events this week.</li>
            </>
          )}
          {role === "student" && (
            <>
              <li>Which events can I still register for?</li>
              <li>Set a reminder for the Sports Fest.</li>
            </>
          )}
          {role === "guest" && (
            <>
              <li>What public events are available this week?</li>
              <li>How can I register as a student?</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

/* -------------------- ROLE PANELS -------------------- */

function AdminPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        icon={<CalendarDays className="w-6 h-6 text-blue-600" />}
        title="Manage Events"
        desc="Create, approve, or delete school events."
      />
      <Card
        icon={<Users className="w-6 h-6 text-green-600" />}
        title="User Accounts"
        desc="Manage teachers, students, and guest access."
      />
      <Card
        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
        title="Analytics"
        desc="View reports and participation statistics."
      />
    </div>
  );
}

function TeacherPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        icon={<CalendarDays className="w-6 h-6 text-blue-600" />}
        title="My Events"
        desc="View and manage your department’s events."
      />
      <Card
        icon={<Settings className="w-6 h-6 text-yellow-600" />}
        title="Reminders"
        desc="Set reminders or announcements for your classes."
      />
    </div>
  );
}

function StudentPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        icon={<CalendarDays className="w-6 h-6 text-blue-600" />}
        title="Registered Events"
        desc="See events you’ve signed up for."
      />
      <Card
        icon={<Users className="w-6 h-6 text-green-600" />}
        title="Join Events"
        desc="Discover and register for upcoming activities."
      />
    </div>
  );
}

function GuestPanel() {
  return (
    <div className="text-center bg-gray-100 p-6 rounded-xl border shadow-sm">
      <p className="text-gray-700 mb-3">
        You are currently a guest. Please log in to access more features.
      </p>
      <a
        href="/login"
        className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Login Now
      </a>
    </div>
  );
}

/* -------------------- CARD COMPONENT -------------------- */

function Card({ icon, title, desc }) {
  return (
    <div className="bg-white border rounded-xl shadow p-4 hover:shadow-md transition">
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
