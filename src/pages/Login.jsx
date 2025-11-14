import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) alert(error.message);
    else window.location.href = "/dashboard";
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm border">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Login</h1>

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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}