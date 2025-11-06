import { request } from '@umijs/max';

export type Game = {
  id?: number;
  name?: string;
  icon?: string;         // URL
  description?: string;
  alias_name?: string;
  homepage?: string;
  status?: string;       // online|offline|running
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
};

// Normalize server payload shape to our frontend's camel/snake case keys.
function normalizeGame(g: any): Game {
  return {
    id: g?.id ?? g?.ID,
    name: g?.name ?? g?.Name,
    icon: g?.icon ?? g?.Icon,
    description: g?.description ?? g?.Description,
    alias_name: g?.alias_name ?? g?.AliasName,
    homepage: g?.homepage ?? g?.Homepage,
    status: g?.status ?? g?.Status,
    // Accept both server's CreatedAt/UpdatedAt and snake_case
    created_at: g?.created_at ?? g?.CreatedAt,
    updated_at: g?.updated_at ?? g?.UpdatedAt,
    enabled: (g?.enabled ?? g?.Enabled) as any,
  } as Game;
}

export async function listGamesMeta() {
  const res = await request<any>('/api/games');
  const games = Array.isArray(res?.games) ? res.games.map(normalizeGame) : [];
  return { games } as { games: Game[] };
}

export async function upsertGame(g: Game) {
  // POST /api/games: id==0/undefined -> create; else update
  return request<{ id: number } | void>('/api/games', { method: 'POST', data: g });
}

export async function deleteGame(id: number) {
  return request<void>(`/api/games/${id}`, { method: 'DELETE' });
}
