import { GoogleGenAI } from "@google/genai";
import supabase from "../lib/supabase"; 

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

/**
 * Fetches upcoming events from Supabase
 * @returns {Promise<Array>} Array of event objects
 */
async function fetchEvents() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, date, location, is_open")
      .eq("is_open", true)
      .gte("date", new Date().toISOString().split("T")[0]) // Only future/today events
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return [];
  }
}

/**
 * Formats events into readable text for AI
 * @param {Array} events - array of event objects from Supabase
 * @returns {string}
 */
function formatEventsForAI(events) {
  if (!events.length) {
    return "There are no upcoming events at the moment.";
  }

  return events
    .map((e, i) => {
      const dateStr = new Date(e.date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      return `${i + 1}. ${e.title} - ${dateStr} at ${e.location}${
        e.description ? `\n   Description: ${e.description}` : ""
      }`;
    })
    .join("\n");
}

/**
 * Sends a message to Gemini 2.5 Flash model with event context from Supabase
 * @param {Array} history - array of messages [{role: 'user'|'assistant', content: 'text'}]
 * @param {string} newMessage - the new user message
 * @returns {Promise<string>}
 */
export async function sendGeminiMessage(history = [], newMessage) {
  try {
    // Fetch events from Supabase
    const events = await fetchEvents();
    const eventsText = formatEventsForAI(events);

    // Format chat history
    const formattedHistory = history
      .map(m => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
      .join("\n");

    const prompt = `
You are a helpful school event assistant.

Here are the upcoming events:
${eventsText}

Conversation history:
${formattedHistory}

User: ${newMessage}

Answer in a friendly, clear, and concise manner. Use bullet points or numbers if listing events. Do not include quotation marks in your response.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      temperature: 0.7,
      max_output_tokens: 512
    });

    // Clean response text
    let text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    text = text.replace(/["]+/g, "").trim();

    return text || "No response from Gemini.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Error connecting to Gemini API.";
  }
}