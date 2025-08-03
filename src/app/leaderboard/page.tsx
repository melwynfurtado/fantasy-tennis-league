"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LeaderboardPage() {
  const { data: scores, isLoading } = useSWR('/api/score', fetcher);
  const { data: teams } = useSWR('/api/team', fetcher);
  const { data: participants } = useSWR('/api/participants', fetcher);
  const { data: players } = useSWR('/api/player', fetcher);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  // Create a mapping of participants
  const participantMap = participants?.reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {}) || {};

  // Create enhanced leaderboard data
  const enhancedScores = scores?.map((team: any) => {
    const participant = participantMap[team.participantId];
    return {
      ...team,
      participantName: participant?.name || `Participant ${team.participantId}`,
    };
  }).sort((a: any, b: any) => b.total - a.total) || [];

  // Get team details for selected team
  const getTeamDetails = (teamId: number) => {
    const team = teams?.find((t: any) => t.id === teamId);
    if (!team) return null;
    
    const teamPlayers = team.teamPlayers?.map((tp: any) => {
      const player = players?.find((p: any) => p.id === tp.playerId);
      return {
        ...tp,
        player: player || { name: 'Unknown Player', gender: 'Unknown', seed: null }
      };
    }) || [];
    
    return {
      ...team,
      players: teamPlayers
    };
  };

  const selectedTeamDetails = selectedTeam ? getTeamDetails(selectedTeam) : null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; Leaderboard
      </nav>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🏆 Fantasy Tennis Leaderboard</h1>
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading leaderboard...</span>
        </div>
      )}
      
      {!scores && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-600 text-lg">No teams or scores found.</p>
          <p className="text-sm text-gray-500 mt-2">Teams will appear here once participants create teams and match results are added.</p>
        </div>
      )}
      
      {enhancedScores && enhancedScores.length > 0 && (
        <div className="space-y-6">
          {/* Podium for top 3 */}
          {enhancedScores.length >= 3 && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200 mb-8">
              <h2 className="text-xl font-bold text-yellow-800 mb-4 text-center">🥇 Top 3 Teams 🥇</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {enhancedScores.slice(0, 3).map((team: any, index: number) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const bgColors = ['bg-yellow-200', 'bg-gray-200', 'bg-orange-200'];
                  return (
                    <div key={team.teamId} className={`${bgColors[index]} p-4 rounded-lg text-center`}>
                      <div className="text-2xl mb-2">{medals[index]}</div>
                      <div className="font-bold text-lg">{team.participantName}</div>
                      <div className="text-2xl font-bold text-gray-800">{team.total} pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Full leaderboard table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Complete Standings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scores by Round</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enhancedScores.map((team: any, index: number) => (
                    <tr key={team.teamId} className={`hover:bg-gray-50 ${
                      index < 3 ? 'bg-yellow-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team.participantName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-lg font-bold text-gray-900">{team.total}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(team.scores).map(([round, score]) => (
                            <span 
                              key={String(round)} 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              R{String(round)}: {String(score)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedTeam(selectedTeam === team.teamId ? null : team.teamId)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          {selectedTeam === team.teamId ? 'Hide Details' : 'View Team'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Team details modal/panel */}
          {selectedTeamDetails && (
            <div className="bg-white rounded-lg shadow-lg border p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Team Details: {participantMap[selectedTeamDetails.participantId]?.name || `Participant ${selectedTeamDetails.participantId}`}
                </h3>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Male players */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    👨 Male Players (6)
                  </h4>
                  <div className="space-y-2">
                    {selectedTeamDetails.players
                      .filter((tp: any) => tp.player.gender === 'male')
                      .map((tp: any, idx: number) => (
                        <div key={tp.id} className="bg-blue-50 p-3 rounded border">
                          <div className="font-medium">{tp.player.name}</div>
                          <div className="text-sm text-gray-600">
                            {tp.player.seed ? `Seed ${tp.player.seed}` : 'Non-seeded'} • {tp.role}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                {/* Female players */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    👩 Female Players (6)
                  </h4>
                  <div className="space-y-2">
                    {selectedTeamDetails.players
                      .filter((tp: any) => tp.player.gender === 'female')
                      .map((tp: any, idx: number) => (
                        <div key={tp.id} className="bg-pink-50 p-3 rounded border">
                          <div className="font-medium">{tp.player.name}</div>
                          <div className="text-sm text-gray-600">
                            {tp.player.seed ? `Seed ${tp.player.seed}` : 'Non-seeded'} • {tp.role}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
