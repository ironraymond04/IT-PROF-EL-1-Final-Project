import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import bg from "./assets/bg.png";

//Admin Pages
import ManageEvents from "./pages/admin/ManageEvents";
import UserAccounts from "./pages/admin/UserAccounts";
import Analytics from "./pages/admin/Analytics";

//Student Pages
import RegisteredEvents from "./pages/student/RegisteredEvents";
import JoinEvents from "./pages/student/JoinEvents";

//Teacher Pages
import MyEvents from "./pages/teacher/MyEvents";
import Reminders from "./pages/teacher/Reminders";

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

          {/*Admin*/}
            <Route path="/admin/manage-events" element={<ManageEvents />} />
            <Route path="/admin/user-accounts" element={<UserAccounts />} />
            <Route path="/admin/analytics" element={<Analytics />} />

          {/*Student*/}
          <Route path="student/registered-events" element={<RegisteredEvents/>} />
          <Route path="student/join-events" element={<JoinEvents/>} />

          {/*Teacher*/}
          <Route path="teacher/my-events" element={<MyEvents/>} />
          <Route path="teacher/reminders" element={<Reminders/>} />

        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}