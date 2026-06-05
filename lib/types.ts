export interface TeamStats {
  name: string
  conference: 'AFC' | 'NFC'
  superBowlVinti: number
  superBowlGiocati: number
  conferenceVinti: number
  archettrophy: number
  mvpGiornata: number
  regularVinte: number
  regularPerse: number
  playoffVinte: number
  playoffPerse: number
  puntiFatti: number
  puntiSubiti: number
}

export interface SeasonRecord {
  year: number
  superBowlWinner: string
  superBowlRunnerUp: string
  thirdPlace: string
  bestAttackTeam: string
  bestAttackPoints: number
  conferenceChamp1: string
  conferenceChamp1Record: string
  conferenceChamp2?: string
  conferenceChamp2Record?: string
}

export interface PointsHistory {
  name: string
  conference: 'AFC' | 'NFC'
  totalPF: number
  totalPA: number
  byYear: { year: number; pf: number; pa: number }[]
}

export interface HeadToHeadRecord {
  team: string
  opponent: string
  wins: number
  losses: number
}

export interface HeadToHeadMatrix {
  teams: string[]
  records: Record<string, Record<string, { wins: number; losses: number }>>
}
