import { request } from '@umijs/max';

export type FunctionDescriptor = {
  id: string;
  version?: string;
  category?: string;
  params?: any;
  auth?: Record<string, any>;
};

export async function listDescriptors() {
  return request<FunctionDescriptor[]>('/api/descriptors');
}

export async function invokeFunction(
  function_id: string,
  payload: any,
  opts?: { route?: 'lb' | 'broadcast' | 'targeted' | 'hash'; target_service_id?: string; hash_key?: string }
) {
  const data: any = { function_id, payload };
  if (opts?.route) data.route = opts.route;
  if (opts?.target_service_id) data.target_service_id = opts.target_service_id;
  if (opts?.hash_key) data.hash_key = opts.hash_key;
  return request<any>('/api/invoke', { method: 'POST', data });
}

export async function startJob(
  function_id: string,
  payload: any,
  opts?: { route?: 'lb' | 'broadcast' | 'targeted' | 'hash'; target_service_id?: string; hash_key?: string }
) {
  const data: any = { function_id, payload };
  if (opts?.route) data.route = opts.route;
  if (opts?.target_service_id) data.target_service_id = opts.target_service_id;
  if (opts?.hash_key) data.hash_key = opts.hash_key;
  return request<{ job_id: string }>('/api/start_job', { method: 'POST', data });
}

export async function cancelJob(job_id: string) {
  return request<void>('/api/cancel_job', { method: 'POST', data: { job_id } });
}

export async function fetchJobResult(id: string) {
  return request<{ state: string; payload?: any; error?: string }>('/api/job_result', { params: { id } });
}

export type GameEntry = { game_id: string; env?: string };
export async function listGames() {
  return request<{ games: GameEntry[] }>('/api/games');
}
export async function addGame(game: GameEntry) {
  return request<void>('/api/games', { method: 'POST', data: game });
}

export type AuditEvent = {
  time: string;
  kind: string;
  actor: string;
  target: string;
  meta: Record<string, string>;
  hash: string;
  prev: string;
};
export async function listAudit(params?: { game_id?: string; env?: string; actor?: string; kind?: string; limit?: number; offset?: number; page?: number; size?: number; start?: string; end?: string }) {
  return request<{ events: AuditEvent[]; total?: number }>('/api/audit', { params });
}

// Auth
export async function loginAuth(params: { username: string; password: string }) {
  return request<{ token: string; user: { username: string; roles: string[] } }>('/api/auth/login', { method: 'POST', data: params });
}
export async function fetchMe() {
  return request<{ username: string; roles: string[] }>('/api/auth/me');
}

export async function listFunctionInstances(params: { game_id?: string; function_id: string }) {
  return request<{ instances: { agent_id: string; service_id: string; addr: string; version: string }[] }>(
    '/api/function_instances',
    { params },
  );
}

export async function fetchAssignments(params?: { game_id?: string; env?: string }) {
  return request<{ assignments: Record<string, string[]> }>('/api/assignments', { params });
}

// Server responds with { ok: true, unknown: string[] } on POST
export async function setAssignments(params: { game_id: string; env?: string; functions: string[] }) {
  return request<{ ok: boolean; unknown?: string[] }>('/api/assignments', { method: 'POST', data: params });
}

// Registry and Packs
export async function fetchRegistry() {
  return request<{ agents: any[]; functions: any[]; assignments?: Record<string, string[]>; coverage?: any[] }>('/api/registry');
}

export async function listPacks() {
  return request<{ manifest: any; counts: { descriptors: number; ui_schema: number }; etag?: string; export_auth_required?: boolean }>('/api/packs/list');
}

export async function reloadPacks() {
  return request<{ ok: boolean }>('/api/packs/reload', { method: 'POST' });
}
