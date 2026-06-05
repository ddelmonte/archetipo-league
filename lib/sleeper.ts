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

// Scarica solo i giocatori NFL (tutti, ma con cache di 24h su Vercel edge)
// Usiamo la trending endpoint + players by ID per evitare il file da 30MB
async function fetchPlayersByIds(ids: string[]): Promise<Record<string, SleeperPlayer>> {
  if (ids.length === 0) return {}
  // Sleeper non ha un endpoint batch per ID, ma il file completo è necessario.
  // Lo scarichiamo UNA sola volta con cache lunga — Vercel lo tiene in edge cache.
  const res = await fetch('https://api.sleeper.app/v1/players/nfl', {
    next: { revalidate: 86400 }, // 24 ore di cache
  })
  const all: Record<string, Record<string, unknown>> = await res.json()
  // Filtriamo solo i giocatori nei roster per ridurre il payload in memoria
  const result: Record<string, SleeperPlayer> = {}
  for (const id of ids) {
    const p = all[id]
    if (!p) continue
    result[id] = {
      player_id: id,
      full_name: (p.full_name as string) ?? (p.last_name ? `${p.first_name} ${p.last_name}` : `Player ${id}`),
      position: (p.position as string) ?? '?',
      team: (p.team as string | null) ?? null,
      injury_status: (p.injury_status as string | null) ?? null,
      age: (p.age as number | null) ?? null,
      years_exp: (p.years_exp as number | null) ?? null,
    }
  }
  return result
}

async function fetchUsers(): Promise<SleeperUser[]> {
  const res = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`, {
    next: { revalidate: 3600 },
  })
  const data: Record<string, unknown>[] = await res.json()
  return data.map((u) => ({
    user_id: u.user_id as string,
    display_name: u.display_name as string,
    teamName: (u.metadata as Record<string, string>)?.team_name ?? (u.display_name as string),
    avatar: (u.avatar as string | null) ?? null,
  }))
}

async function fetchRosters(): Promise<SleeperRoster[]> {
  const res = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`, {
    next: { revalidate: 3600 },
  })
  const data: Record<string, unknown>[] = await res.json()
  return data.map((r) => ({
    roster_id: r.roster_id as number,
    owner_id: r.owner_id as string,
    players: (r.players as string[]) ?? [],
    starters: (r.starters as string[]) ?? [],
    taxi: (r.taxi as string[] | null) ?? null,
    reserve: (r.reserve as string[] | null) ?? null,
  }))
}

export async function getAllTeamRosters(): Promise<TeamRoster[]> {
  const [users, rosters] = await Promise.all([fetchUsers(), fetchRosters()])

  // Raccogli tutti gli ID giocatori unici
  const allPlayerIds = [
    ...new Set(
      rosters.flatMap((r) => [
        ...(r.players ?? []),
        ...(r.taxi ?? []),
        ...(r.reserve ?? []),
      ])
    ),
  ]

  const playerMap = await fetchPlayersByIds(allPlayerIds)
  const userMap = Object.fromEntries(users.map((u) => [u.user_id, u]))

  return rosters
    .filter((r) => r.owner_id && userMap[r.owner_id])
    .map((roster) => {
      const user = userMap[roster.owner_id]
      const playerIds = [
        ...new Set([
          ...(roster.players ?? []),
          ...(roster.taxi ?? []),
          ...(roster.reserve ?? []),
        ]),
      ]
      const players = playerIds
        .map((id) => playerMap[id])
        .filter(Boolean) as SleeperPlayer[]

      return { user, roster, players }
    })
    .sort((a, b) => a.user.display_name.localeCompare(b.user.display_name))
}

export async function getTeamRoster(username: string): Promise<TeamRoster | null> {
  const all = await getAllTeamRosters()
  return (
    all.find((t) => t.user.display_name.toLowerCase() === username.toLowerCase()) ?? null
  )
}

export function avatarUrl(avatar: string | null): string {
  if (!avatar) return ''
  return `https://sleepercdn.com/avatars/thumbs/${avatar}`
}
