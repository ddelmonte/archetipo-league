import { getTeamStats, getSeasonRecords } from '@/lib/sheets'
import { Trophy, Star, Users, CalendarDays } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const [teams, seasons] = await Promise.all([getTeamStats(), getSeasonRecords()])
  const lastSeason = seasons[0]
  const totalGames = teams.reduce((s, t) => s + t.regularVinte + t.regularPerse, 0) / 2

  const statCards = [
    { label: 'Stagioni', value: seasons.length, icon: CalendarDays, color: 'text-amber-400' },
    { label: 'Squadre attuali', value: 12, icon: Users, color: 'text-blue-400' },
    { label: 'Partite giocate', value: Math.round(totalGames), icon: Star, color: 'text-green-400' },
    { label: 'Campione in carica', value: lastSeason?.superBowlWinner ?? '–', icon: Trophy, color: 'text-amber-400', wide: true },
  ]

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16">
        <div className="text-6xl mb-4">🏈</div>
        <h1 className="text-5xl font-extrabold text-white mb-3">
          Archetipo League
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Fantasy NFL · Dal 2020 · 6 stagioni di gloria, rivalità e leggende
        </p>
      </section>

      {/* Stats cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, wide }) => (
          <div key={label} className={`card flex flex-col gap-2 ${wide ? 'col-span-2 md:col-span-1' : ''}`}>
            <Icon className={`w-6 h-6 ${color}`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </section>

      {/* Campione in carica spotlight */}
      {lastSeason && (
        <section className="card bg-gradient-to-br from-amber-900/30 to-slate-800 border-amber-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Super Bowl {lastSeason.year}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">🥇 Campione</div>
              <div className="text-2xl font-extrabold text-white">{lastSeason.superBowlWinner}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">🥈 Finalista</div>
              <div className="text-xl font-bold text-slate-300">{lastSeason.superBowlRunnerUp}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">🥉 Terzo</div>
              <div className="text-xl font-bold text-slate-300">{lastSeason.thirdPlace}</div>
            </div>
          </div>
        </section>
      )}

      {/* Quick links */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Esplora</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/albo-doro', emoji: '🏆', title: 'Albo d\'oro', desc: 'Vincitori stagione per stagione' },
            { href: '/trofei', emoji: '⭐', title: 'Bacheca Trofei', desc: 'Palmares di ogni allenatore' },
            { href: '/rivalita', emoji: '⚔️', title: 'Rivalità', desc: 'Scontri diretti head-to-head' },
            { href: '/classifiche', emoji: '📊', title: 'Classifiche', desc: 'Standings e punti all-time' },
          ].map(({ href, emoji, title, desc }) => (
            <Link key={href} href={href} className="card hover:border-amber-600 hover:bg-slate-700 transition-all cursor-pointer group">
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{title}</div>
              <div className="text-slate-400 text-sm mt-1">{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top scorer */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Top 5 — Punti All Time</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Allenatore</th>
                <th className="text-right p-4">Punti Fatti</th>
                <th className="text-right p-4">W%</th>
              </tr>
            </thead>
            <tbody>
              {[...teams]
                .sort((a, b) => b.puntiFatti - a.puntiFatti)
                .slice(0, 5)
                .map((t, i) => {
                  const winPct = ((t.regularVinte / (t.regularVinte + t.regularPerse)) * 100).toFixed(1)
                  return (
                    <tr key={t.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4 text-slate-400 font-mono">{i + 1}</td>
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        {i === 0 && <span>👑</span>}
                        {t.name}
                        <span className={t.conference === 'AFC' ? 'badge-afc' : 'badge-nfc'}>
                          {t.conference}
                        </span>
                      </td>
                      <td className="p-4 text-right text-amber-400 font-mono font-bold">
                        {t.puntiFatti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right text-slate-300">{winPct}%</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
