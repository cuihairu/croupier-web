export interface GameRecord {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  enabled?: boolean;
  alias_name?: string;
  homepage?: string;
  status?: string;
  game_type?: string;   // if backend supports
  genre_code?: string;  // if backend supports
}

export async function listGames(): Promise<GameRecord[]> {
  const res = await fetch('/api/games');
  const data = await res.json();
  return data.games || [];
}

export async function getGame(id: number): Promise<GameRecord> {
  const res = await fetch(`/api/games/${id}`);
  if (!res.ok) throw new Error('load game failed');
  return res.json();
}

export async function updateGame(id: number, patch: Partial<GameRecord>): Promise<void> {
  const res = await fetch(`/api/games/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
  if (!res.ok) throw new Error('update game failed');
}
