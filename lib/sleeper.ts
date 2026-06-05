export interface SleeperUser {
  user_id: string
  display_name: string
  teamName: string
  avatar: string | null
}

export interface SleeperRoster {
  roster_id: number
  owner_id: string
  players: string[]
  starters: string[]
  taxi: string[] | null
  reserve: string[] | null
}

export interface SleeperPlayer {
  player_id: string
  full_name: string
  position: string
  team: string | null
  injury_status: string | null
  age: number | null
  years_exp: number | null
}

export interface TeamRoster {
  user: SleeperUser
  roster: SleeperRoster
  players: SleeperPlayer[]
}

const LEAGUE_ID = '1355323885268013056'

// Cache dei giocatori per evitare chiamate ripetute (aggiorna 1 volta al giorno)
async function fetchAllPlayers(): Promise<Record<string, SleeperPlayer>> {
  const res = await fetch('https://api.sleeper.app/v1/players/nfl', {
    next: { revalidate: 86400 }, // 24 ore
  })
  const data = await res.json()
  return data as Record<string, SleeperPlayer>
}

async function fetchUsers(): Promise<SleeperUser[]> {
  const res = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`, {
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  return data.map((u: Record<string, unknown>) => ({
    user_id: u.user_id as string,
    display_name: u.display_name as string,
    teamName: (u.metadata as Record<string, string>)?.team_name ?? (u.display_name as string),
    avatar: u.avatar as string | null,
  }))
}

async function fetchRosters(): Promise<SleeperRoster[]> {
  const res = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`, {
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  return data.map((r: Record<string, unknown>) => ({
    roster_id: r.roster_id as number,
    owner_id: r.owner_id as string,
    players: (r.players as string[]) ?? [],
    starters: (r.starters as string[]) ?? [],
    taxi: (r.taxi as string[]) ?? null,
    reserve: (r.reserve as string[]) ?? null,
  }))
}

export async function getAllTeamRosters(): Promise<TeamRoster[]> {
  const [users, rosters, allPlayers] = await Promise.all([
    fetchUsers(),
    fetchRosters(),
    fetchAllPlayers(),
  ])

  const userMap = Object.fromEntries(users.map(u => [u.user_id, u]))

  return rosters
    .filter(r => r.owner_id && userMap[r.owner_id])
    .map(roster => {
      const user = userMap[roster.owner_id]
      const playerIds = [
        ...new Set([
          ...(roster.players ?? []),
          ...(roster.taxi ?? []),
          ...(roster.reserve ?? []),
        ]),
      ]
      const players = playerIds
        .map(id => {
          const p = allPlayers[id]
          if (!p) return null
          return {
            player_id: id,
            full_name: p.full_name ?? `Player ${id}`,
            position: p.position ?? '?',
            team: p.team ?? null,
            injury_status: p.injury_status ?? null,
            age: p.age ?? null,
            years_exp: p.years_exp ?? null,
          } as SleeperPlayer
        })
        .filter(Boolean) as SleeperPlayer[]

      return { user, roster, players }
    })
    .sort((a, b) => a.user.display_name.localeCompare(b.user.display_name))
}

export async function getTeamRoster(username: string): Promise<TeamRoster | null> {
  const all = await getAllTeamRosters()
  return all.find(t => t.user.display_name.toLowerCase() === username.toLowerCase()) ?? null
}

// URL avatar Sleeper
export function avatarUrl(avatar: string | null): string {
  if (!avatar) return ''
  return `https://sleepercdn.com/avatars/thumbs/${avatar}`
}
