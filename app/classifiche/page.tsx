import { getTeamStats, getPointsHistory } from '@/lib/sheets'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

export default async function ClassifichePage() {
  const [teams, history] = await Promise.all([getTeamStats(), getPointsHistory()])

  const sorted = [...teams].sort((a, b) => b.regularVinte - a.regularVinte || b.puntiFatti - a.puntiFatti)
  const pointsSorted = [...history].sort((a, b) => b.totalPF - a.totalPF)

  const years = [2025, 2024, 2023, 2022]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-amber-400" />
          Classifiche
        </h1>
        <p className="text-slate-400 mt-1">Standings general season e storico punti all-time</p>
      </div>

      {/* Standings */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">📋 Standings All-Time (Regular Season)</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Allenatore</th>
                <th className="text-center p-4">Conf</th>
                <th className="text-center p-4">V</th>
                <th className="text-center p-4">S</th>
                <th className="text-center p-4 hidden sm:table-cell">W%</th>
                <th className="text-right p-4">PF</th>
                <th className="text-right p-4 hidden md:table-cell">PA</th>
                <th className="text-right p-4 hidden md:table-cell">Diff</th>
                <th className="text-center p-4 hidden lg:table-cell">SB 🏆</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const total = t.regularVinte + t.regularPerse
                const winPct = total > 0 ? ((t.regularVinte / total) * 100).toFixed(1) : '0.0'
                const diff = t.puntiFatti - t.puntiSubiti

                return (
                  <tr key={t.name} className={clsx(
                    'border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors',
                    i === 0 && 'bg-amber-900/10'
                  )}>
                    <td className="p-4 text-slate-400 font-mono text-sm">{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        {i === 0 && '👑 '}
                        {t.name}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={t.conference === 'AFC' ? 'badge-afc' : 'badge-nfc'}>{t.conference}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-green-400">{t.regularVinte}</td>
                    <td className="p-4 text-center font-bold text-red-400">{t.regularPerse}</td>
                    <td className="p-4 text-center text-slate-300 hidden sm:table-cell">{winPct}%</td>
                    <td className="p-4 text-right font-mono font-bold text-amber-400">
                      {t.puntiFatti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400 hidden md:table-cell">
                      {t.puntiSubiti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={clsx(
                      'p-4 text-right font-mono font-bold hidden md:table-cell',
                      diff >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {diff >= 0 ? '+' : ''}{diff.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center hidden lg:table-cell">
                      {t.superBowlVinti > 0
                        ? Array.from({ length: t.superBowlVinti }).map((_, idx) => <span key={idx}>🏆</span>)
                        : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Punti per stagione */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">📈 Punti Fatti per Stagione</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left p-4 sticky left-0 bg-slate-800">#</th>
                <th className="text-left p-4 sticky left-8 bg-slate-800">Allenatore</th>
                {years.map(y => (
                  <th key={y} className="text-right p-4 min-w-[110px]">{y}</th>
                ))}
                <th className="text-right p-4 bg-slate-700/30 min-w-[120px]">TOT PF</th>
              </tr>
            </thead>
            <tbody>
              {pointsSorted.map((t, i) => (
                <tr key={t.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-4 text-slate-400 sticky left-0 bg-slate-800">{i + 1}</td>
                  <td className="p-4 font-semibold text-white sticky left-8 bg-slate-800">
                    <div className="flex items-center gap-2">
                      {t.name}
                      <span className={t.conference === 'AFC' ? 'badge-afc' : 'badge-nfc'}>{t.conference}</span>
                    </div>
                  </td>
                  {years.map(year => {
                    const yr = t.byYear.find(y => y.year === year)
                    return (
                      <td key={year} className="p-4 text-right font-mono text-slate-300">
                        {yr ? yr.pf.toLocaleString('it-IT', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                    )
                  })}
                  <td className="p-4 text-right font-mono font-bold text-amber-400 bg-slate-700/20">
                    {t.totalPF.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MVP di giornata */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">⭐ MVP di Giornata All-Time</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...teams]
            .sort((a, b) => b.mvpGiornata - a.mvpGiornata)
            .map((t, i) => (
              <div key={t.name} className={clsx('card text-center', i === 0 && 'border-amber-500 bg-amber-900/10')}>
                {i === 0 && <div className="text-2xl mb-1">👑</div>}
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-3xl font-extrabold text-amber-400 mt-1">{t.mvpGiornata}</div>
                <div className="text-slate-500 text-xs">MVP</div>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
