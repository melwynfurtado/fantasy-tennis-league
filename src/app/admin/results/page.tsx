"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminResultsPage() {
  const { data: matchResults, mutate } = useSWR('/api/matchResult', fetcher);
  const { data: players } = useSWR('/api/player', fetcher);
  const [roundFilter, setRoundFilter] = useState<string>("");
  const [playerFilter, setPlayerFilter] = useState<string>("");
  const [editingResult, setEditingResult] = useState<any>(null);
  const [message, setMessage] = useState("");

  // Create player mapping
  const playerMap = players?.reduce((acc: any, player: any) => {
    acc[player.id] = player;
    return acc;
  }, {}) || {};

  // Enhanced results with player details
  const enhancedResults = matchResults?.map((result: any) => ({
    ...result,
    player: playerMap[result.playerId] || { name: 'Unknown Player', gender: 'Unknown', seed: null }
  })) || [];

  // Filter results
  const filteredResults = enhancedResults.filter((result: any) => {
    const matchesRound = !roundFilter || result.round === parseInt(roundFilter);
    const matchesPlayer = !playerFilter || 
      result.player.name.toLowerCase().includes(playerFilter.toLowerCase());
    return matchesRound && matchesPlayer;
  });

  const handleEdit = (result: any) => {
    setEditingResult({ ...result });
  };

  const handleSaveEdit = async () => {
    try {
      // For this example, we'd need a PUT endpoint for match results
      // Since we don't have one, we'll show a message
      setMessage("Edit functionality would require a PUT endpoint for match results");
      setEditingResult(null);
    } catch {
      setMessage("Error updating result");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this match result?')) return;
    
    try {
      const res = await fetch('/api/matchResult', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setMessage("Match result deleted successfully");
        mutate();
      } else {
        setMessage("Error deleting match result");
      }
    } catch {
      setMessage("Error deleting match result");
    }
  };

  // Calculate points based on scoring rules (for verification)
  const calculateExpectedPoints = (setsWon: number, setsLost: number, gender: string, seed: number | null, round: number) => {
    let basePoints = 0;
    const matchResult = setsWon > setsLost ? 'won' : 'lost';
    
    if (gender === 'male') {
      if (matchResult === 'won') {
        if (setsWon === 3 && setsLost === 0) basePoints = 5;
        else if (setsWon === 3 && setsLost === 1) basePoints = 4;
        else if (setsWon === 3 && setsLost === 2) basePoints = 3;
      } else {
        if (setsWon === 2 && setsLost === 3) basePoints = 2;
        else if (setsWon === 1 && setsLost === 3) basePoints = 1;
        else if (setsWon === 0 && setsLost === 3) basePoints = 0;
      }
    } else {
      if (matchResult === 'won') {
        if (setsWon === 2 && setsLost === 0) basePoints = 5;
        else if (setsWon === 2 && setsLost === 1) basePoints = 3;
      } else {
        if (setsWon === 1 && setsLost === 2) basePoints = 1;
        else if (setsWon === 0 && setsLost === 2) basePoints = 0;
      }
    }

    // Apply bonus points
    let bonusMultiplier = 1;
    if (
      (!seed && round > 2) ||
      (seed !== null && seed >= 24 && seed <= 32 && round > 3) ||
      (seed !== null && seed >= 16 && seed <= 23 && round > 4) ||
      (seed !== null && seed >= 8 && seed <= 15 && round >= 6) ||
      (round >= 7)
    ) {
      bonusMultiplier = 2;
    }

    return basePoints * bonusMultiplier;
  };

  // Group results by round
  const resultsByRound = filteredResults.reduce((acc: any, result: any) => {
    if (!acc[result.round]) acc[result.round] = [];
    acc[result.round].push(result);
    return acc;
  }, {});

  const rounds = [
    { value: 1, label: "Round 1" },
    { value: 2, label: "Round 2" },
    { value: 3, label: "Round 3" },
    { value: 4, label: "Round 4" },
    { value: 5, label: "Round of 16" },
    { value: 6, label: "Quarter-finals" },
    { value: 7, label: "Semi-finals" },
    { value: 8, label: "Final" }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; 
        <Link href="/admin" className="text-blue-600 hover:underline"> Admin</Link> &gt; 
        Results Management
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Results Management</h1>
        <div className="flex gap-2">
          <Link 
            href="/matchResult" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Add Match Result
          </Link>
          <Link 
            href="/admin/tournament" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Tournament Management
          </Link>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{matchResults?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Results</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {new Set(matchResults?.map((r: any) => r.playerId)).size || 0}
          </div>
          <div className="text-sm text-gray-600">Players with Results</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {matchResults?.reduce((sum: number, r: any) => sum + r.points, 0) || 0}
          </div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.max(...(matchResults?.map((r: any) => r.round) || [0]))}
          </div>
          <div className="text-sm text-gray-600">Latest Round</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Round:</label>
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">All Rounds</option>
              {rounds.map(round => (
                <option key={round.value} value={round.value}>{round.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Player:</label>
            <input
              type="text"
              placeholder="Player name..."
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => { setRoundFilter(""); setPlayerFilter(""); }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results by Round */}
      {Object.entries(resultsByRound).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(resultsByRound)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([round, results]: [string, any]) => (
              <div key={round} className="bg-white rounded-lg shadow">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {rounds.find(r => r.value === parseInt(round))?.label || `Round ${round}`}
                    <span className="ml-2 text-sm text-gray-600">({results.length} results)</span>
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left font-medium text-gray-700">Player</th>
                        <th className="p-3 text-left font-medium text-gray-700">Gender</th>
                        <th className="p-3 text-left font-medium text-gray-700">Seed</th>
                        <th className="p-3 text-left font-medium text-gray-700">Score</th>
                        <th className="p-3 text-left font-medium text-gray-700">Points</th>
                        <th className="p-3 text-left font-medium text-gray-700">Expected</th>
                        <th className="p-3 text-left font-medium text-gray-700">Status</th>
                        <th className="p-3 text-center font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.map((result: any) => {
                        const [setsWon, setsLost] = result.score.split('-').map(Number);
                        const expectedPoints = calculateExpectedPoints(
                          setsWon, setsLost, result.player.gender, result.player.seed, result.round
                        );
                        const isCorrect = result.points === expectedPoints;
                        
                        return (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium">{result.player.name}</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.player.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                              }`}>
                                {result.player.gender}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm">
                                {result.player.seed ? `Seed ${result.player.seed}` : 'Non-seeded'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                setsWon > setsLost ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {result.score}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold">{result.points}</span>
                            </td>
                            <td className="p-3">
                              <span className={`font-medium ${
                                isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {expectedPoints}
                              </span>
                            </td>
                            <td className="p-3">
                              {isCorrect ? (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Correct
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                  ✗ Incorrect
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDelete(result.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-600 text-lg">No match results found.</p>
          <Link
            href="/matchResult"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add First Result
          </Link>
        </div>
      )}
    </div>
  );
}
