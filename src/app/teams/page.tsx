"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TeamsPage() {
  const { data: teams, isLoading } = useSWR('/api/team', fetcher);
  const { data: participants } = useSWR('/api/participants', fetcher);
  const { data: players } = useSWR('/api/player', fetcher);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [filterBy, setFilterBy] = useState<string>('');

  // Create a mapping of participants and players
  const participantMap = participants?.reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {}) || {};

  const playerMap = players?.reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {}) || {};

  // Enhanced teams with participant and player details
  const enhancedTeams = teams?.map((team: any) => {
    const participant = participantMap[team.participantId];
    const teamPlayers = team.teamPlayers?.map((tp: any) => {
      const player = playerMap[tp.playerId];
      return {
        ...tp,
        player: player || { name: 'Unknown Player', gender: 'Unknown', seed: null }
      };
    }) || [];

    const maleSeeds = teamPlayers
      .filter((tp: any) => tp.player.gender === 'male' && tp.role === 'seed-pool')
      .map((tp: any) => tp.player.seed)
      .filter(Boolean);
    const femaleSeeds = teamPlayers
      .filter((tp: any) => tp.player.gender === 'female' && tp.role === 'seed-pool')
      .map((tp: any) => tp.player.seed)
      .filter(Boolean);

    return {
      ...team,
      participant,
      players: teamPlayers,
      maleCount: teamPlayers.filter((tp: any) => tp.player.gender === 'male').length,
      femaleCount: teamPlayers.filter((tp: any) => tp.player.gender === 'female').length,
      maleSeedSum: maleSeeds.reduce((sum: number, seed: number) => sum + seed, 0),
      femaleSeedSum: femaleSeeds.reduce((sum: number, seed: number) => sum + seed, 0),
      isValid: teamPlayers.length === 12
    };
  }) || [];

  // Filter teams
  const filteredTeams = enhancedTeams.filter((team: any) => {
    if (!filterBy) return true;
    if (filterBy === 'valid' && team.isValid) return true;
    if (filterBy === 'invalid' && !team.isValid) return true;
    if (filterBy === 'male' && team.participant?.gender === 'male') return true;
    if (filterBy === 'female' && team.participant?.gender === 'female') return true;
    return false;
  });

  const getTeamValidationStatus = (team: any) => {
    const issues = [];
    if (team.maleCount !== 6) issues.push(`${team.maleCount} male players (need 6)`);
    if (team.femaleCount !== 6) issues.push(`${team.femaleCount} female players (need 6)`);
    if (team.maleSeedSum < 60) issues.push(`Male seed sum: ${team.maleSeedSum} (need ≥60)`);
    if (team.femaleSeedSum < 60) issues.push(`Female seed sum: ${team.femaleSeedSum} (need ≥60)`);
    
    // Check for required roles
    const maleRoles = team.players.filter((p: any) => p.player.gender === 'male').map((p: any) => p.role);
    const femaleRoles = team.players.filter((p: any) => p.player.gender === 'female').map((p: any) => p.role);
    
    const requiredRoles = ['seed-pool', 'non-seeded', 'outside-top-4'];
    const maleSeedPools = maleRoles.filter((role: string) => role === 'seed-pool').length;
    const femaleSeedPools = femaleRoles.filter((role: string) => role === 'seed-pool').length;
    
    if (maleSeedPools !== 4) issues.push(`Male seed pools: ${maleSeedPools} (need 4)`);
    if (femaleSeedPools !== 4) issues.push(`Female seed pools: ${femaleSeedPools} (need 4)`);
    
    return issues;
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link> &gt; Teams
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Fantasy Teams</h1>
        <Link 
          href="/team" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Create New Team
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{enhancedTeams.length}</div>
          <div className="text-sm text-gray-600">Total Teams</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-green-600">
            {enhancedTeams.filter((t: any) => t.isValid).length}
          </div>
          <div className="text-sm text-gray-600">Valid Teams</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {enhancedTeams.filter((t: any) => !t.isValid).length}
          </div>
          <div className="text-sm text-gray-600">Invalid Teams</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-2xl font-bold text-purple-600">
            {enhancedTeams.reduce((sum: number, t: any) => sum + t.players.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Players</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Teams:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">All Teams</option>
            <option value="valid">Valid Teams Only</option>
            <option value="invalid">Invalid Teams Only</option>
            <option value="male">Male Participants</option>
            <option value="female">Female Participants</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => setFilterBy('')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading teams...</span>
        </div>
      )}

      {!teams && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-600 text-lg">No teams found.</p>
          <p className="text-sm text-gray-500 mt-2">Teams will appear here once participants create them.</p>
          <Link 
            href="/team" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Create First Team
          </Link>
        </div>
      )}

      {filteredTeams && filteredTeams.length > 0 && (
        <div className="space-y-4">
          {filteredTeams.map((team: any) => {
            const validationIssues = getTeamValidationStatus(team);
            const isValid = validationIssues.length === 0;
            
            return (
              <div key={team.id} className={`bg-white rounded-lg shadow border-l-4 ${
                isValid ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {team.participant?.name || `Participant ${team.participantId}`}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isValid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isValid ? '✓ Valid' : '✗ Invalid'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {team.participant?.gender || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-800">{team.maleCount}</div>
                          <div className="text-xs text-blue-600">Male Players</div>
                        </div>
                        <div className="text-center p-2 bg-pink-50 rounded">
                          <div className="font-semibold text-pink-800">{team.femaleCount}</div>
                          <div className="text-xs text-pink-600">Female Players</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold text-purple-800">{team.maleSeedSum}</div>
                          <div className="text-xs text-purple-600">Male Seed Sum</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-800">{team.femaleSeedSum}</div>
                          <div className="text-xs text-green-600">Female Seed Sum</div>
                        </div>
                      </div>
                      
                      {!isValid && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                          <div className="text-sm font-medium text-red-800 mb-1">Validation Issues:</div>
                          <ul className="text-sm text-red-700 list-disc list-inside">
                            {validationIssues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        {selectedTeam === team.id ? 'Hide Players' : 'View Players'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Team players details */}
                  {selectedTeam === team.id && (
                    <div className="mt-6 border-t pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Male players */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            👨 Male Players ({team.maleCount}/6)
                          </h4>
                          <div className="space-y-2">
                            {team.players
                              .filter((tp: any) => tp.player.gender === 'male')
                              .map((tp: any) => (
                                <div key={tp.id} className="bg-blue-50 p-3 rounded border">
                                  <div className="font-medium">{tp.player.name}</div>
                                  <div className="text-sm text-gray-600 flex justify-between">
                                    <span>{tp.player.seed ? `Seed ${tp.player.seed}` : 'Non-seeded'}</span>
                                    <span className="font-medium text-blue-700">{tp.role}</span>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                        
                        {/* Female players */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            👩 Female Players ({team.femaleCount}/6)
                          </h4>
                          <div className="space-y-2">
                            {team.players
                              .filter((tp: any) => tp.player.gender === 'female')
                              .map((tp: any) => (
                                <div key={tp.id} className="bg-pink-50 p-3 rounded border">
                                  <div className="font-medium">{tp.player.name}</div>
                                  <div className="text-sm text-gray-600 flex justify-between">
                                    <span>{tp.player.seed ? `Seed ${tp.player.seed}` : 'Non-seeded'}</span>
                                    <span className="font-medium text-pink-700">{tp.role}</span>
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
              </div>
            );
          })}
        </div>
      )}
      
      {filteredTeams && filteredTeams.length === 0 && teams && teams.length > 0 && (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-600 text-lg">No teams match the current filter.</p>
          <button
            onClick={() => setFilterBy('')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
