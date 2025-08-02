"use client"
import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const seedPools = [
  { label: 'Seed 1–7', min: 1, max: 7 },
  { label: 'Seed 8–15', min: 8, max: 15 },
  { label: 'Seed 16–23', min: 16, max: 23 },
  { label: 'Seed 24–32', min: 24, max: 32 },
];

function filterPlayers(players: any[], gender: string, min?: number, max?: number, seeded?: boolean) {
  return players.filter(p =>
    p.gender === gender &&
    (min === undefined || max === undefined || (p.seed && p.seed >= min && p.seed <= max)) &&
    (seeded === undefined || (seeded ? p.seed : !p.seed))
  );
}

export default function TeamSelectionPage() {
  // State for participant selection
  const [participantId, setParticipantId] = useState<number | null>(null);
  const { data: participants, isLoading: loadingParticipants } = useSWR('/api/participants', fetcher);
  const router = useRouter();
  const { data: players, isLoading } = useSWR('/api/player', fetcher);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const [manualNonSeeded, setManualNonSeeded] = useState<{ [key: number]: string }>({});

  // Steps: 0-3: male seed pools, 4: male non-seeded, 5: male outside-top-4
  // 6-9: female seed pools, 10: female non-seeded, 11: female outside-top-4
  const steps = [
    { gender: 'male', pool: seedPools[0] },
    { gender: 'male', pool: seedPools[1] },
    { gender: 'male', pool: seedPools[2] },
    { gender: 'male', pool: seedPools[3] },
    { gender: 'male', pool: null, type: 'non-seeded' },
    { gender: 'male', pool: null, type: 'outside-top-4' },
    { gender: 'female', pool: seedPools[0] },
    { gender: 'female', pool: seedPools[1] },
    { gender: 'female', pool: seedPools[2] },
    { gender: 'female', pool: seedPools[3] },
    { gender: 'female', pool: null, type: 'non-seeded' },
    { gender: 'female', pool: null, type: 'outside-top-4' },
  ];

  if (isLoading) return <div className="p-8">Loading players...</div>;
  if (!players) return <div className="p-8">No player data found.</div>;

  const current = step >= 0 && step < steps.length+1 ? steps[step] : null;
  let available: any[] = [];
  if (current) {
    if (current.pool) {
      available = filterPlayers(players, current.gender, current.pool.min, current.pool.max, true);
      available = available.filter(p => !Object.values(selected).find((s: any) => s?.id === p.id));
    } else if (current.type === 'non-seeded') {
      available = filterPlayers(players, current.gender, undefined, undefined, false);
      available = available.filter(p => !Object.values(selected).find((s: any) => s?.id === p.id));
    } else if (current.type === 'outside-top-4') {
      // Only seeded players with seed > 4
      available = players.filter((p: any) => p.gender === current.gender && typeof p.seed === 'number' && p.seed > 4);
      available = available.filter((p: any) => !Object.values(selected).find((s: any) => s?.id === p.id));
    }
  }

  function handleSelect(player: any) {
    setSelected({ ...selected, [step]: player });
    setError(null);
    setStep(step + 1);
    if (current && current.type === 'non-seeded') {
      setManualNonSeeded({ ...manualNonSeeded, [step]: '' });
    }
  }

  function handleBack() {
    setStep(Math.max(0, step - 1));
    setError(null);
  }

  async function handleSubmit() {
    // Validate participant selection
    if (!participantId) {
      setError('Please select a participant.');
      return;
    }
    // Validate seed sum for pools
    let maleSum = 0, femaleSum = 0;
    for (let i = 0; i < 4; i++) maleSum += selected[i]?.seed || 0;
    for (let i = 6; i < 10; i++) femaleSum += selected[i]?.seed || 0;
    if (maleSum < 60 || femaleSum < 60) {
      setError('Seed sum for pool picks must be 60 or over for both genders.');
      setStep(0);
      return;
    }
    // Prepare payload
    const teamPlayers = Object.entries(selected).map(([idx, p]: any) => {
      let role = 'seed-pool';
      if (steps[parseInt(idx)].type === 'non-seeded') role = 'non-seeded';
      if (steps[parseInt(idx)].type === 'outside-top-4') role = 'outside-top-4';
      // For manual picks, always include name and gender
      if (p.id < 0) {
        return {
          playerId: p.id,
          name: p.name,
          gender: p.gender,
          seed: p.seed ?? null,
          role
        };
      }
      return { playerId: p.id, role };
    });
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, players: teamPlayers }),
    });
    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create team');
    }
  }

  if (!current) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <nav className="mb-4 text-sm text-gray-600 flex items-center gap-2">
          <a href="/" className="hover:underline text-blue-600">Home</a>
          <span>/</span>
          <span className="font-semibold">Team Selection</span>
        </nav>
        <h1 className="text-2xl font-bold mb-6">Team selection complete!</h1>
        <div className="mt-8">
          <h2 className="font-bold mb-2">Your Picks:</h2>
          <ul className="list-disc pl-6">
            {Object.entries(selected).map(([idx, p]: any) => (
              <li key={idx}>{steps[parseInt(idx)].gender} - {p.name} (Seed: {p.seed ?? '—'})</li>
            ))}
          </ul>
          <button
            className={`mt-6 px-4 py-2 rounded text-white ${participantId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            onClick={handleSubmit}
            disabled={!participantId}
          >Submit Team</button>
          {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600 flex items-center gap-2">
        <a href="/" className="hover:underline text-blue-600">Home</a>
        <span>/</span>
        <span className="font-semibold">Team Selection</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">Select Your Fantasy Team</h1>
      <div className="mb-4">
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Select Participant:</label>
          {loadingParticipants ? (
            <div>Loading participants...</div>
          ) : participants && participants.length > 0 ? (
            <select
              className="border rounded p-2 w-full"
              value={participantId || ''}
              onChange={e => setParticipantId(Number(e.target.value))}
            >
              <option value="">-- Select Participant --</option>
              {participants.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <div>No participants found. Please register first.</div>
          )}
        </div>
        <div className="text-lg font-semibold">Step {step + 1} of 12</div>
        {current.pool && (
          <div className="mb-2">Pick a {current.gender} player from <span className="font-bold">{current.pool.label}</span></div>
        )}
        {current.type === 'non-seeded' && (
          <div className="mb-2">Pick a {current.gender} <span className="font-bold">non-seeded</span> player</div>
        )}
        {current.type === 'outside-top-4' && (
          <div className="mb-2">Pick a {current.gender} player <span className="font-bold">outside top 4 seeds</span></div>
        )}
      </div>
      {(current.type === 'non-seeded' || current.type === 'outside-top-4') ? (
        <div className="mb-6">
          <div className="mb-2">
            {current.type === 'non-seeded'
              ? `If your non-seeded player is not listed, type their name below:`
              : `Pick a seeded player with seed > 4 from the dropdown, or type any player name below:`}
          </div>
          {current.type === 'outside-top-4' && (
            <select
              className="border rounded p-2 w-full mb-2"
              value={manualNonSeeded[step] || ''}
              onChange={e => setManualNonSeeded({ ...manualNonSeeded, [step]: e.target.value })}
            >
              <option value="">Select a seeded player (seed &gt; 4)</option>
              {available.map(player => (
                <option key={player.id} value={player.name}>{player.name} (Seed: {player.seed})</option>
              ))}
            </select>
          )}
          <input
            type="text"
            className="border rounded p-2 w-full mb-2"
            placeholder={`Enter ${current.gender} ${current.type === 'non-seeded' ? 'non-seeded' : 'outside-top-4'} player name`}
            value={manualNonSeeded[step] || ''}
            onChange={e => setManualNonSeeded({ ...manualNonSeeded, [step]: e.target.value })}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              if (!manualNonSeeded[step] || manualNonSeeded[step].trim().length < 2) {
                setError('Please enter a valid player name.');
                return;
              }
              // If selected from dropdown, find player object
              let playerObj = null;
              if (current.type === 'outside-top-4') {
                playerObj = available.find(p => p.name === manualNonSeeded[step]);
              }
              if (playerObj) {
                handleSelect(playerObj);
              } else {
                // Always include gender for manual picks
                setSelected({ ...selected, [step]: { name: manualNonSeeded[step].trim(), gender: current.gender, seed: current.type === 'outside-top-4' ? 5 : null, id: -(step + 1) } });
                setError(null);
                setStep(step + 1);
              }
            }}
          >{current.type === 'non-seeded' ? 'Add Non-Seeded Player' : 'Add Outside-Top-4 Player'}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {available.map(player => (
            <button
              key={player.id}
              className="border rounded p-3 hover:bg-blue-50 flex flex-col items-start"
              onClick={() => handleSelect(player)}
            >
              <span className="font-semibold">{player.name}</span>
              <span className="text-sm text-gray-600">Seed: {player.seed ?? '—'}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        {step > 0 && step < 12 && (
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={handleBack}>Back</button>
        )}
        {step > 12 && (
          <button
            className={`px-4 py-2 rounded text-white ${participantId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            onClick={handleSubmit}
            disabled={!participantId}
          >Submit Team</button>
        )}
      </div>
      {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
      <div className="mt-8">
        <h2 className="font-bold mb-2">Your Picks:</h2>
        <ul className="list-disc pl-6">
          {Object.entries(selected).map(([idx, p]: any) => (
            <li key={idx}>{steps[parseInt(idx)].gender} - {p.name} (Seed: {p.seed ?? '—'})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
