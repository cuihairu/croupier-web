import { request } from '@umijs/max';

export type GameMeta = {
  game_id: string;
  name?: string;
  icon?: string;         // URL
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export async function listGameMeta() {
  return request<{ games: GameMeta[] }>('/api/games_meta');
}

export async function upsertGameMeta(g: GameMeta) {
  return request<void>('/api/games_meta', { method: 'POST', data: g });
}

export async function deleteGameMeta(id: string) {
  return request<void>('/api/games_meta', { method: 'DELETE', params: { id } });
}
