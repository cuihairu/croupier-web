import { request } from '@umijs/max';

export type UserRecord = {
  id: number;
  username: string;
  display_name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  roles?: string[];
};

export async function listUsers() {
  return request<{ users: UserRecord[] }>('/api/users');
}

export async function createUser(body: { username: string; display_name?: string; email?: string; phone?: string; password?: string; active?: boolean; roles?: string[] }) {
  return request<{ id: number }>('/api/users', { method: 'POST', data: body });
}

export async function updateUser(id: number, body: { display_name?: string; email?: string; phone?: string; active?: boolean; roles?: string[] }) {
  return request<void>(`/api/users/${id}`, { method: 'PUT', data: body });
}

export async function deleteUser(id: number) {
  return request<void>(`/api/users/${id}`, { method: 'DELETE' });
}

export async function setUserPassword(id: number, password: string) {
  return request<void>(`/api/users/${id}/password`, { method: 'POST', data: { password } });
}
