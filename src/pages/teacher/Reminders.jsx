import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import { generateReminderNote } from "../../lib/gemini";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    note: "",
    remind_at: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("remind_at", { ascending: true });
    if (error) console.log(error);
    else setReminders(data);
    setLoading(false);
  }

  function handleAddReminder() {
    setEditingId(null);
    setFormData({ title: "", note: "", remind_at: "" });
    setShowModal(true);
  }

  function handleEditReminder(reminder) {
    setEditingId(reminder.id);
    // Convert UTC to local datetime-local format
    const localDate = new Date(reminder.remind_at);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setFormData({
      title: reminder.title,
      note: reminder.note || "",
      remind_at: formattedDateTime
    });
    setShowModal(true);
  }

  async function handleDeleteReminder(reminderId) {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) {
        console.error('Error deleting reminder:', error);
        throw error;
      }

      console.log('Reminder deleted successfully');
      fetchReminders();
      return { success: true };
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      return { success: false, error: err };
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: "", note: "", remind_at: "" });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();
    
    // Convert local datetime to UTC for storage
    const localDate = new Date(formData.remind_at);
    const utcDate = localDate.toISOString();
    
    if (editingId) {
      // Update existing reminder
      const { data, error } = await supabase
        .from("reminders")
        .update({
          title: formData.title,
          note: formData.note,
          remind_at: utcDate
        })
        .eq('id', editingId)
        .select();

      if (error) {
        console.error("Error updating reminder:", error);
        alert("Failed to update reminder");
      } else {
        fetchReminders();
        handleCloseModal();
      }
    } else {
      // Insert new reminder
      const { data, error } = await supabase
        .from("reminders")
        .insert([
          {
            user_id: userData.user.id,
            title: formData.title,
            note: formData.note,
            remind_at: utcDate
          }
        ])
        .select();

      if (error) {
        console.error("Error adding reminder:", error);
        alert("Failed to add reminder");
      } else {
        setReminders(prev => [...prev, ...data].sort((a, b) => 
          new Date(a.remind_at) - new Date(b.remind_at)
        ));
        handleCloseModal();
      }
    }
    
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading reminders...</p>
      </div>
    );
  }

  async function handleGenerateNote() {
  if (!formData.title || !formData.remind_at) {
    alert("Please enter a title and date first");
    return;
  }
  
  setSubmitting(true);
  try {
    const note = await generateReminderNote(formData.title, formData.remind_at);
    setFormData(prev => ({ ...prev, note }));
  } catch (err) {
    alert("Failed to generate note");
  }
  setSubmitting(false);
}
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reminders</h1>
        <button
          onClick={handleAddReminder}
          className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reminders found. Create your first reminder!</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remind At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reminder.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {reminder.note || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reminder.remind_at).toLocaleString('en-PH', { 
                      timeZone: 'Asia/Manila',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(reminder.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="cursor-pointer text-black hover:text-gray-700 mr-3"
                      onClick={() => handleEditReminder(reminder)}
                    >
                      Edit
                    </button>
                    <button 
                      className="cursor-pointer text-red-600 hover:text-red-900" 
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Reminder" : "Add New Reminder"}
            </h2>
            <div onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reminder title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add additional details (optional)"
                />
                <button 
                type="button"
                onClick={handleGenerateNote}
                className="cursor-pointer px-1.5 py-0.1 rounded border bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Generate with AI</button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind At *
                </label>
                <input
                  type="datetime-local"
                  name="remind_at"
                  value={formData.remind_at}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cursor-pointer px-4 py-2 text-black bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Reminder" : "Add Reminder")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}