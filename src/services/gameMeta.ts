export interface GameMeta {
  game_type?: string;
  genre_code?: string;
}

export async function loadGameMeta(gameId: number): Promise<GameMeta | null> {
  const url = `/api/configs/game.meta?game_id=${gameId}&env=`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  try {
    const content = JSON.parse(data.content || '{}');
    return content as GameMeta;
  } catch {
    return null;
  }
}

export async function saveGameMeta(gameId: number, meta: GameMeta): Promise<void> {
  const url = `/api/configs/game.meta`;
  const payload = {
    game_id: String(gameId),
    env: '',
    format: 'json',
    content: JSON.stringify(meta),
    baseVersion: 0,
    message: 'update game meta',
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('save meta failed');
}
