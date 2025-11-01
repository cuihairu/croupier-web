import React from 'react';

// Minimal renderer registry for future outputs.views rendering
export type Renderer = React.ComponentType<{ data: any; options?: Record<string, any> }>;

const registry: Record<string, Renderer> = {};

export function registerRenderer(id: string, comp: Renderer) {
  registry[id] = comp;
}

export function getRenderer(id: string): Renderer | undefined {
  return registry[id];
}

// Built-ins: json.view and table.basic
export function registerBuiltins() {
  // lazy import to avoid bundling if unused
  registerRenderer('json.view', ((props) => {
    const { data } = props;
    return <pre style={{ whiteSpace: 'pre-wrap' }}>{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>;
  }) as Renderer);
  // very basic table renderer for array of objects
  registerRenderer('table.basic', ((props) => {
    const { data } = props as any;
    const arr: any[] = Array.isArray(data) ? data : []; if (!arr.length) return <div />;
    const columns = Object.keys(arr[0]).map((k) => ({ title: k, dataIndex: k }));
    const AntTable = require('antd').Table as typeof import('antd').Table;
    return <AntTable rowKey={(r: any, i: number)=> String(r.id || i)} size="small" dataSource={arr} columns={columns} pagination={false} />;
  }) as Renderer);

  // ECharts line renderer (loaded on demand from CDN)
  registerRenderer('echarts.line', ((props) => {
    const { data, options } = props as any;
    const ref = (React as any).useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = (React as any).useState(false);
    (React as any).useEffect(() => {
      let disposed = false;
      ensureEcharts().then((echarts) => {
        if (disposed) return;
        setReady(true);
        const el = ref.current!;
        if (!el) return;
        const inst = echarts.init(el);
        const opt = buildLineOption(data, options);
        inst.setOption(opt);
        const onResize = () => inst.resize();
        window.addEventListener('resize', onResize);
        return () => { try { window.removeEventListener('resize', onResize); inst.dispose(); } catch {} };
      }).catch(() => {});
      return () => { disposed = true; };
    }, [JSON.stringify(data), JSON.stringify(options)]);
    return <div ref={ref} style={{ width: '100%', height: 320, border: '1px solid #f0f0f0' }}>{!ready && <span style={{padding:8}}>Loading chart...</span>}</div>;
  }) as Renderer);
}

// Dynamically load frontend plugins declared in pack manifest (served at /pack_static/manifest.json)
// Convention: each plugin URL exports default function (api) receiving { registerRenderer }
export async function loadPackPlugins() {
  try {
    const resp = await fetch('/pack_static/manifest.json');
    if (!resp.ok) return;
    const mani = await resp.json();
    const plugins: string[] = (mani && mani.web_plugins) || (mani && mani.plugins) || [];
    for (const p of plugins) {
      try {
        const mod = await import(/* @vite-ignore */ `/pack_static/${p}`);
        const fn = mod.default;
        if (typeof fn === 'function') { fn({ registerRenderer }); }
      } catch (e) { /* ignore single plugin failure */ }
    }
  } catch {}
}

// --- helpers for echarts ---
let echartsPromise: Promise<any> | null = null;
function ensureEcharts(): Promise<any> {
  if ((window as any).echarts) return Promise.resolve((window as any).echarts);
  if (echartsPromise) return echartsPromise;
  echartsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js';
    s.async = true;
    s.onload = () => resolve((window as any).echarts);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return echartsPromise;
}

function buildLineOption(data: any, opts?: Record<string, any>) {
  // Accept Prometheus matrix result or generic series
  let series: any[] = [];
  let x: number[] = [];
  // Prometheus shape: { data: { result: [ { metric: {...}, values: [[ts,value], ...] }, ...] } }
  const prom = data && data.data && Array.isArray(data.data.result) ? data.data.result : null;
  if (prom) {
    series = prom.map((it: any) => {
      const name = Object.keys(it.metric || {}).map((k) => `${k}=${it.metric[k]}`).join(',');
      const points = (it.values || []).map((p: any[]) => [Number(p[0]) * 1000, Number(p[1])]);
      if (!x.length) x = points.map((p) => p[0]);
      return { name, type: 'line', showSymbol: false, data: points };
    });
  } else if (Array.isArray(data)) {
    // generic: [{ name, data: [[ms, value], ...] }]
    series = data.map((s: any) => ({ name: s.name, type: 'line', showSymbol: false, data: s.data || [] }));
    if (series.length && Array.isArray(series[0].data)) x = series[0].data.map((p: any[]) => p[0]);
  } else if (data && Array.isArray(data.series)) {
    series = (data.series as any[]).map((s: any) => ({ name: s.name, type: 'line', showSymbol: false, data: s.data || [] }));
    if (series.length && Array.isArray(series[0].data)) x = series[0].data.map((p: any[]) => p[0]);
  }
  // normalize timestamps: if looks like seconds (< 1e12), multiply by 1000
  series.forEach((s: any) => {
    if (!Array.isArray(s.data)) return;
    if (!s.data.length) return;
    const ts = Number(s.data[0][0]);
    const needsMs = !Number.isNaN(ts) && ts > 0 && ts < 1e12;
    s.data = s.data.map((p: any[]) => {
      const t0 = Number(p[0]);
      const v1 = Number(p[1]);
      return [needsMs ? t0 * 1000 : t0, v1];
    });
  });
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'time' },
    yAxis: { type: 'value', scale: true },
    series,
    ...opts,
  };
  return option;
}
