import React, { useEffect, useState } from 'react';
import { Card, Table, Space, Input, Select, Button } from 'antd';
import { listAudit, AuditEvent } from '@/services/croupier';
import GameSelector from '@/components/GameSelector';

export default function AuditPage(){
  const [data, setData] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{game_id?: string; env?: string; actor?: string; kind?: string}>({});

  const reload = async ()=>{
    setLoading(true);
    const res = await listAudit({ ...filters, limit: 200 });
    setData(res.events || []);
    setLoading(false);
  };

  useEffect(()=>{ reload(); }, []);

  return (
    <Card title="Audit" extra={<GameSelector />}> 
      <Space style={{ marginBottom: 12 }}>
        <Input placeholder="actor" value={filters.actor} onChange={e=>setFilters({...filters, actor:e.target.value})} />
        <Select allowClear placeholder="kind" style={{ width: 160 }} value={filters.kind} onChange={v=>setFilters({...filters, kind:v})}
          options={["invoke","start_job","cancel_job"].map(k=>({label:k, value:k}))} />
        <Button onClick={reload} type="primary">Search</Button>
      </Space>
      <Table rowKey={(r)=>r.hash} loading={loading} dataSource={data} pagination={{ pageSize: 20 }}
        columns={[
          { title: 'time', dataIndex: 'time', render: (t)=> new Date(t).toLocaleString() },
          { title: 'kind', dataIndex: 'kind' },
          { title: 'actor', dataIndex: 'actor' },
          { title: 'target', dataIndex: 'target' },
          { title: 'game', dataIndex: ['meta','game_id'] },
          { title: 'env', dataIndex: ['meta','env'] },
          { title: 'trace', dataIndex: ['meta','trace_id'] },
        ]} />
    </Card>
  );
}

