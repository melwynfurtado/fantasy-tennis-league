"use client";

import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPage() {
  const { data: participants } = useSWR('/api/participants', fetcher);
  const { data: players } = useSWR('/api/player', fetcher);
  const { data: teams } = useSWR('/api/team', fetcher);
  const { data: matchResults } = useSWR('/api/matchResult', fetcher);

  const stats = {
    participants: participants?.length || 0,
    players: players?.length || 0,
    teams: teams?.length || 0,
    matchResults: matchResults?.length || 0,
    seededPlayers: players?.filter((p: any) => p.seed).length || 0,
    nonSeededPlayers: players?.filter((p: any) => !p.seed).length || 0,
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; Admin
      </nav>
      
      <h1 className="text-4xl font-bold mb-6 text-gray-800">🔧 Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.participants}</div>
          <div className="text-sm text-gray-600">Participants</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-green-600">{stats.players}</div>
          <div className="text-sm text-gray-600">Players</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.teams}</div>
          <div className="text-sm text-gray-600">Teams</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.matchResults}</div>
          <div className="text-sm text-gray-600">Match Results</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.seededPlayers}</div>
          <div className="text-sm text-gray-600">Seeded</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.nonSeededPlayers}</div>
          <div className="text-sm text-gray-600">Non-seeded</div>
        </div>
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Player Management */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              🎾 Player Management
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Manage the player database, including adding new players, editing seedings, and organizing player pools.
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/players" 
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
              >
                Manage Players
              </Link>
              <Link 
                href="/players" 
                className="block w-full px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-center"
              >
                View Player Pool
              </Link>
            </div>
          </div>
        </div>

        {/* Participant Management */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              👥 Participant Management
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Add, edit, and manage league participants. View participant details and their team status.
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/participants" 
                className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-center"
              >
                Manage Participants
              </Link>
              <Link 
                href="/participants" 
                className="block w-full px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-center"
              >
                Register New
              </Link>
            </div>
          </div>
        </div>

        {/* Team Management */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              ⚡ Team Management
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Review and manage all fantasy teams. Validate team compositions and monitor compliance.
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/teams" 
                className="block w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-center"
              >
                Manage Teams
              </Link>
              <Link 
                href="/teams" 
                className="block w-full px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-center"
              >
                View All Teams
              </Link>
            </div>
          </div>
        </div>

        {/* Tournament Management */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              🏆 Tournament Management
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Manage tournament rounds, advance players, and apply bonus point rules automatically.
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/tournament" 
                className="block w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-center"
              >
                Tournament Control
              </Link>
              <Link 
                href="/matchResult" 
                className="block w-full px-4 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition text-center"
              >
                Add Match Results
              </Link>
            </div>
          </div>
        </div>

        {/* Scoring & Results */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              📊 Scoring & Results
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Monitor match results, scoring calculations, and review the current leaderboard standings.
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/results" 
                className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-center"
              >
                Manage Results
              </Link>
              <Link 
                href="/leaderboard" 
                className="block w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-center"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* System Tools */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              🛠️ System Tools
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Database management, bulk operations, and system utilities for league administration.
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/tools" 
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-center"
              >
                System Tools
              </Link>
              <div className="text-xs text-gray-500 text-center mt-2">
                Bulk imports, data export, system maintenance
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Link 
            href="/participants"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center text-sm"
          >
            + Add Participant
          </Link>
          <Link 
            href="/admin/players"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-center text-sm"
          >
            + Add Player
          </Link>
          <Link 
            href="/matchResult"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-center text-sm"
          >
            + Add Match Result
          </Link>
          <Link 
            href="/leaderboard"
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-center text-sm"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
