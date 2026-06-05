import { getTeamStats } from '@/lib/sheets'

function TrophyIcon({ count, type }: { count: number; type: string }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xl">{type}</span>
      {count > 1 && (
        <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded">×{count}</span>
      )}
    </div>
  )
}

export default async function TrofeiPage() {
  const teams = await getTeamStats()

  const sorted = [...teams].sort((a, b) => {
    const scoreA = a.superBowlVinti * 10 + a.superBowlGiocati * 5 + a.conferenceVinti * 3 + a.archettrophy
    const scoreB = b.superBowlVinti * 10 + b.superBowlGiocati * 5 + b.conferenceVinti * 3 + b.archettrophy
    return scoreB - scoreA
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          ⭐ Bacheca Trofei
        </h1>
        <p className="text-slate-400 mt-1">Il palmares di ogni allenatore nella storia della lega</p>
      </div>

      {/* Leggenda */}
      <div className="card flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2"><span className="text-xl">🏆</span> <span className="text-slate-300">Super Bowl vinto</span></span>
        <span className="flex items-center gap-2"><span className="text-xl">🥈</span> <span className="text-slate-300">Finalista Super Bowl</span></span>
        <span className="flex items-center gap-2"><span className="text-xl">🛡️</span> <span className="text-slate-300">Conference Champion</span></span>
        <span className="flex items-center gap-2"><span className="text-xl">⚡</span> <span className="text-slate-300">Archetipo Trophy (miglior attacco)</span></span>
        <span className="flex items-center gap-2"><span className="text-xl">⭐</span> <span className="text-slate-300">MVP di Giornata</span></span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((t, i) => {
          const totalTrophies = t.superBowlVinti + (t.superBowlGiocati - t.superBowlVinti) + t.conferenceVinti + t.archettrophy
          const runnerUps = t.superBowlGiocati - t.superBowlVinti

          return (
            <div
              key={t.name}
              className={`card relative overflow-hidden transition-all hover:border-amber-500/50 ${
                i === 0 ? 'border-amber-500 bg-gradient-to-br from-amber-900/20 to-slate-800' : ''
              }`}
            >
              {/* Rank badge */}
              <div className="absolute top-4 right-4 text-slate-600 font-bold text-2xl">#{i + 1}</div>

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <div className="font-extrabold text-white text-lg">{t.name}</div>
                  <span className={t.conference === 'AFC' ? 'badge-afc' : 'badge-nfc'}>{t.conference}</span>
                </div>
              </div>

              {/* Trofei */}
              <div className="flex flex-wrap gap-3 min-h-8 mb-4">
                <TrophyIcon count={t.superBowlVinti} type="🏆" />
                <TrophyIcon count={runnerUps} type="🥈" />
                <TrophyIcon count={t.conferenceVinti} type="🛡️" />
                <TrophyIcon count={t.archettrophy} type="⚡" />
                {totalTrophies === 0 && (
                  <span className="text-slate-600 text-sm italic">Nessun trofeo... ancora!</span>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-slate-700 pt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-white font-bold">{t.superBowlVinti}</div>
                  <div className="text-slate-500">SB vinti</div>
                </div>
                <div>
                  <div className="text-white font-bold">{t.mvpGiornata}</div>
                  <div className="text-slate-500">MVP ⭐</div>
                </div>
                <div>
                  <div className="text-white font-bold">{t.regularVinte}-{t.regularPerse}</div>
                  <div className="text-slate-500">Regular</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
