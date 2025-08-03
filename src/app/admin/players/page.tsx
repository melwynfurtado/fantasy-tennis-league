"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPlayersPage() {
  const { data: players, error, mutate } = useSWR("/api/player", fetcher);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [seedPoolFilter, setSeedPoolFilter] = useState<string>("");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [message, setMessage] = useState("");

  // Filter players
  const filteredPlayers = players?.filter((player: any) => {
    const matchesGender = !genderFilter || player.gender === genderFilter;
    
    let matchesSeedPool = true;
    if (seedPoolFilter) {
      if (seedPoolFilter === "non-seeded") {
        matchesSeedPool = !player.seed;
      } else if (seedPoolFilter === "1-7") {
        matchesSeedPool = player.seed >= 1 && player.seed <= 7;
      } else if (seedPoolFilter === "8-15") {
        matchesSeedPool = player.seed >= 8 && player.seed <= 15;
      } else if (seedPoolFilter === "16-23") {
        matchesSeedPool = player.seed >= 16 && player.seed <= 23;
      } else if (seedPoolFilter === "24-32") {
        matchesSeedPool = player.seed >= 24 && player.seed <= 32;
      }
    }
    
    return matchesGender && matchesSeedPool;
  }) || [];

  const handleEdit = (player: any) => {
    setEditingPlayer({ ...player });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayer),
      });
      
      if (res.ok) {
        setMessage("Player updated successfully");
        setEditingPlayer(null);
        mutate();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error updating player");
      }
    } catch {
      setMessage("Error updating player");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const res = await fetch('/api/player', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setMessage("Player deleted successfully");
        mutate();
      } else {
        setMessage("Error deleting player");
      }
    } catch {
      setMessage("Error deleting player");
    }
  };

  const handleBulkAction = async () => {
    if (selectedPlayers.length === 0) {
      setMessage("No players selected");
      return;
    }

    if (bulkAction === "delete") {
      if (!confirm(`Are you sure you want to delete ${selectedPlayers.length} players?`)) return;
      
      try {
        await Promise.all(selectedPlayers.map(id =>
          fetch('/api/player', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          })
        ));
        setMessage(`${selectedPlayers.length} players deleted successfully`);
        setSelectedPlayers([]);
        mutate();
      } catch {
        setMessage("Error in bulk delete operation");
      }
    }
  };

  const handleBulkImport = async () => {
    const lines = bulkImportText.trim().split('\n');
    const players = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        players.push({
          name: parts[0],
          gender: parts[1].toLowerCase(),
          seed: parts[2] ? parseInt(parts[2]) : null
        });
      }
    }
    
    try {
      await Promise.all(players.map(player =>
        fetch('/api/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(player),
        })
      ));
      setMessage(`${players.length} players imported successfully`);
      setBulkImportText("");
      setShowBulkImport(false);
      mutate();
    } catch {
      setMessage("Error in bulk import operation");
    }
  };

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredPlayers.map((p: any) => p.id);
    setSelectedPlayers(visibleIds);
  };

  const clearSelection = () => {
    setSelectedPlayers([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; 
        <Link href="/admin" className="text-blue-600 hover:underline"> Admin</Link> &gt; 
        Player Management
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🎾 Player Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Bulk Import
          </button>
          <Link 
            href="/players" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Public Pool
          </Link>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Bulk Import */}
      {showBulkImport && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-3">Bulk Import Players</h3>
          <p className="text-sm text-gray-600 mb-3">
            Enter player data in CSV format: Name, Gender, Seed (optional)
            <br />
            Example: "John Doe, male, 1" or "Jane Smith, female"
          </p>
          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            className="w-full h-40 p-3 border rounded"
            placeholder="John Doe, male, 1&#10;Jane Smith, female, 2&#10;Mike Wilson, male"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleBulkImport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Import Players
            </button>
            <button
              onClick={() => setShowBulkImport(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{players?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Players</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {players?.filter((p: any) => p.gender === 'male').length || 0}
          </div>
          <div className="text-sm text-gray-600">Male</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-pink-600">
            {players?.filter((p: any) => p.gender === 'female').length || 0}
          </div>
          <div className="text-sm text-gray-600">Female</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {players?.filter((p: any) => p.seed).length || 0}
          </div>
          <div className="text-sm text-gray-600">Seeded</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-gray-600">
            {players?.filter((p: any) => !p.seed).length || 0}
          </div>
          <div className="text-sm text-gray-600">Non-seeded</div>
        </div>
      </div>

      {/* Filters and bulk actions */}
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Gender:</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Seed Pool:</label>
            <select
              value={seedPoolFilter}
              onChange={(e) => setSeedPoolFilter(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">All Seed Pools</option>
              <option value="1-7">Seeds 1-7</option>
              <option value="8-15">Seeds 8-15</option>
              <option value="16-23">Seeds 16-23</option>
              <option value="24-32">Seeds 24-32</option>
              <option value="non-seeded">Non-seeded</option>
            </select>
          </div>
          
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
              disabled={selectedPlayers.length === 0 || !bulkAction}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-gray-400"
            >
              Execute ({selectedPlayers.length})
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
          <button
            onClick={() => { setGenderFilter(""); setSeedPoolFilter(""); }}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">Failed to load players</p>}
      
      {/* Players table */}
      {filteredPlayers && filteredPlayers.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.length === filteredPlayers.length}
                      onChange={() => 
                        selectedPlayers.length === filteredPlayers.length 
                          ? clearSelection() 
                          : selectAllVisible()
                      }
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700">Name</th>
                  <th className="p-3 text-left font-medium text-gray-700">Gender</th>
                  <th className="p-3 text-left font-medium text-gray-700">Seed</th>
                  <th className="p-3 text-left font-medium text-gray-700">Pool</th>
                  <th className="p-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPlayers.map((player: any) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        onChange={() => togglePlayerSelection(player.id)}
                      />
                    </td>
                    <td className="p-3">
                      {editingPlayer?.id === player.id ? (
                        <input
                          type="text"
                          value={editingPlayer.name}
                          onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        <span className="font-medium">{player.name}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingPlayer?.id === player.id ? (
                        <select
                          value={editingPlayer.gender}
                          onChange={(e) => setEditingPlayer({...editingPlayer, gender: e.target.value})}
                          className="border rounded p-1"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          player.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {player.gender}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingPlayer?.id === player.id ? (
                        <input
                          type="number"
                          value={editingPlayer.seed || ''}
                          onChange={(e) => setEditingPlayer({...editingPlayer, seed: e.target.value ? parseInt(e.target.value) : null})}
                          className="border rounded p-1 w-20"
                          min="1"
                          max="32"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          player.seed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {player.seed || 'Non-seeded'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {player.seed 
                        ? (player.seed <= 7 ? '1-7' : 
                           player.seed <= 15 ? '8-15' : 
                           player.seed <= 23 ? '16-23' : '24-32')
                        : 'Non-seeded'
                      }
                    </td>
                    <td className="p-3 text-center">
                      {editingPlayer?.id === player.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPlayer(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(player)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(player.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                          >
                            Delete
                          </button>
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
      
      {filteredPlayers && filteredPlayers.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-600 text-lg">No players found matching the current filters.</p>
        </div>
      )}
    </div>
  );
}
