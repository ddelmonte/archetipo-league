import { getHeadToHead } from '@/lib/sheets'
import { Swords } from 'lucide-react'
import clsx from 'clsx'

export default async function RivalitaPage() {
  const { teams, records } = await getHeadToHead()

  // Calcola la "rivalità più accesa" (partite totali)
  const bestRivalries: { t1: string; t2: string; total: number; diff: number }[] = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const t1 = teams[i], t2 = teams[j]
      const r1 = records[t1]?.[t2]
      if (!r1) continue
      const total = r1.wins + r1.losses
      const diff = Math.abs(r1.wins - r1.losses)
      bestRivalries.push({ t1, t2, total, diff })
    }
  }
  bestRivalries.sort((a, b) => b.total - a.total || a.diff - b.diff)

  function cellColor(wins: number, losses: number) {
    if (wins === 0 && losses === 0) return 'bg-slate-700/20 text-slate-600'
    if (wins > losses) return 'bg-green-900/40 text-green-400'
    if (wins < losses) return 'bg-red-900/40 text-red-400'
    return 'bg-slate-700/40 text-slate-300'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Swords className="w-8 h-8 text-amber-400" />
          Rivalità
        </h1>
        <p className="text-slate-400 mt-1">
          Scontri diretti in regular season. <span className="text-green-400">Verde</span> = bilancio positivo,{' '}
          <span className="text-red-400">Rosso</span> = bilancio negativo.
        </p>
      </div>

      {/* Top rivalità */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">🔥 Rivalità più calde</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bestRivalries.slice(0, 6).map(({ t1, t2, total }) => {
            const r = records[t1]?.[t2]
            if (!r) return null
            const { wins, losses } = r
            const leader = wins > losses ? t1 : losses > wins ? t2 : null
            return (
              <div key={`${t1}-${t2}`} className="card text-center">
                <div className="text-xs text-slate-500 mb-2">{total} partite giocate</div>
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex-1 font-bold text-sm ${wins >= losses ? 'text-white' : 'text-slate-400'}`}>{t1}</div>
                  <div className="text-xl font-extrabold text-amber-400 font-mono">{wins}–{losses}</div>
                  <div className={`flex-1 font-bold text-sm text-right ${losses >= wins ? 'text-white' : 'text-slate-400'}`}>{t2}</div>
                </div>
                {leader && (
                  <div className="text-xs text-slate-500 mt-2">In vantaggio: <span className="text-amber-400">{leader}</span></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Matrice completa */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Matrice Head-to-Head</h2>
        <p className="text-xs text-slate-500 mb-4">Ogni cella mostra V-S dalla prospettiva della riga</p>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-400 font-semibold sticky left-0 bg-slate-800 min-w-[130px]">vs →</th>
                {teams.map(t => (
                  <th key={t} className="p-2 text-center text-slate-400 font-semibold min-w-[72px]">
                    <div className="truncate max-w-[72px]" title={t}>{t}</div>
                  </th>
                ))}
                <th className="p-2 text-center text-white font-semibold bg-slate-700/50 min-w-[60px]">W–L</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => {
                const row = records[team] ?? {}
                let totalW = 0, totalL = 0
                teams.forEach(opp => {
                  if (opp !== team && row[opp]) {
                    totalW += row[opp].wins
                    totalL += row[opp].losses
                  }
                })
                return (
                  <tr key={team} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="p-3 font-bold text-white sticky left-0 bg-slate-800">{team}</td>
                    {teams.map(opp => {
                      if (opp === team) {
                        return <td key={opp} className="p-2 text-center text-slate-700">—</td>
                      }
                      const r = row[opp]
                      if (!r) return <td key={opp} className="p-2 text-center text-slate-600">–</td>
                      return (
                        <td key={opp} className={clsx('p-2 text-center font-mono font-bold rounded-sm', cellColor(r.wins, r.losses))}>
                          {r.wins}–{r.losses}
                        </td>
                      )
                    })}
                    <td className="p-2 text-center font-mono font-bold text-white bg-slate-700/30">
                      {totalW}–{totalL}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
