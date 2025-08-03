"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminTournamentPage() {
  const { data: matchResults, mutate } = useSWR('/api/matchResult', fetcher);
  const { data: players } = useSWR('/api/player', fetcher);
  const { data: teams } = useSWR('/api/team', fetcher);
  const [currentRound, setCurrentRound] = useState(1);
  const [message, setMessage] = useState("");
  const [bulkResultsText, setBulkResultsText] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Tournament rounds configuration
  const rounds = [
    { round: 1, name: "Round 1", description: "First round of the tournament" },
    { round: 2, name: "Round 2", description: "Second round" },
    { round: 3, name: "Round 3", description: "Third round" },
    { round: 4, name: "Round 4", description: "Fourth round" },
    { round: 5, name: "Round of 16", description: "Round of 16" },
    { round: 6, name: "Quarter-finals", description: "Quarter-final matches" },
    { round: 7, name: "Semi-finals", description: "Semi-final matches" },
    { round: 8, name: "Final", description: "Championship final" }
  ];

  // Calculate round statistics
  const roundStats = rounds.map(round => {
    const roundResults = matchResults?.filter((r: any) => r.round === round.round) || [];
    const playersInRound = new Set(roundResults.map((r: any) => r.playerId)).size;
    const totalPoints = roundResults.reduce((sum: number, r: any) => sum + r.points, 0);
    
    return {
      ...round,
      resultsCount: roundResults.length,
      playersCount: playersInRound,
      totalPoints,
      avgPoints: playersInRound > 0 ? (totalPoints / playersInRound).toFixed(1) : 0
    };
  });

  // Get bonus point eligibility info
  const getBonusInfo = (round: number) => {
    const bonusRules = [];
    if (round > 2) bonusRules.push("Non-seeded players get double points");
    if (round > 3) bonusRules.push("Seeds 24-32 get double points");
    if (round > 4) bonusRules.push("Seeds 16-23 get double points");
    if (round >= 6) bonusRules.push("Seeds 8-15 get double points");
    if (round >= 7) bonusRules.push("All players get double points");
    
    return bonusRules;
  };

  // Calculate points based on tournament scoring rules
  const calculatePoints = (setsWon: number, setsLost: number, gender: string, playerSeed: number | null, round: number) => {
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
      (!playerSeed && round > 2) ||
      (playerSeed !== null && playerSeed >= 24 && playerSeed <= 32 && round > 3) ||
      (playerSeed !== null && playerSeed >= 16 && playerSeed <= 23 && round > 4) ||
      (playerSeed !== null && playerSeed >= 8 && playerSeed <= 15 && round >= 6) ||
      (round >= 7)
    ) {
      bonusMultiplier = 2;
    }

    return basePoints * bonusMultiplier;
  };

  const handleBulkImportResults = async () => {
    const lines = bulkResultsText.trim().split('\n');
    const results = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        const playerName = parts[0];
        const round = parseInt(parts[1]);
        const setsWon = parseInt(parts[2]);
        const setsLost = parseInt(parts[3]);
        
        // Find player by name
        const player = players?.find((p: any) => 
          p.name.toLowerCase() === playerName.toLowerCase()
        );
        
        if (player) {
          const points = calculatePoints(setsWon, setsLost, player.gender, player.seed, round);
          results.push({
            playerId: player.id,
            round,
            setsWon,
            setsLost,
            points,
            score: `${setsWon}-${setsLost}`
          });
        }
      }
    }
    
    try {
      await Promise.all(results.map(result =>
        fetch('/api/matchResult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        })
      ));
      setMessage(`${results.length} match results imported successfully`);
      setBulkResultsText("");
      setShowBulkImport(false);
      mutate();
    } catch {
      setMessage("Error in bulk import operation");
    }
  };

  const handleRecalculatePoints = async () => {
    if (!confirm("This will recalculate all points based on current rules. Continue?")) return;
    
    try {
      const updates = [];
      for (const result of matchResults || []) {
        const player = players?.find((p: any) => p.id === result.playerId);
        if (player) {
          const [setsWon, setsLost] = result.score.split('-').map(Number);
          const newPoints = calculatePoints(setsWon, setsLost, player.gender, player.seed, result.round);
          
          if (newPoints !== result.points) {
            updates.push({
              id: result.id,
              points: newPoints
            });
          }
        }
      }
      
      if (updates.length > 0) {
        // We'd need a bulk update endpoint for this
        setMessage(`Found ${updates.length} results that need point recalculation`);
      } else {
        setMessage("All points are already correct");
      }
    } catch {
      setMessage("Error recalculating points");
    }
  };

  const clearRound = async (round: number) => {
    if (!confirm(`Delete all results for ${rounds.find(r => r.round === round)?.name}?`)) return;
    
    try {
      const roundResults = matchResults?.filter((r: any) => r.round === round) || [];
      await Promise.all(roundResults.map((result: any) =>
        fetch('/api/matchResult', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: result.id }),
        })
      ));
      setMessage(`Cleared ${roundResults.length} results from round ${round}`);
      mutate();
    } catch {
      setMessage("Error clearing round");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; 
        <Link href="/admin" className="text-blue-600 hover:underline"> Admin</Link> &gt; 
        Tournament Management
      </nav>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏆 Tournament Management</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Tournament Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tournament Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Results:</span>
              <span className="font-bold">{matchResults?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Players:</span>
              <span className="font-bold">{new Set(matchResults?.map((r: any) => r.playerId)).size || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Points:</span>
              <span className="font-bold">{matchResults?.reduce((sum: number, r: any) => sum + r.points, 0) || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setShowBulkImport(!showBulkImport)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              Bulk Import Results
            </button>
            <button
              onClick={handleRecalculatePoints}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
            >
              Recalculate Points
            </button>
            <Link
              href="/matchResult"
              className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm text-center"
            >
              Add Single Result
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Round</h3>
          <select
            value={currentRound}
            onChange={(e) => setCurrentRound(parseInt(e.target.value))}
            className="w-full border rounded p-2 mb-2"
          >
            {rounds.map(round => (
              <option key={round.round} value={round.round}>
                {round.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            Use this to set the tournament phase for reference
          </div>
        </div>
      </div>

      {/* Bulk Import */}
      {showBulkImport && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="text-lg font-semibold mb-3">Bulk Import Match Results</h3>
          <p className="text-sm text-gray-600 mb-3">
            Enter results in CSV format: Player Name, Round, Sets Won, Sets Lost
            <br />
            Example: "Novak Djokovic, 1, 3, 0" or "Serena Williams, 2, 2, 1"
          </p>
          <textarea
            value={bulkResultsText}
            onChange={(e) => setBulkResultsText(e.target.value)}
            className="w-full h-40 p-3 border rounded"
            placeholder="Novak Djokovic, 1, 3, 0&#10;Serena Williams, 2, 2, 1&#10;Rafael Nadal, 1, 3, 2"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleBulkImportResults}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Import Results
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

      {/* Round Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Round Statistics</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-700">Round</th>
                  <th className="p-3 text-left font-medium text-gray-700">Results</th>
                  <th className="p-3 text-left font-medium text-gray-700">Players</th>
                  <th className="p-3 text-left font-medium text-gray-700">Total Points</th>
                  <th className="p-3 text-left font-medium text-gray-700">Avg Points</th>
                  <th className="p-3 text-left font-medium text-gray-700">Bonus Rules</th>
                  <th className="p-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roundStats.map((round) => {
                  const bonusRules = getBonusInfo(round.round);
                  return (
                    <tr key={round.round} className={`hover:bg-gray-50 ${
                      round.round === currentRound ? 'bg-blue-50' : ''
                    }`}>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{round.name}</div>
                          <div className="text-sm text-gray-600">{round.description}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          round.resultsCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {round.resultsCount}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{round.playersCount}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{round.totalPoints}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{round.avgPoints}</span>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {bonusRules.length > 0 ? (
                            bonusRules.map((rule, idx) => (
                              <div key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {rule}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500">No bonus points</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setCurrentRound(round.round)}
                            className={`px-3 py-1 rounded text-sm transition ${
                              round.round === currentRound
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            Select
                          </button>
                          {round.resultsCount > 0 && (
                            <button
                              onClick={() => clearRound(round.round)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition text-sm"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Current Round Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {rounds.find(r => r.round === currentRound)?.name} Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Bonus Point Rules:</h4>
            <div className="space-y-2">
              {getBonusInfo(currentRound).length > 0 ? (
                getBonusInfo(currentRound).map((rule, idx) => (
                  <div key={idx} className="text-sm bg-yellow-50 border border-yellow-200 p-2 rounded">
                    ⭐ {rule}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                  No bonus points for this round
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Scoring Reference:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Men:</strong> 3-0(5pts), 3-1(4pts), 3-2(3pts), 2-3(2pts), 1-3(1pt), 0-3(0pts)</div>
              <div><strong>Women:</strong> 2-0(5pts), 2-1(3pts), 1-2(1pt), 0-2(0pts)</div>
              <div className="text-xs text-gray-600 mt-2">
                All points are automatically doubled when bonus rules apply
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
