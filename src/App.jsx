import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import bg from "./assets/bg.png";

export default function App() {
  return (
    <Router>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />}/>
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}