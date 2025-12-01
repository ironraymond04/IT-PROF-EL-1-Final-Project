import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { sendGeminiMessage } from "../lib/gemini";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Gemini Event Assistant. What can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newUserMsg = { role: "user", content: userMessage };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Pass conversation history and new message to Gemini
      const response = await sendGeminiMessage(messages, userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      {/* Chat Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        aria-label="Toggle chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          <div className="p-3 bg-red-600 text-white font-semibold rounded-t-2xl">
            Gemini Event Assistant
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-2 max-h-80">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl ${
                  m.role === "assistant"
                    ? "bg-red-100 text-gray-800"
                    : "bg-gray-200 text-gray-900 ml-auto max-w-[85%]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-red-100 text-gray-800 p-2 rounded-xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-2 flex border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask something..."
              disabled={isLoading}
              className="flex-1 border border-gray-300 rounded-l-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-r-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}