// Lightweight loader for analytics spec JSON exported to /public
export type MetricDef = {
  id: string;
  zh_name?: string;
  zh_desc?: string;
  [k: string]: any;
};
export type GameType = {
  id: string;
  name: string;
  summary?: string;       // 名称解释（中英 + 缩写展开）
  description?: string;   // 两句详细描述
  characteristics?: string[];
  aliases?: string[];
  examples?: string[];
  recommended_events?: string[];
  recommended_metrics?: string[];
  breakdowns?: string[];
  [k: string]: any;
};
export type AnalyticsSpec = {
  events: any;
  metrics: { metrics: MetricDef[] };
  game_types: { game_types: GameType[] };
  taxonomy?: any;
  derived?: {
    metrics_by_id?: Record<string, MetricDef>;
    game_types_by_id?: Record<string, GameType>;
  };
};

let cache: AnalyticsSpec | null = null;

export async function loadAnalyticsSpec(): Promise<AnalyticsSpec> {
  if (cache) return cache;
  const res = await fetch('/analytics-spec.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`fetch analytics-spec.json failed: ${res.status}`);
  const spec = (await res.json()) as AnalyticsSpec;
  cache = spec;
  return spec;
}

export async function getGameTypeById(id: string): Promise<GameType | undefined> {
  const spec = await loadAnalyticsSpec();
  const idx = spec.derived?.game_types_by_id ||
    Object.fromEntries((spec.game_types?.game_types || []).map((g) => [g.id, g]));
  return idx[id];
}

export async function getMetricById(id: string): Promise<MetricDef | undefined> {
  const spec = await loadAnalyticsSpec();
  const idx = spec.derived?.metrics_by_id ||
    Object.fromEntries((spec.metrics?.metrics || []).map((m) => [m.id, m]));
  return idx[id];
}
