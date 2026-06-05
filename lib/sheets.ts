import Papa from 'papaparse'
import type { TeamStats, SeasonRecord, PointsHistory, HeadToHeadMatrix } from './types'

const SHEET_ID = '1ylSjcD8yDMfgbwyDyo4o_cNIkvE14k_jwd04305PW4U'

function sheetUrl(sheetName: string) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
}

async function fetchCSV(sheetName: string): Promise<string[][]> {
  const res = await fetch(sheetUrl(sheetName), {
    next: { revalidate: 3600 }, // aggiorna ogni ora
  })
  const text = await res.text()
  const result = Papa.parse<string[]>(text, { skipEmptyLines: false })
  return result.data
}

// Converte numeri europei (10.168,81) in float
function parseNum(s: string): number {
  if (!s || s === '-' || s === '') return 0
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
}

// ── Esterni: stats aggregate per allenatore ─────────────────────────────────
export async function getTeamStats(): Promise<TeamStats[]> {
  const rows = await fetchCSV('Esterni')
  // Row 0 = headers (nomi allenatori nelle colonne 1..N)
  const names = rows[0].slice(1).filter(Boolean)

  const getValue = (rowIndex: number, colIndex: number) =>
    rows[rowIndex]?.[colIndex + 1] ?? '0'

  const conferenceMap: Record<string, 'AFC' | 'NFC'> = {
    byzero: 'AFC', GiangiMirac: 'AFC', Maggico80: 'AFC', SimoBPO: 'AFC', simocana: 'AFC',
    '49erspavia': 'NFC', falchettifurbetti: 'NFC', gabro: 'NFC', malmax: 'NFC', Olinec78: 'NFC',
    Fritzdagr8: 'AFC', LeoTheKing: 'NFC', // nuove squadre 2026
  }

  return names.map((name, i) => ({
    name,
    conference: conferenceMap[name] ?? 'AFC',
    superBowlVinti: parseNum(getValue(1, i)),
    superBowlGiocati: parseNum(getValue(2, i)),
    conferenceVinti: parseNum(getValue(3, i)),
    archettrophy: parseNum(getValue(4, i)),
    mvpGiornata: parseNum(getValue(5, i)),
    regularVinte: parseNum(getValue(6, i)),
    regularPerse: parseNum(getValue(7, i)),
    playoffVinte: parseNum(getValue(8, i)),
    playoffPerse: parseNum(getValue(9, i)),
    puntiFatti: parseNum(getValue(10, i)),
    puntiSubiti: parseNum(getValue(11, i)),
  }))
}

// ── Albo d'oro: vincitori per stagione ─────────────────────────────────────
export async function getSeasonRecords(): Promise<SeasonRecord[]> {
  const rows = await fetchCSV("Bacheca trofei")
  const records: SeasonRecord[] = []

  for (const row of rows) {
    const year = parseInt(row[0])
    if (isNaN(year) || year < 2020) continue
    if (!row[1]) continue // riga vuota

    records.push({
      year,
      superBowlWinner: row[1] || '',
      superBowlRunnerUp: row[2] || '',
      thirdPlace: row[3] || '',
      bestAttackTeam: row[5] || '',
      bestAttackPoints: parseNum(row[6]),
      conferenceChamp1: row[8] || '',
      conferenceChamp1Record: row[9] || '',
      conferenceChamp2: row[11] || undefined,
      conferenceChamp2Record: row[12] || undefined,
    })
  }

  return records.sort((a, b) => b.year - a.year)
}

// ── Storico punti: PF/PA per anno ──────────────────────────────────────────
export async function getPointsHistory(): Promise<PointsHistory[]> {
  const rows = await fetchCSV('Storico punti regular')
  const result: PointsHistory[] = []

  for (const row of rows) {
    const conf = row[0]
    const name = row[1]
    if (!name || !['AFC', 'NFC'].includes(conf)) continue
    if (name.includes('TOT') || name === 'ALLENATORE') continue

    const totalPF = parseNum(row[2])
    const totalPA = parseNum(row[3])

    // Le colonne sono: TOT PF, TOT PA, PF2025, PA2025, PF2024, PA2024, PF2023, PA2023, PF2022, PA2022, ...
    const byYear: { year: number; pf: number; pa: number }[] = []
    const yearCols = [
      { year: 2025, pfIdx: 4, paIdx: 5 },
      { year: 2024, pfIdx: 6, paIdx: 7 },
      { year: 2023, pfIdx: 8, paIdx: 9 },
      { year: 2022, pfIdx: 10, paIdx: 11 },
    ]

    for (const { year, pfIdx, paIdx } of yearCols) {
      const pf = parseNum(row[pfIdx])
      const pa = parseNum(row[paIdx])
      if (pf > 0) byYear.push({ year, pf, pa })
    }

    result.push({
      name,
      conference: conf as 'AFC' | 'NFC',
      totalPF,
      totalPA,
      byYear,
    })
  }

  return result
}

// ── Head-to-head matrix ────────────────────────────────────────────────────
export async function getHeadToHead(): Promise<HeadToHeadMatrix> {
  const rows = await fetchCSV('W / L (regular)')

  // Prima riga = header. Le coppie di colonne sono i team
  const headerRow = rows[0]
  const teams: string[] = []
  // Colonne team iniziano a indice 2, a coppie (W, L vuota)
  for (let i = 2; i < headerRow.length; i += 2) {
    const name = headerRow[i]
    if (name && name !== 'W' && name !== 'L' && name !== 'W%' && name !== 'L%' && name !== '' && name !== 'partite') {
      teams.push(name)
    } else if (name === 'W') break
  }

  // Mappa lowercase → nome canonico dall'header (risolve mismatch maiuscole/minuscole)
  const canonicalName: Record<string, string> = {}
  teams.forEach(t => { canonicalName[t.toLowerCase()] = t })

  const records: Record<string, Record<string, { wins: number; losses: number }>> = {}

  for (const row of rows.slice(1)) {
    const conf = row[0]
    const rawName = row[1]
    if (!rawName || !['AFC', 'NFC'].includes(conf)) continue
    if (rawName.includes('TOT') || rawName === 'ALLENATORE') continue

    // Usa il nome canonico dell'header se disponibile, altrimenti il nome grezzo
    const teamName = canonicalName[rawName.toLowerCase()] ?? rawName

    // Salta le sezioni successive (W/L totali, Confronti diretti) che ripetono gli stessi team
    if (records[teamName]) continue

    records[teamName] = {}
    teams.forEach((opp, i) => {
      const wIdx = 2 + i * 2
      const lIdx = 3 + i * 2
      const wins = parseNum(row[wIdx])
      const losses = parseNum(row[lIdx])
      records[teamName][opp] = { wins, losses }
    })
  }

  return { teams, records }
}
