import { request } from '@umijs/max';
import type { AuditEvent } from './types';

export async function listAudit(params?: { game_id?: string; env?: string; actor?: string; kind?: string; limit?: number; offset?: number; page?: number; size?: number; start?: string; end?: string }) {
  return request<{ events: AuditEvent[]; total?: number }>('/api/audit', { params });
}

