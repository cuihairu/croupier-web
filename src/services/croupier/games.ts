import { request } from '@umijs/max';
import type { GameEntry } from './types';

export async function listGames() {
  return request<{ games: GameEntry[] }>('/api/games');
}

export async function addGame(game: GameEntry) {
  return request<void>('/api/games', { method: 'POST', data: game });
}

