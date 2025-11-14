import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

/**
 * Sends a message to Gemini 2.5 Flash model with event context
 * @param {Array} history - array of messages [{role: 'user'|'assistant', content: 'text'}]
 * @param {string} newMessage - the new user message
 * @param {Array} events - array of event objects [{name, date, location}]
 * @returns {Promise<string>}
 */
export async function sendGeminiMessage(history = [], newMessage, events = []) {
  try {
    // Convert events array into readable text for AI
    const eventsText = events.length
      ? events.map((e, i) => `${i + 1}. ${e.name} - ${e.date} at ${e.location}`).join("\n")
      : "There are no upcoming events at the moment.";

    // Combine chat history into one prompt
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
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      temperature: 0.7,
      max_output_tokens: 512
    });

    // Clean response text
    let text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    text = text.replace(/["]+/g, "").trim(); // Remove quotes if any

    return text || "No response from Gemini.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Error connecting to Gemini API.";
  }
}