import { getSeasonRecords } from '@/lib/sheets'
import { Trophy, Zap, Shield } from 'lucide-react'

export default async function AlboDOroPage() {
  const seasons = await getSeasonRecords()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          Albo d&apos;oro
        </h1>
        <p className="text-slate-400 mt-1">La storia della Archetipo League stagione per stagione</p>
      </div>

      <div className="space-y-4">
        {seasons.map((s) => (
          <div
            key={s.year}
            className="card border-l-4 border-amber-500 hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-amber-400 font-bold text-lg">Stagione {s.year}</span>
              {s.bestAttackTeam && (
                <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/30 border border-green-800 px-3 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  Miglior attacco: {s.bestAttackTeam}
                  {s.bestAttackPoints > 0 && ` (${s.bestAttackPoints.toLocaleString('it-IT', { minimumFractionDigits: 2 })} pt)`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Podio Super Bowl */}
              <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-3xl mb-1">🥇</div>
                  <div className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Campione</div>
                  <div className="font-extrabold text-white text-lg leading-tight">{s.superBowlWinner}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🥈</div>
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Finalista</div>
                  <div className="font-bold text-slate-300 leading-tight">{s.superBowlRunnerUp}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🥉</div>
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">3° posto</div>
                  <div className="font-bold text-slate-300 leading-tight">{s.thirdPlace}</div>
                </div>
              </div>

              {/* Conference Champions */}
              <div className="flex flex-col gap-2">
                {s.conferenceChamp1 && (
                  <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                    <Shield className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <div className="text-xs text-red-400 font-semibold">AFC Champ</div>
                      <div className="text-white text-sm font-bold">
                        {s.conferenceChamp1}
                        {s.conferenceChamp1Record && (
                          <span className="text-slate-400 font-normal ml-1">· {s.conferenceChamp1Record}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {s.conferenceChamp2 && (
                  <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                    <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs text-blue-400 font-semibold">NFC Champ</div>
                      <div className="text-white text-sm font-bold">
                        {s.conferenceChamp2}
                        {s.conferenceChamp2Record && (
                          <span className="text-slate-400 font-normal ml-1">· {s.conferenceChamp2Record}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
