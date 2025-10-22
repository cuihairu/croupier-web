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

export async function invokeFunction(function_id: string, payload: any) {
  return request<any>('/api/invoke', { method: 'POST', data: { function_id, payload } });
}

export async function startJob(function_id: string, payload: any) {
  return request<{ job_id: string }>('/api/start_job', { method: 'POST', data: { function_id, payload } });
}

export async function cancelJob(job_id: string) {
  return request<void>('/api/cancel_job', { method: 'POST', data: { job_id } });
}

