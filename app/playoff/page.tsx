import { getPlayoffHeadToHead } from '@/lib/sheets'
import clsx from 'clsx'

export default async function PlayoffPage() {
  const { teams, data } = await getPlayoffHeadToHead()

  // Ordina per vittorie totali decrescenti
  const sorted = [...data].sort((a, b) => b.totalW - a.totalW || b.diff - a.diff)

  function cellColor(wins: number, losses: number) {
    if (wins === 0 && losses === 0) return 'text-slate-600'
    if (wins > losses) return 'bg-green-900/40 text-green-400'
    if (wins < losses) return 'bg-red-900/40 text-red-400'
    return 'bg-slate-700/40 text-slate-300'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          🏟️ Playoff
        </h1>
        <p className="text-slate-400 mt-1">
          Scontri diretti in playoff. <span className="text-green-400">Verde</span> = bilancio positivo,{' '}
          <span className="text-red-400">Rosso</span> = negativo.
        </p>
      </div>

      {/* Standings playoff */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3">📋 Standings Playoff All-Time</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Allenatore</th>
                <th className="text-center p-4">Conf</th>
                <th className="text-center p-4">V</th>
                <th className="text-center p-4">S</th>
                <th className="text-center p-4">Tot</th>
                <th className="text-center p-4">Diff</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr key={t.name} className={clsx(
                  'border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors',
                  i === 0 && t.totalW > 0 && 'bg-amber-900/10'
                )}>
                  <td className="p-4 text-slate-400 font-mono">{i + 1}</td>
                  <td className="p-4 font-semibold text-white">
                    {i === 0 && t.totalW > 0 && '👑 '}{t.name}
                  </td>
                  <td className="p-4 text-center">
                    <span className={t.conference === 'AFC' ? 'badge-afc' : 'badge-nfc'}>
                      {t.conference}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-green-400">{t.totalW}</td>
                  <td className="p-4 text-center font-bold text-red-400">{t.totalL}</td>
                  <td className="p-4 text-center text-slate-300">{t.tot}</td>
                  <td className={clsx(
                    'p-4 text-center font-bold',
                    t.diff > 0 ? 'text-green-400' : t.diff < 0 ? 'text-red-400' : 'text-slate-400'
                  )}>
                    {t.diff > 0 ? `+${t.diff}` : t.diff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Matrice head-to-head playoff */}
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Matrice Head-to-Head Playoff</h2>
        <p className="text-xs text-slate-500 mb-4">Ogni cella mostra V-S dalla prospettiva della riga · Solo partite di playoff</p>
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
              {data.map(team => (
                <tr key={team.name} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="p-3 font-bold text-white sticky left-0 bg-slate-800">{team.name}</td>
                  {teams.map(opp => {
                    if (opp === team.name) {
                      return <td key={opp} className="p-2 text-center text-slate-700">—</td>
                    }
                    const r = team.vs[opp]
                    if (!r || (r.wins === 0 && r.losses === 0)) {
                      return <td key={opp} className="p-2 text-center text-slate-600">–</td>
                    }
                    return (
                      <td key={opp} className={clsx(
                        'p-2 text-center font-mono font-bold rounded-sm',
                        cellColor(r.wins, r.losses)
                      )}>
                        {r.wins}–{r.losses}
                      </td>
                    )
                  })}
                  <td className="p-2 text-center font-mono font-bold text-white bg-slate-700/30">
                    {team.totalW}–{team.totalL}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
