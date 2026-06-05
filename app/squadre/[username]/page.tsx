import { getTeamRoster, avatarUrl } from '@/lib/sleeper'
import { getTeamStats } from '@/lib/sheets'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Trophy, Star } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

export const dynamic = 'force-dynamic'

const positionColor: Record<string, string> = {
  QB:  'bg-red-900/50 text-red-300 border-red-800',
  RB:  'bg-green-900/50 text-green-300 border-green-800',
  WR:  'bg-blue-900/50 text-blue-300 border-blue-800',
  TE:  'bg-orange-900/50 text-orange-300 border-orange-800',
  K:   'bg-purple-900/50 text-purple-300 border-purple-800',
  DL:  'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  LB:  'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  DB:  'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  DEF: 'bg-slate-700 text-slate-300 border-slate-600',
}

const positionOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DL', 'LB', 'DB', 'DEF', 'IDP_FLEX']

const injuryColor: Record<string, string> = {
  Out:           'text-red-400',
  Doubtful:      'text-orange-400',
  Questionable:  'text-yellow-400',
  IR:            'text-red-500',
}

export default async function TeamPage({ params }: { params: { username: string } }) {
  const [teamData, allStats] = await Promise.all([
    getTeamRoster(params.username),
    getTeamStats(),
  ])

  if (!teamData) notFound()

  const { user, roster, players } = teamData
  const stats = allStats.find(s => s.name.toLowerCase() === user.display_name.toLowerCase())

  // Raggruppa per posizione
  const playersByPos: Record<string, typeof players> = {}
  for (const p of players) {
    const pos = p.position ?? 'OTHER'
    if (!playersByPos[pos]) playersByPos[pos] = []
    playersByPos[pos].push(p)
  }
  const sortedPositions = [
    ...positionOrder.filter(p => playersByPos[p]),
    ...Object.keys(playersByPos).filter(p => !positionOrder.includes(p)),
  ]

  // Identifica starter vs panchina vs taxi
  const starterIds = new Set(roster.starters ?? [])
  const taxiIds = new Set(roster.taxi ?? [])
  const reserveIds = new Set(roster.reserve ?? [])

  function playerLabel(id: string) {
    if (taxiIds.has(id)) return { label: 'TAXI', cls: 'bg-amber-900/40 text-amber-400 border-amber-800' }
    if (reserveIds.has(id)) return { label: 'IR', cls: 'bg-red-900/40 text-red-400 border-red-800' }
    if (starterIds.has(id)) return { label: 'STARTER', cls: 'bg-green-900/40 text-green-400 border-green-800' }
    return { label: 'BENCH', cls: 'bg-slate-700 text-slate-400 border-slate-600' }
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/squadre" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-fit">
        <ArrowLeft className="w-4 h-4" /> Tutte le squadre
      </Link>

      {/* Header squadra */}
      <div className="card bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex items-start gap-5">
          {user.avatar ? (
            <Image
              src={avatarUrl(user.avatar)}
              alt={user.display_name}
              width={80}
              height={80}
              className="rounded-full border-2 border-amber-500/50 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-4xl shrink-0">
              🏈
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {user.teamName}
            </h1>
            <p className="text-amber-400 font-semibold mt-1">{user.display_name}</p>
            <p className="text-slate-500 text-sm mt-1">Stagione 2026 · {players.length} giocatori in rosa</p>
          </div>
        </div>

        {/* Stats storiche */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-amber-400">{stats.superBowlVinti}</div>
              <div className="text-slate-400 text-xs mt-1">Super Bowl 🏆</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">{stats.regularVinte}-{stats.regularPerse}</div>
              <div className="text-slate-400 text-xs mt-1">Record Regular</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">
                {((stats.regularVinte / (stats.regularVinte + stats.regularPerse)) * 100).toFixed(1)}%
              </div>
              <div className="text-slate-400 text-xs mt-1">Win %</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">{stats.mvpGiornata}</div>
              <div className="text-slate-400 text-xs mt-1">MVP ⭐</div>
            </div>
          </div>
        )}

        {/* Trofei */}
        {stats && (stats.superBowlVinti > 0 || stats.conferenceVinti > 0 || stats.archettrophy > 0) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from({ length: stats.superBowlVinti }).map((_, i) => (
              <span key={`sb-${i}`} className="flex items-center gap-1 text-xs bg-amber-900/30 text-amber-400 border border-amber-700 px-2 py-1 rounded-full">
                <Trophy className="w-3 h-3" /> Super Bowl
              </span>
            ))}
            {Array.from({ length: stats.conferenceVinti }).map((_, i) => (
              <span key={`conf-${i}`} className="flex items-center gap-1 text-xs bg-blue-900/30 text-blue-400 border border-blue-700 px-2 py-1 rounded-full">
                🛡️ Conference
              </span>
            ))}
            {Array.from({ length: stats.archettrophy }).map((_, i) => (
              <span key={`arch-${i}`} className="flex items-center gap-1 text-xs bg-green-900/30 text-green-400 border border-green-700 px-2 py-1 rounded-full">
                <Star className="w-3 h-3" /> Archetipo Trophy
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Roster per posizione */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Rosa completa</h2>

        {sortedPositions.map(pos => (
          <div key={pos}>
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx('text-xs font-bold px-2 py-0.5 rounded border', positionColor[pos] ?? 'bg-slate-700 text-slate-300 border-slate-600')}>
                {pos}
              </span>
              <span className="text-slate-500 text-xs">{playersByPos[pos].length} giocatori</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {playersByPos[pos]
                .sort((a, b) => {
                  // Starter prima
                  const aIsStarter = starterIds.has(a.player_id) ? 0 : 1
                  const bIsStarter = starterIds.has(b.player_id) ? 0 : 1
                  return aIsStarter - bIsStarter
                })
                .map(player => {
                  const { label, cls } = playerLabel(player.player_id)
                  return (
                    <div
                      key={player.player_id}
                      className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700"
                    >
                      <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded border shrink-0', cls)}>
                        {label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm truncate">{player.full_name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1">
                          <span>{player.team ?? 'FA'}</span>
                          {player.age && <span>· {player.age} anni</span>}
                          {player.years_exp !== null && player.years_exp === 0 && (
                            <span className="text-green-500">· Rookie</span>
                          )}
                        </div>
                      </div>
                      {player.injury_status && (
                        <span className={clsx('text-xs font-semibold shrink-0', injuryColor[player.injury_status] ?? 'text-slate-400')}>
                          {player.injury_status}
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
