import { request } from '@umijs/max';

// Overview KPI
export async function fetchAnalyticsOverview(params?: any) {
  try { return await request('/api/analytics/overview', { params }); } catch { return {}; }
}

// Retention (cohort)
export async function fetchAnalyticsRetention(params?: any) {
  try { return await request('/api/analytics/retention', { params }); } catch { return { cohorts: [] }; }
}

// Realtime screen
export async function fetchAnalyticsRealtime() {
  try { return await request('/api/analytics/realtime'); } catch { return {}; }
}

// Behavior events and funnel
export async function fetchAnalyticsEvents(params?: any) {
  try { return await request('/api/analytics/behavior/events', { params }); } catch { return { events: [], total: 0 }; }
}
export async function fetchAnalyticsFunnel(params?: any) {
  try { return await request('/api/analytics/behavior/funnel', { params }); } catch { return { steps: [] }; }
}

// Payments
export async function fetchAnalyticsPaymentsSummary(params?: any) {
  try { return await request('/api/analytics/payments/summary', { params }); } catch { return { totals: {}, by_channel: [], by_product: [] }; }
}
export async function fetchAnalyticsTransactions(params?: any) {
  try { return await request('/api/analytics/payments/transactions', { params }); } catch { return { transactions: [], total: 0 }; }
}

// Levels (funnel + winrate + time + retries)
export async function fetchAnalyticsLevels(params?: any) {
  try { return await request('/api/analytics/levels', { params }); } catch { return { funnel: [], per_level: [] }; }
}

// Attribution & Segments
export async function fetchAnalyticsAttribution(params?: any) {
  try { return await request('/api/analytics/attribution', { params }); } catch { return { summary: {}, by_channel: [], by_campaign: [] }; }
}
export async function fetchAnalyticsSegments(params?: any) {
  try { return await request('/api/analytics/segments', { params }); } catch { return { segments: [] }; }
}
