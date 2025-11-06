import { request } from '@umijs/max';

export type GameEnv = { id?: number; env: string; description?: string };

export async function listGameEnvs(gameId: number) {
  const res = await request<{ envs: GameEnv[] }>(`/api/games/${gameId}/envs`);
  return { envs: Array.isArray(res?.envs) ? res.envs : [] };
}

export async function addGameEnv(gameId: number, env: string, description?: string) {
  return request<void>(`/api/games/${gameId}/envs`, { method: 'POST', data: { env, description } });
}

export async function updateGameEnv(gameId: number, oldEnv: string, env?: string, description?: string) {
  return request<void>(`/api/games/${gameId}/envs`, { method: 'PUT', data: { oldEnv, env, description } });
}

export async function deleteGameEnv(gameId: number, params: { id?: number; env?: string }) {
  const qs = new URLSearchParams();
  if (params.id) qs.set('id', String(params.id));
  if (params.env) qs.set('env', params.env);
  const q = qs.toString();
  return request<void>(`/api/games/${gameId}/envs${q ? `?${q}` : ''}`, { method: 'DELETE' });
}

