"use client";
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data: participants } = useSWR('/api/participants', fetcher);
  const { data: players } = useSWR('/api/player', fetcher);
  const { data: teams } = useSWR('/api/team', fetcher);
  const { data: scores } = useSWR('/api/score', fetcher);

  // Calculate stats
  const stats = {
    participants: participants?.length || 0,
    players: players?.length || 0,
    teams: teams?.length || 0,
    maleSeeded: players?.filter((p: any) => p.gender === 'male' && p.seed).length || 0,
    femaleSeeded: players?.filter((p: any) => p.gender === 'female' && p.seed).length || 0,
    maleNonSeeded: players?.filter((p: any) => p.gender === 'male' && !p.seed).length || 0,
    femaleNonSeeded: players?.filter((p: any) => p.gender === 'female' && !p.seed).length || 0,
  };

  const topTeam = scores?.[0];
  const participantMap = participants?.reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {}) || {};

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 tracking-tight">
              🎾 Fantasy Tennis League
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build your dream team with Wimbledon 2025 players, track match results, and compete for the championship!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">League Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.participants}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.teams}</div>
              <div className="text-sm text-gray-600">Teams Created</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.players}</div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.maleSeeded + stats.femaleSeeded}
              </div>
              <div className="text-sm text-gray-600">Seeded Players</div>
            </div>
          </div>
        </div>

        {/* Current Leader */}
        {topTeam && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">🏆 Current Leader</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {participantMap[topTeam.participantId]?.name || `Participant ${topTeam.participantId}`}
                </div>
                <div className="text-sm text-yellow-700">
                  Leading with {topTeam.total} points
                </div>
              </div>
              <Link 
                href="/leaderboard" 
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Main Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/participants" 
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Register Participant</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Add new participants to join the fantasy league competition.
                </p>
              </Link>

              <Link 
                href="/team" 
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Create Team</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Build your fantasy team with 12 players following league rules.
                </p>
              </Link>

              <Link 
                href="/matchResult" 
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Add Match Result</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Record match results and calculate points using tournament scoring.
                </p>
              </Link>

              <Link 
                href="/leaderboard" 
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Leaderboard</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  View rankings and see how teams are performing in the league.
                </p>
              </Link>
            </div>
          </div>

          {/* Secondary Actions & Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Resources</h2>
            <div className="space-y-4">
              <Link 
                href="/players" 
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 block group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition">
                    <span className="text-lg">🎾</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">Player Pool</h3>
                    <p className="text-sm text-gray-600">Browse Wimbledon 2025 players</p>
                  </div>
                </div>
              </Link>

              {/* Team Building Rules */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-800 mb-2">📋 Team Rules</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 12 players total (6 men, 6 women)</li>
                  <li>• 1 player from each seed pool (1-7, 8-15, 16-23, 24-32)</li>
                  <li>• Seed sum must be ≥60 for each gender</li>
                  <li>• 1 non-seeded + 1 outside top-4 per gender</li>
                </ul>
              </div>

              {/* Scoring System */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">⭐ Scoring</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>Men:</strong> 3-0(5pts), 3-1(4pts), 3-2(3pts)</div>
                  <div><strong>Women:</strong> 2-0(5pts), 2-1(3pts)</div>
                  <div><strong>Bonus:</strong> Double points in later rounds</div>
                </div>
              </div>

              {/* Player Distribution */}
              {players && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">🎯 Player Stats</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>Male: {stats.maleSeeded} seeded, {stats.maleNonSeeded} non-seeded</div>
                    <div>Female: {stats.femaleSeeded} seeded, {stats.femaleNonSeeded} non-seeded</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white/90 backdrop-blur border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Fantasy Tennis League. Built for Wimbledon 2025.</p>
          <p className="mt-1">Featuring real player seedings and tournament scoring system.</p>
        </div>
      </footer>
    </main>
  );
}
