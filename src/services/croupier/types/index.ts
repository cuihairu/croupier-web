// Shared types for Croupier APIs

export type FunctionDescriptor = {
  id: string;
  version?: string;
  category?: string;
  params?: any;
  auth?: Record<string, any>;
};

export type GameEntry = { game_id: string; env?: string };

export type AuditEvent = {
  time: string;
  kind: string;
  actor: string;
  target: string;
  meta: Record<string, string>;
  hash: string;
  prev: string;
};

export type GameMeta = {
  game_id: string;
  name?: string;
  icon?: string;         // URL
  description?: string;
  created_at?: string;
  updated_at?: string;
};

