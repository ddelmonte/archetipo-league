import { getAllTeamRosters, avatarUrl } from '@/lib/sleeper'
import { getTeamStats } from '@/lib/sheets'
import Link from 'next/link'
import { Users } from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function SquadrePage() {
  const [teamRosters, sheetStats] = await Promise.all([
    getAllTeamRosters(),
    getTeamStats(),
  ])

  // Mappa nome allenatore → stats Google Sheets
  const statsMap = Object.fromEntries(
    sheetStats.map(s => [s.name.toLowerCase(), s])
  )

  const confMap: Record<string, 'AFC' | 'NFC'> = {
    byzero: 'AFC', giangimirac: 'AFC', maggico80: 'AFC', simobpo: 'AFC', simocana: 'AFC',
    '49erspavia': 'NFC', falchettifurbetti: 'NFC', gabro: 'NFC', malmax: 'NFC', olinec78: 'NFC',
    fritzdagr8: 'AFC', leothking50: 'NFC',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-400" />
          Squadre
        </h1>
        <p className="text-slate-400 mt-1">Roster aggiornati in tempo reale da Sleeper · Stagione 2026</p>
      </div>

      {/* AFC */}
      {(['AFC', 'NFC'] as const).map(conf => (
        <section key={conf}>
          <h2 className={`text-lg font-bold mb-3 ${conf === 'AFC' ? 'text-red-400' : 'text-blue-400'}`}>
            {conf === 'AFC' ? '🔴' : '🔵'} Conference {conf}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamRosters
              .filter(t => {
                const c = confMap[t.user.display_name.toLowerCase()]
                return c === conf
              })
              .map(({ user, roster, players }) => {
                const stats = statsMap[user.display_name.toLowerCase()]
                const winPct = stats
                  ? ((stats.regularVinte / (stats.regularVinte + stats.regularPerse)) * 100).toFixed(0)
                  : null

                return (
                  <Link
                    key={user.user_id}
                    href={`/squadre/${user.display_name.toLowerCase()}`}
                    className="card hover:border-amber-500/50 hover:bg-slate-700/50 transition-all group"
                  >
                    {/* Header squadra */}
                    <div className="flex items-center gap-3 mb-4">
                      {user.avatar ? (
                        <Image
                          src={avatarUrl(user.avatar)}
                          alt={user.display_name}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-slate-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                          🏈
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-white group-hover:text-amber-400 transition-colors leading-tight">
                          {user.teamName}
                        </div>
                        <div className="text-slate-400 text-sm">{user.display_name}</div>
                      </div>
                    </div>

                    {/* Stats veloci */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-700 pt-3">
                      <div>
                        <div className="font-bold text-white">{players.length}</div>
                        <div className="text-slate-500">Giocatori</div>
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {stats ? `${stats.regularVinte}-${stats.regularPerse}` : '—'}
                        </div>
                        <div className="text-slate-500">W-L</div>
                      </div>
                      <div>
                        <div className="font-bold text-amber-400">{winPct ? `${winPct}%` : '—'}</div>
                        <div className="text-slate-500">Win%</div>
                      </div>
                    </div>

                    {/* Posizioni in roster */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.entries(
                        players.reduce((acc, p) => {
                          acc[p.position] = (acc[p.position] ?? 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .map(([pos, count]) => (
                          <span
                            key={pos}
                            className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                          >
                            {pos} ×{count}
                          </span>
                        ))}
                    </div>
                  </Link>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}
