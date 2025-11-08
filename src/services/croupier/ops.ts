import { request } from '@umijs/max';

export type OpsAgent = {
  agent_id: string;
  game_id: string;
  env: string;
  rpc_addr: string;
  ip?: string;
  type?: string;
  version?: string;
  functions: number;
  healthy: boolean;
  expires_in_sec: number;
  active_conns?: number;
  total_requests?: number;
  failed_requests?: number;
  error_rate?: number;
  avg_latency_ms?: number;
  last_seen?: string;
  qps_limit?: number;
  qps_1m?: number;
};

export async function fetchOpsServices() {
  return request<{ agents: OpsAgent[] }>("/api/ops/services");
}

export type RateLimitRule = { scope: 'function'|'service'; key: string; limit_qps: number; match?: Record<string,string>; percent?: number };
export async function listRateLimits() {
  return request<{ rules: RateLimitRule[] }>("/api/ops/rate-limits");
}
export async function putRateLimits(rules: RateLimitRule[]) {
  return request<void>("/api/ops/rate-limits", { method: 'PUT', data: { rules } });
}
export async function deleteRateLimit(scope: string, key: string) {
  return request<void>(`/api/ops/rate-limits?scope=${encodeURIComponent(scope)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' });
}
export async function previewRateLimit(params: { scope: 'service'; key?: string; limit_qps: number; percent?: number; match_game_id?: string; match_env?: string; match_region?: string; match_zone?: string }) {
  return request<{ matched: number; agents: { agent_id: string; game_id?: string; env?: string; region?: string; zone?: string; rpc_addr?: string; qps: number }[] }>(
    "/api/ops/rate-limits/preview",
    { params },
  );
}

export async function listOpsFunctions() {
  return request<{ functions: { id: string; category?: string }[] }>("/api/ops/functions");
}

export type OpsJob = {
  id: string;
  function_id: string;
  actor?: string;
  game_id?: string;
  env?: string;
  state: 'running'|'succeeded'|'failed'|'canceled'|string;
  started_at?: string;
  ended_at?: string;
  duration_ms?: number;
  error?: string;
  rpc_addr?: string;
  trace_id?: string;
};
export async function listOpsJobs(params?: { status?: string; function_id?: string; actor?: string; game_id?: string; env?: string; page?: number; size?: number }) {
  return request<{ jobs: OpsJob[]; total: number }>("/api/ops/jobs", { params });
}

export async function fetchOpsMetrics(params: { instance: string; range?: string; step?: string }) {
  return request<{ qps: [number, string][]; err_rate: [number, string][]; p95_ms: [number, string][] }>("/api/ops/metrics", { params });
}

export async function listSilences() {
  return request<{ silences: any[] }>("/api/ops/alerts/silences");
}
export async function deleteSilence(id: string) {
  return request<void>(`/api/ops/alerts/silences/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function fetchOpsConfig() {
  return request<{ alertmanager_url?: string; grafana_explore_url?: string }>("/api/ops/config");
}

export async function updateAgentMeta(agent_id: string, data: { region?: string; zone?: string }) {
  return request<void>(`/api/ops/agents/${encodeURIComponent(agent_id)}/meta`, { method: 'PUT', data });
}
