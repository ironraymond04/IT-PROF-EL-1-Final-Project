import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);

    // 1. Create user in auth.users
    const { data: authData, error: authError } =
      await supabase.auth.signUp({ email, password });

    if (authError) {
      setLoading(false);
      return alert(authError.message);
    }

    const userId = authData.user.id;

    // 2. Insert into public.users table
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: userId,
        email: email,
        role: role,
      },
    ]);

    setLoading(false);

    if (profileError) {
      alert(profileError.message);
    } else {
      alert("Signup successful! You can now log in.");
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm border">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Create an Account
        </h1>

        <input
          type="email"
          className="w-full border px-3 py-2 rounded mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ROLE DROPDOWN */}
        <select
          className="w-full border px-3 py-2 rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student 👨‍🎓</option>
          <option value="teacher">Teacher 👨‍🏫</option>
          <option value="admin">Admin 🛠️</option>
          <option value="guest">Guest 🚶</option>
        </select>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="cursor-pointer text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}