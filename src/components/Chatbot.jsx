import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { sendGeminiMessage } from "../lib/gemini";
import { events } from "../pages/Events"; // import events

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your Gemini Event Assistant. Ask me about upcoming events or student registration.",
    },
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    // Pass events array to Gemini
    const response = await sendGeminiMessage(messages, input, events);

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
  };

  return (
    <div>
      {/* Chat Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          <div className="p-3 bg-blue-600 text-white font-semibold rounded-t-2xl">
            Gemini Event Assistant
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-2 max-h-80">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl ${
                  m.role === "assistant"
                    ? "bg-blue-100 text-gray-800 self-start"
                    : "bg-gray-200 text-gray-900 self-end"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
<div className="p-2 flex border-t">
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask something..."
    className="flex-1 border border-gray-300 rounded-l-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
  <button
    onClick={handleSend}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-xl flex items-center justify-center"
  >
    <Send className="w-5 h-5" />
  </button>
</div>
        </div>
      )}
    </div>
  );
}