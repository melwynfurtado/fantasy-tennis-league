"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminParticipantsPage() {
  const { data: participants, error, mutate } = useSWR("/api/participants", fetcher);
  const { data: teams } = useSWR("/api/team", fetcher);
  const [editingParticipant, setEditingParticipant] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");

  // Create a mapping of participant teams
  const participantTeams = teams?.reduce((acc: any, team: any) => {
    acc[team.participantId] = team;
    return acc;
  }, {}) || {};

  // All participants (no filtering needed without gender)
  const filteredParticipants = participants || [];

  const handleEdit = (participant: any) => {
    setEditingParticipant({ ...participant });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/participants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingParticipant),
      });
      
      if (res.ok) {
        setMessage("Participant updated successfully");
        setEditingParticipant(null);
        mutate();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error updating participant");
      }
    } catch {
      setMessage("Error updating participant");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this participant? This will also delete their team if they have one.')) return;
    
    try {
      const res = await fetch('/api/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setMessage("Participant deleted successfully");
        mutate();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error deleting participant");
      }
    } catch {
      setMessage("Error deleting participant");
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParticipant),
      });
      
      if (res.ok) {
        setMessage("Participant added successfully");
        setNewParticipant({ name: "", email: "" });
        setShowAddForm(false);
        mutate();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error adding participant");
      }
    } catch {
      setMessage("Error adding participant");
    }
  };

  const handleBulkAction = async () => {
    if (selectedParticipants.length === 0) {
      setMessage("No participants selected");
      return;
    }

    if (bulkAction === "delete") {
      if (!confirm(`Are you sure you want to delete ${selectedParticipants.length} participants?`)) return;
      
      try {
        await Promise.all(selectedParticipants.map(id =>
          fetch('/api/participants', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          })
        ));
        setMessage(`${selectedParticipants.length} participants deleted successfully`);
        setSelectedParticipants([]);
        mutate();
      } catch {
        setMessage("Error in bulk delete operation");
      }
    }
  };

  const toggleParticipantSelection = (participantId: number) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredParticipants.map((p: any) => p.id);
    setSelectedParticipants(visibleIds);
  };

  const clearSelection = () => {
    setSelectedParticipants([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; 
        <Link href="/admin" className="text-blue-600 hover:underline"> Admin</Link> &gt;
        Participant Management
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👥 Participant Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {showAddForm ? 'Cancel' : 'Add Participant'}
          </button>
          <Link 
            href="/participants" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Public Registration
          </Link>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Participant Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-3">Add New Participant</h3>
          <form onSubmit={handleAddParticipant} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Participant Name"
              value={newParticipant.name}
              onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
              className="border rounded p-2"
              required
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newParticipant.email}
              onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
              className="border rounded p-2"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Add Participant
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{participants?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Participants</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {teams?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Teams Created</div>
        </div>
      </div>

      {/* Filters and bulk actions */}
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Action:</label>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Action</option>
              <option value="delete">Delete Selected</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={handleBulkAction}
              disabled={selectedParticipants.length === 0 || !bulkAction}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-gray-400"
            >
              Execute ({selectedParticipants.length})
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={selectAllVisible}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
          >
            Select All Visible
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">Failed to load participants</p>}
      
      {/* Participants table */}
      {filteredParticipants && filteredParticipants.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.length === filteredParticipants.length}
                      onChange={() => 
                        selectedParticipants.length === filteredParticipants.length 
                          ? clearSelection() 
                          : selectAllVisible()
                      }
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700">Name</th>
                  <th className="p-3 text-left font-medium text-gray-700">Email</th>
                  <th className="p-3 text-left font-medium text-gray-700">Team Status</th>
                  <th className="p-3 text-left font-medium text-gray-700">Created</th>
                  <th className="p-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParticipants.map((participant: any) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => toggleParticipantSelection(participant.id)}
                      />
                    </td>
                    <td className="p-3">
                      {editingParticipant?.id === participant.id ? (
                        <input
                          type="text"
                          value={editingParticipant.name}
                          onChange={(e) => setEditingParticipant({...editingParticipant, name: e.target.value})}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        <span className="font-medium">{participant.name}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingParticipant?.id === participant.id ? (
                        <input
                          type="email"
                          value={editingParticipant.email || ''}
                          onChange={(e) => setEditingParticipant({...editingParticipant, email: e.target.value})}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        <span className="text-gray-600">{participant.email || 'No email'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {participantTeams[participant.id] ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Team Created
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          No Team
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(participant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      {editingParticipant?.id === participant.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingParticipant(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(participant)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(participant.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                          >
                            Delete
                          </button>
                          {!participantTeams[participant.id] && (
                            <Link
                              href={`/team?participantId=${participant.id}`}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                            >
                              Create Team
                            </Link>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {filteredParticipants && filteredParticipants.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-600 text-lg">No participants found matching the current filters.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add First Participant
          </button>
        </div>
      )}
    </div>
  );
}
