import { request } from '@umijs/max';

export async function fetchRegistry() {
  return request<{ agents: any[]; functions: any[]; assignments?: Record<string, string[]>; coverage?: any[] }>('/api/registry');
}

