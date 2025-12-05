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

/**
 * Generates an AI description for an event
 * @param {string} eventTitle - The title of the event
 * @param {string} eventDate - The date of the event
 * @param {string} eventLocation - The location of the event
 * @returns {Promise<string>} Generated Description
 */
export async function generateAIDescription(eventTitle, eventDate, eventLocation) {
  try {
    const prompt = `
    Generate a compelling and professional event description for the following event:
    Event Title: ${eventTitle}
    Date: ${eventDate}
    Location: ${eventLocation}

    Create a description that is:
    - 2-3 sentences long
    - Engaging and informative
    - Appropriate for a school event
    - Does not include quotation marks
    Description:
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      temperature: 0.8,
      max_output_tokens: 200
    });

    let text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    text = text.replace(/["]+/g, "").trim();

    return text || "Unable to generate description.";
  } catch (err) {
    console.error("Gemini AI Description Error:", err);
    throw new Error("Failed to generate AI Description.");
  }
}

/**
 * Generates an AI note for a reminder
 * @param {string} reminderTitle - The title of the reminder
 * @param {string} remindAt - The date/time when to be reminded
 * @returns {Promise<string>} Generated Note
 */
export async function generateReminderNote(reminderTitle, remindAt) {
  try {
    const reminderDate = new Date(remindAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const prompt = `
    Generate a helpful and contextual note for the following reminder:
    Reminder Title: ${reminderTitle}
    Scheduled for: ${reminderDate}

    Create a note that is:
    - 1-2 sentences long
    - Helpful and actionable
    - Provides context or preparation tips
    - Appropriate and professional
    - Does not include quotation marks
    Note:
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      temperature: 0.7,
      max_output_tokens: 150
    });

    let text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    text = text.replace(/["]+/g, "").trim();

    return text || "Unable to generate note.";
  } catch (err) {
    console.error("Gemini AI Reminder Note Error:", err);
    throw new Error("Failed to generate AI note.");
  }
}