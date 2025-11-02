import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Table, Space, Input, Select, Button, Typography, Switch, Tag, DatePicker } from 'antd';
import { getMessage } from '@/utils/antdApp';
import { useModel } from '@umijs/max';
import { listAudit, AuditEvent } from '@/services/croupier';
import GameSelector from '@/components/GameSelector';

export default function AuditPage(){
  const [data, setData] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{game_id?: string; env?: string; actor?: string; kind?: string; limit?: number}>({ limit: 200 });
  const [auto, setAuto] = useState<boolean>(false);
  const autoRef = useRef<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [useScope, setUseScope] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<[any, any] | null>(null);
  const { initialState } = useModel('@@initialState');
  const roles = useMemo(() => {
    const acc = (initialState as any)?.currentUser?.access as string | undefined;
    return (acc ? acc.split(',') : []).filter(Boolean);
  }, [initialState]);
  const canRead = roles.includes('*') || roles.includes('audit:read');

  const reload = async ()=>{
    setLoading(true);
    try {
      const params: any = { ...filters, page, size: pageSize };
      if (!useScope) { delete params.game_id; delete params.env; }
      if (timeRange && timeRange[0]) { params.start = timeRange[0].toISOString(); }
      if (timeRange && timeRange[1]) { params.end = timeRange[1].toISOString(); }
      const res = await listAudit(params);
      setData(res.events || []);
      setTotal(res.total || (res.events||[]).length);
    } catch (e:any) { getMessage()?.error(e?.message || 'Load failed'); }
    setLoading(false);
  };

  useEffect(()=>{ reload(); }, []);
  useEffect(()=>{
    const onStorage = () => setFilters((f)=>({ ...f, game_id: localStorage.getItem('game_id')||undefined, env: localStorage.getItem('env')||undefined }));
    onStorage();
    window.addEventListener('storage', onStorage);
    return ()=> window.removeEventListener('storage', onStorage);
  }, []);
  useEffect(()=>{
    if (auto) {
      autoRef.current = window.setInterval(()=>{ reload(); }, 5000);
    } else {
      if (autoRef.current) { window.clearInterval(autoRef.current); autoRef.current = null; }
    }
    return ()=> { if (autoRef.current) { window.clearInterval(autoRef.current); autoRef.current = null; } };
  }, [auto]);

  const kinds = ['invoke','start_job','cancel_job','assignments.update'];

  const onExport = () => {
    const rows = (data||[]).map((e)=>[
      new Date(e.time).toISOString(), e.kind, e.actor, e.target,
      e.meta?.game_id||'', e.meta?.env||'', e.meta?.trace_id||''
    ]);
    rows.unshift(['time','kind','actor','target','game_id','env','trace_id']);
    const content = rows.map((r)=>r.map((x)=>(/[",\n]/.test(String(x))?`"${String(x).replace(/"/g,'""')}"`:String(x))).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (!canRead) {
    return (
      <Card title="Audit">
        <Typography.Text type="secondary">No permission: audit:read</Typography.Text>
      </Card>
    );
  }

  return (
    <Card title="Audit" extra={<GameSelector />}> 
      <Space style={{ marginBottom: 12 }}>
        <Input placeholder="actor" value={filters.actor} onChange={e=>setFilters({...filters, actor:e.target.value||undefined})} />
        <Select allowClear placeholder="kind" style={{ width: 200 }} value={filters.kind} onChange={(v)=>setFilters({...filters, kind:v})}
          options={kinds.map(k=>({label:k, value:k}))} />
        <Input placeholder="limit" style={{ width: 100 }} value={filters.limit} onChange={(e)=>setFilters({...filters, limit: Number(e.target.value)||undefined})} />
        <DatePicker.RangePicker showTime value={timeRange as any} onChange={(v)=> setTimeRange(v as any)} />
        <span>Scope Only</span>
        <Switch checked={useScope} onChange={setUseScope} />
        <Button onClick={reload} type="primary">Search</Button>
        <Button onClick={onExport}>Export CSV</Button>
        <span>Auto Refresh</span>
        <Switch checked={auto} onChange={setAuto} />
        <span>Quick:</span>
        <Space size={4}>
          {kinds.map(k=> (
            <Tag key={k} color={filters.kind===k?'blue':'default'} onClick={()=>setFilters({...filters, kind: (filters.kind===k? undefined : k)})} style={{ cursor:'pointer' }}>{k}</Tag>
          ))}
        </Space>
        <Button onClick={()=>setFilters({ limit: 200, game_id: filters.game_id, env: filters.env })}>Clear</Button>
      </Space>
      <Table rowKey={(r)=>r.hash} loading={loading} dataSource={data}
        pagination={{ pageSize, total, current: page, showSizeChanger: true, onChange:(p,ps)=>{ setPage(p); setPageSize(ps); } }}
        columns={[
          { title: 'time', dataIndex: 'time', render: (t)=> new Date(t).toLocaleString() },
          { title: 'kind', dataIndex: 'kind' },
          { title: 'actor', dataIndex: 'actor' },
          { title: 'target', dataIndex: 'target' },
          { title: 'game', dataIndex: ['meta','game_id'] },
          { title: 'env', dataIndex: ['meta','env'] },
          { title: 'trace', dataIndex: ['meta','trace_id'] },
          { title: 'meta', render: (_:any, r:any)=> <span style={{fontFamily:'monospace'}}>{JSON.stringify(r.meta||{})}</span> },
        ]} />
    </Card>
  );
}
