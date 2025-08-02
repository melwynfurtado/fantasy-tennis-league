"use client";

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MatchResultPage() {
  const { data: players, isLoading } = useSWR('/api/player', fetcher);
  const [form, setForm] = useState({ 
    playerId: '', 
    round: '', 
    setsWon: '', 
    setsLost: '', 
    matchResult: '' // 'won' or 'lost'
  });
  const [message, setMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  // Calculate points based on PRD scoring system
  const calculatePoints = (setsWon: number, setsLost: number, matchResult: string, gender: string, playerSeed: number | null, round: number) => {
    let basePoints = 0;
    
    if (gender === 'male') {
      // Men's scoring: 3-0, 3-1, 3-2 (won) or 2-3, 1-3, 0-3 (lost)
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
      // Women's scoring: 2-0, 2-1 (won) or 1-2, 0-2 (lost)
      if (matchResult === 'won') {
        if (setsWon === 2 && setsLost === 0) basePoints = 5;
        else if (setsWon === 2 && setsLost === 1) basePoints = 3;
      } else {
        if (setsWon === 1 && setsLost === 2) basePoints = 1;
        else if (setsWon === 0 && setsLost === 2) basePoints = 0;
      }
    }

    // Apply bonus points based on round and seeding
    let bonusMultiplier = 1;
    if (
      (!playerSeed && round > 2) || // Non-seeded after round 2
      (playerSeed !== null && playerSeed >= 24 && playerSeed <= 32 && round > 3) || // 24-32 seeds after round 3
      (playerSeed !== null && playerSeed >= 16 && playerSeed <= 23 && round > 4) || // 16-23 seeds after round 4
      (playerSeed !== null && playerSeed >= 8 && playerSeed <= 15 && round >= 6) || // 8-15 seeds in quarters/semis
      (round >= 7) // All players after semi-finals
    ) {
      bonusMultiplier = 2;
    }

    return basePoints * bonusMultiplier;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'playerId' && value) {
      const player = players?.find((p: any) => p.id === parseInt(value));
      setSelectedPlayer(player);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');
    
    if (!selectedPlayer) {
      setMessage('Please select a player');
      return;
    }
    
    const setsWon = Number(form.setsWon);
    const setsLost = Number(form.setsLost);
    const round = Number(form.round);
    const gender = selectedPlayer.gender;
    
    // Validate score combinations
    if (gender === 'male') {
      const validCombinations = [
        [3, 0], [3, 1], [3, 2], // Wins
        [2, 3], [1, 3], [0, 3]  // Losses
      ];
      if (!validCombinations.some(([w, l]) => w === setsWon && l === setsLost)) {
        setMessage('Invalid score combination for men\'s match. Valid: 3-0, 3-1, 3-2 (win) or 2-3, 1-3, 0-3 (loss)');
        return;
      }
    } else {
      const validCombinations = [
        [2, 0], [2, 1], // Wins
        [1, 2], [0, 2]  // Losses
      ];
      if (!validCombinations.some(([w, l]) => w === setsWon && l === setsLost)) {
        setMessage('Invalid score combination for women\'s match. Valid: 2-0, 2-1 (win) or 1-2, 0-2 (loss)');
        return;
      }
    }
    
    const matchResult = setsWon > setsLost ? 'won' : 'lost';
    const points = calculatePoints(setsWon, setsLost, matchResult, gender, selectedPlayer.seed, round);
    
    const res = await fetch('/api/matchResult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: Number(form.playerId),
        round: round,
        setsWon: setsWon,
        setsLost: setsLost,
        points: points,
        score: `${setsWon}-${setsLost}`,
      }),
    });
    
    if (res.ok) {
      setMessage(`Result added! ${selectedPlayer.name} scored ${points} points.`);
      setForm({ playerId: '', round: '', setsWon: '', setsLost: '', matchResult: '' });
      setSelectedPlayer(null);
    } else {
      const data = await res.json();
      setMessage(data.error || 'Error adding result');
    }
  };

  const previewPoints = () => {
    if (!selectedPlayer || !form.round || !form.setsWon || !form.setsLost) return null;
    
    const setsWon = Number(form.setsWon);
    const setsLost = Number(form.setsLost);
    const round = Number(form.round);
    const matchResult = setsWon > setsLost ? 'won' : 'lost';
    
    const points = calculatePoints(setsWon, setsLost, matchResult, selectedPlayer.gender, selectedPlayer.seed, round);
    
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded border">
        <h4 className="font-semibold text-blue-800">Points Preview:</h4>
        <p className="text-blue-700">
          {selectedPlayer.name} will score <strong>{points} points</strong> for this result.
        </p>
        {points > calculatePoints(setsWon, setsLost, matchResult, selectedPlayer.gender, selectedPlayer.seed, 1) && (
          <p className="text-sm text-blue-600 mt-1">
            ⭐ Bonus points applied due to seeding/round combination!
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; Add Match Result
      </nav>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add Match Result</h1>
      
      {/* Scoring Rules */}
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <h3 className="font-semibold text-gray-800 mb-2">Scoring Rules:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>Men's Matches:</strong>
            <ul className="list-disc list-inside mt-1">
              <li>Win 3-0: 5 points</li>
              <li>Win 3-1: 4 points</li>
              <li>Win 3-2: 3 points</li>
              <li>Lose 2-3: 2 points</li>
              <li>Lose 1-3: 1 point</li>
              <li>Lose 0-3: 0 points</li>
            </ul>
          </div>
          <div>
            <strong>Women's Matches:</strong>
            <ul className="list-disc list-inside mt-1">
              <li>Win 2-0: 5 points</li>
              <li>Win 2-1: 3 points</li>
              <li>Lose 1-2: 1 point</li>
              <li>Lose 0-2: 0 points</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Bonus:</strong> Double points for non-seeded after R2, seeds 24-32 after R3, seeds 16-23 after R4, seeds 8-15 in quarters+, all after semis.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Player:</label>
          <select 
            name="playerId" 
            value={form.playerId} 
            onChange={handleChange} 
            className="border rounded p-3 w-full"
            required
          >
            <option value="">Select player</option>
            {players && players.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.gender}, {p.seed ? `Seed ${p.seed}` : 'Non-seeded'})
              </option>
            ))}
          </select>
        </div>
        
        {selectedPlayer && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-green-800">
              <strong>Selected:</strong> {selectedPlayer.name} - {selectedPlayer.gender} - {selectedPlayer.seed ? `Seed ${selectedPlayer.seed}` : 'Non-seeded'}
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Round:</label>
          <select 
            name="round" 
            value={form.round} 
            onChange={handleChange} 
            className="border rounded p-3 w-full"
            required
          >
            <option value="">Select round</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
            <option value="4">Round 4</option>
            <option value="5">Round 5 (Round of 16)</option>
            <option value="6">Quarter-finals</option>
            <option value="7">Semi-finals</option>
            <option value="8">Final</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sets Won:</label>
            <input 
              name="setsWon" 
              type="number" 
              value={form.setsWon} 
              onChange={handleChange} 
              className="border rounded p-3 w-full" 
              min={0} 
              max={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sets Lost:</label>
            <input 
              name="setsLost" 
              type="number" 
              value={form.setsLost} 
              onChange={handleChange} 
              className="border rounded p-3 w-full" 
              min={0} 
              max={3}
              required
            />
          </div>
        </div>
        
        {previewPoints()}
        
        <button 
          type="submit" 
          className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
        >
          Add Match Result
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Error') || message.includes('Invalid') 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
