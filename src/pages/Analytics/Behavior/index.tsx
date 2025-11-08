import React, { useEffect, useState } from 'react';
import { Card, Space, DatePicker, Input, Button, Table, Select } from 'antd';
import { fetchAnalyticsEvents, fetchAnalyticsFunnel } from '@/services/croupier/analytics';

export default function AnalyticsBehaviorPage() {
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState<string>('');
  const [propKey, setPropKey] = useState<string>('');
  const [propVal, setPropVal] = useState<string>('');
  const [range, setRange] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { event: eventName, prop_key: propKey, prop_val: propVal };
      if (range && range[0]) params.start = range[0].toISOString();
      if (range && range[1]) params.end = range[1].toISOString();
      const r = await fetchAnalyticsEvents(params);
      setRows(r?.events || []);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ /* do not auto-load to avoid 404s before backend ready */ }, []);

  const [steps, setSteps] = useState<string[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const loadFunnel = async () => {
    setLoading(true);
    try { const r = await fetchAnalyticsFunnel({ steps: steps.join(',') }); setFunnel(r?.steps||[]); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width:'100%' }}>
        <Card title="事件探索" extra={<Space>
          <Input placeholder="事件名" value={eventName} onChange={(e)=> setEventName(e.target.value)} style={{ width:160 }} />
          <Input placeholder="属性Key" value={propKey} onChange={(e)=> setPropKey(e.target.value)} style={{ width:140 }} />
          <Input placeholder="属性值" value={propVal} onChange={(e)=> setPropVal(e.target.value)} style={{ width:140 }} />
          <DatePicker.RangePicker value={range as any} onChange={setRange as any} />
          <Button type="primary" onClick={load}>查询</Button>
        </Space>}>
          <Table size="small" loading={loading} rowKey={(r)=> r.id || `${r.event||''}-${r.time||''}`}
            dataSource={rows} columns={[{title:'时间',dataIndex:'time'},{title:'事件',dataIndex:'event'},{title:'用户',dataIndex:'user_id'}]} />
        </Card>

        <Card title="漏斗（占位）" extra={<Space>
          <Select mode="tags" placeholder="步骤（事件名）" value={steps} onChange={setSteps as any} style={{ minWidth: 360 }} />
          <Button type="primary" onClick={loadFunnel}>计算</Button>
        </Space>}>
          <Table size="small" pagination={false} dataSource={(funnel||[]).map((s:any,i:number)=>({key:i, step:s.step, users:s.users, rate:s.rate }))}
            columns={[{title:'步骤',dataIndex:'step'},{title:'人数',dataIndex:'users'},{title:'转化率',dataIndex:'rate', render:(v)=> v!=null? `${v}%`:'-'}]}
          />
        </Card>
      </Space>
    </div>
  );
}

