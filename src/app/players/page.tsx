"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PlayersPage() {
  const { data: players, error, mutate } = useSWR("/api/player", fetcher);
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [seedPoolFilter, setSeedPoolFilter] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: "", gender: "", seed: "" });
  const [message, setMessage] = useState("");

  // Filter players based on selected filters
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

  // Group players by seed pools for better display
  const playersByPool = {
    "Seeds 1-7": filteredPlayers.filter((p: any) => p.seed >= 1 && p.seed <= 7),
    "Seeds 8-15": filteredPlayers.filter((p: any) => p.seed >= 8 && p.seed <= 15),
    "Seeds 16-23": filteredPlayers.filter((p: any) => p.seed >= 16 && p.seed <= 23),
    "Seeds 24-32": filteredPlayers.filter((p: any) => p.seed >= 24 && p.seed <= 32),
    "Non-seeded": filteredPlayers.filter((p: any) => !p.seed),
  };

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this player?')) return;
    try {
      const res = await fetch('/api/player', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        mutate();
        setMessage("Player deleted successfully");
      } else {
        setMessage("Error deleting player");
      }
    } catch {
      setMessage("Error deleting player");
    }
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    
    const playerData = {
      name: newPlayer.name,
      gender: newPlayer.gender,
      seed: newPlayer.seed ? parseInt(newPlayer.seed) : null,
    };
    
    try {
      const res = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      
      if (res.ok) {
        setMessage("Player added successfully");
        setNewPlayer({ name: "", gender: "", seed: "" });
        setShowAddForm(false);
        mutate();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error adding player");
      }
    } catch {
      setMessage("Error adding player");
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; Player Pool
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Player Pool</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          {showAddForm ? 'Cancel' : 'Add Player'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Player Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-3">Add New Player</h3>
          <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
              className="border rounded p-2"
              required
            />
            <select
              value={newPlayer.gender}
              onChange={(e) => setNewPlayer({...newPlayer, gender: e.target.value})}
              className="border rounded p-2"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="number"
              placeholder="Seed (optional)"
              value={newPlayer.seed}
              onChange={(e) => setNewPlayer({...newPlayer, seed: e.target.value})}
              className="border rounded p-2"
              min="1"
              max="32"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Add Player
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Gender:</label>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="border rounded p-2"
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
            className="border rounded p-2"
          >
            <option value="">All Seed Pools</option>
            <option value="1-7">Seeds 1-7</option>
            <option value="8-15">Seeds 8-15</option>
            <option value="16-23">Seeds 16-23</option>
            <option value="24-32">Seeds 24-32</option>
            <option value="non-seeded">Non-seeded</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => { setGenderFilter(""); setSeedPoolFilter(""); }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">Failed to load players</p>}
      
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(playersByPool).map(([poolName, poolPlayers]) => (
          <div key={poolName} className="bg-blue-50 p-3 rounded text-center">
            <div className="text-lg font-bold text-blue-800">{poolPlayers.length}</div>
            <div className="text-sm text-blue-600">{poolName}</div>
          </div>
        ))}
      </div>

      {/* Players grouped by seed pools */}
      {!seedPoolFilter && (
        <div className="space-y-6">
          {Object.entries(playersByPool).map(([poolName, poolPlayers]) => {
            if (poolPlayers.length === 0) return null;
            
            return (
              <div key={poolName}>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">{poolName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {poolPlayers.map((player: any) => (
                    <div key={player.id} className="border rounded p-4 bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">{player.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{player.gender}</div>
                          <div className="text-sm font-medium text-blue-600">
                            {player.seed ? `Seed ${player.seed}` : 'Non-seeded'}
                          </div>
                        </div>
                        <button
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                          onClick={() => handleDelete(player.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtered table view */}
      {seedPoolFilter && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-3 text-left">Name</th>
                <th className="border border-gray-300 p-3 text-left">Gender</th>
                <th className="border border-gray-300 p-3 text-left">Seed</th>
                <th className="border border-gray-300 p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player: any) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">{player.name}</td>
                  <td className="border border-gray-300 p-3 capitalize">{player.gender}</td>
                  <td className="border border-gray-300 p-3">
                    {player.seed ? `Seed ${player.seed}` : 'Non-seeded'}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      onClick={() => handleDelete(player.id)}
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
      
      {filteredPlayers.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No players found matching the current filters.
        </div>
      )}
    </div>
  );
}
