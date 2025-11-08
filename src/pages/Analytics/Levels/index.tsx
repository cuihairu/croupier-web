import React, { useEffect, useState } from 'react';
import { Card, Space, DatePicker, Input, Button, Table, Tag } from 'antd';
import { fetchAnalyticsLevels } from '@/services/croupier/analytics';

export default function AnalyticsLevelsPage() {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<any>(null);
  const [episode, setEpisode] = useState<string>('');
  const [data, setData] = useState<any>({ funnel: [], per_level: [] });

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { episode };
      if (range && range[0]) params.start = range[0].toISOString();
      if (range && range[1]) params.end = range[1].toISOString();
      const r = await fetchAnalyticsLevels(params);
      setData(r || { funnel: [], per_level: [] });
    } finally { setLoading(false); }
  };
  useEffect(()=>{ /* do not auto-load */ }, []);

  const exportCSV = () => {
    try {
      const rows = [['level','players','win_rate','avg_duration_sec','avg_retries']]
        .concat((data?.per_level||[]).map((x:any)=>[x.level,x.players,x.win_rate,x.avg_duration_sec,x.avg_retries]));
      const csv = rows.map(r=> r.map(x=> String(x??'')).join(',')).join('\n');
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='levels.csv'; a.click(); URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width:'100%' }}>
        <Card title="关卡漏斗" extra={<Space>
          <Input placeholder="章节/地图（可选）" value={episode} onChange={(e)=> setEpisode(e.target.value)} style={{ width: 200 }} />
          <DatePicker.RangePicker value={range as any} onChange={setRange as any} />
          <Button type="primary" onClick={load}>查询</Button>
          <Button onClick={exportCSV}>导出 CSV</Button>
        </Space>}>
          <Table size="small" loading={loading} rowKey={(r:any,i:number)=> i}
            dataSource={data?.funnel||[]}
            columns={[{title:'步骤',dataIndex:'step'},{title:'玩家数',dataIndex:'users'},{title:'转化率',dataIndex:'rate', render:(v:any)=> v!=null? `${v}%`:'-'}]}
            pagination={false}
          />
        </Card>
        <Card title="分关卡统计（胜率/难度/时长/复试）">
          <Table size="small" loading={loading} rowKey={(r:any)=> r.level}
            dataSource={data?.per_level||[]}
            columns={[
              { title:'关卡', dataIndex:'level' },
              { title:'参与人数', dataIndex:'players' },
              { title:'胜率', dataIndex:'win_rate', render:(v:any)=> v!=null? `${v}%`:'-' },
              { title:'平均通关时长(s)', dataIndex:'avg_duration_sec' },
              { title:'平均复试次数', dataIndex:'avg_retries' },
              { title:'难度', render: (_:any,r:any)=> {
                const v = r?.difficulty ?? '-';
                const color = v==='高'?'red': v==='中'?'gold' : 'default';
                return <Tag color={color}>{String(v)}</Tag>;
              }},
            ]}
          />
        </Card>
      </Space>
    </div>
  );
}

