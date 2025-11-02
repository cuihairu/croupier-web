import { request } from '@umijs/max';

export type Game = {
  id?: number;
  name?: string;
  icon?: string;         // URL
  description?: string;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function listGamesMeta() {
  return request<{ games: Game[] }>('/api/games');
}

export async function upsertGame(g: Game) {
  // POST /api/games: id==0/undefined -> create; else update
  return request<{ id: number } | void>('/api/games', { method: 'POST', data: g });
}

export async function deleteGame(id: number) {
  return request<void>(`/api/games/${id}`, { method: 'DELETE' });
}
