import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../lib/supabase";
import bg from "../assets/bg.png";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }  
    }
  });

  if (error) {
    alert("Signup failed: " + error.message);
    setLoading(false);
    return;
  }

  alert("Signup successful! Check your email for verification.");
  setLoading(false);
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-8 w-full max-w-sm border">
        <h1 className="text-2xl font-bold text-red-600 mb-6 text-center">
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
          className="cursor-pointer w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}