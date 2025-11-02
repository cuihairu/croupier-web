import { request } from '@umijs/max';

export type GameEntry = { game_id: string; env?: string };

export async function listGames() {
  return request<{ games: GameEntry[] }>('/api/games');
}

export async function addGame(game: GameEntry) {
  return request<void>('/api/games', { method: 'POST', data: game });
}
