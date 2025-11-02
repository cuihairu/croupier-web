import { request } from '@umijs/max';

export type MessageItem = {
  id: number;
  title: string;
  content: string;
  type?: string;
  created_at: string;
  read: boolean;
  kind?: 'direct' | 'broadcast';
};

export async function unreadCount() {
  return request<{ count: number }>('/api/messages/unread_count');
}

export async function listMessages(params?: { status?: 'unread' | 'all'; page?: number; size?: number }) {
  return request<{ messages: MessageItem[]; total: number; page: number; size: number }>('/api/messages', { params });
}

export async function markMessagesRead(ids: number[], options?: { broadcast_ids?: number[] }) {
  const data: any = { ids };
  if (options?.broadcast_ids && options.broadcast_ids.length) data.broadcast_ids = options.broadcast_ids;
  return request<void>('/api/messages/read', { method: 'POST', data });
}

// Admin only
export async function sendMessage(body: { to_username?: string; to_user_id?: number; title: string; content: string; type?: string }) {
  return request<{ id: number }>('/api/messages', { method: 'POST', data: body });
}
