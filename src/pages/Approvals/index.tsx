import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Space, Button, Drawer, Descriptions, Select, Input, Modal } from 'antd';
import { getMessage } from '@/utils/antdApp';
import { request } from '@umijs/max';

type Approval = {
  ID: string;
  CreatedAt: string;
  Actor: string;
  FunctionID: string;
  GameID?: string;
  Env?: string;
  State: 'pending' | 'approved' | 'rejected';
  Mode: 'invoke' | 'start_job';
  Route?: string;
};

export default function ApprovalsPage() {
  const [data, setData] = useState<Approval[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [state, setState] = useState<string>('pending');
  const [functionId, setFunctionId] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');
  const [env, setEnv] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<any>();
  const [preview, setPreview] = useState<string>('');
  const [descs, setDescs] = useState<any[]>([]);
  const descMap = useMemo(()=>{
    const m: Record<string, any> = {};
    (descs||[]).forEach((d: any)=>{ if (d?.id) m[d.id] = d; });
    return m;
  }, [descs]);

  async function list() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (state) qs.set('state', state);
    if (functionId) qs.set('function_id', functionId);
    if (gameId) qs.set('game_id', gameId);
    if (env) qs.set('env', env);
    qs.set('page', String(page));
    qs.set('size', String(size));
    let json: any;
    try {
      json = await request('/api/approvals', { params: Object.fromEntries(qs as any) });
    } catch (e: any) { getMessage()?.error(e?.message || 'List failed'); setLoading(false); return; }
    setData(json.approvals || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  async function view(id: string) {
    let json: any;
    try { json = await request('/api/approvals/get', { params: { id } }); } catch (e: any) { getMessage()?.error(e?.message || 'Get failed'); return; }
    setCurrent(json);
    setPreview(json.payload_preview || '');
    setOpen(true);
  }

  async function approve(id: string) {
    const a = data.find(x=>x.ID===id);
    const desc = a ? descMap[a.FunctionID] : undefined;
    const risk = (desc?.risk || '').toString().toLowerCase();
    const needConfirm = risk === 'high';
    if (needConfirm) {
      // Require typing the function id as a simple safeguard
      const text = window.prompt(`High risk function. Type the function id to confirm: ${a?.FunctionID || ''}`) || '';
      if ((a?.FunctionID || '') && text.trim() !== a?.FunctionID) { getMessage()?.warning('Confirmation text mismatch'); return; }
    }
    const otp = window.prompt('OTP code (if required, leave empty if not set)') || '';
    try { await request('/api/approvals/approve', { method: 'POST', data: { id, otp } }); } catch (e: any) { getMessage()?.error(e?.message || 'Approve failed'); return; }
    getMessage()?.success('Approved');
    await list();
    await view(id);
  }

  async function reject(id: string) {
    const reason = window.prompt('Reject reason?') || '';
    try { await request('/api/approvals/reject', { method: 'POST', data: { id, reason } }); } catch (e: any) { getMessage()?.error(e?.message || 'Reject failed'); return; }
    getMessage()?.success('Rejected');
    await list();
    await view(id);
  }

  useEffect(() => { list(); }, [page, size, state]);
  useEffect(() => { request('/api/descriptors').then((d)=>setDescs(d||[])).catch(()=>{}); }, []);

  return (
    <Card title="Approvals">
      <Space style={{ marginBottom: 16 }} wrap>
        <span>State:</span>
        <Select style={{ width: 160 }} value={state} onChange={setState}
          options={[{label:'(all)',value:''},{label:'pending',value:'pending'},{label:'approved',value:'approved'},{label:'rejected',value:'rejected'}]}/>
        <Input placeholder="Function ID" value={functionId} onChange={(e)=>setFunctionId(e.target.value)} style={{ width: 240 }} />
        <Input placeholder="Game" value={gameId} onChange={(e)=>setGameId(e.target.value)} style={{ width: 160 }} />
        <Input placeholder="Env" value={env} onChange={(e)=>setEnv(e.target.value)} style={{ width: 120 }} />
        <Button onClick={()=>{ setPage(1); list(); }}>Load</Button>
      </Space>
      <Table
        rowKey="ID"
        loading={loading}
        dataSource={data}
        pagination={{ current: page, pageSize: size, total, onChange: (p, ps)=>{ setPage(p); setSize(ps); } }}
        columns={[
          { title: 'Created', dataIndex: 'CreatedAt' },
          { title: 'Actor', dataIndex: 'Actor' },
          { title: 'Function', dataIndex: 'FunctionID', render: (v)=>{
            const d = descMap[v];
            const risk = (d?.risk||'').toString().toLowerCase();
            const tags: any[] = [];
            if (risk) tags.push(<Tag key="risk" color={risk==='high'?'red':'gold'}>{risk}</Tag>);
            if (risk==='high') tags.push(<Tag key="otp" color="blue">OTP</Tag>);
            return <Space size={4}>{v}{tags}</Space>;
          } },
          { title: 'Game/Env', render: (_, r)=> `${r.GameID||''}/${r.Env||''}` },
          { title: 'State', dataIndex: 'State', render: (v)=> <Tag color={v==='pending'?'gold':v==='approved'?'green':'red'}>{v}</Tag> },
          { title: 'Mode', dataIndex: 'Mode' },
          { title: 'Route', dataIndex: 'Route' },
          { title: 'Actions', render: (_, r)=> (
            <Space>
              <Button size="small" onClick={()=>view(r.ID)}>View</Button>
              {r.State==='pending' && <Button size="small" type="primary" onClick={()=>approve(r.ID)}>Approve</Button>}
              {r.State==='pending' && <Button size="small" danger onClick={()=>reject(r.ID)}>Reject</Button>}
            </Space>
          )},
        ]}
      />
      <Drawer title={`Approval ${current?.id || current?.ID || ''}`} width={640} open={open} onClose={()=>setOpen(false)}>
        {current && (
          <>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Actor">{current.actor || current.Actor}</Descriptions.Item>
              <Descriptions.Item label="Function">{current.function_id || current.FunctionID}</Descriptions.Item>
              <Descriptions.Item label="Game/Env">{(current.game_id||current.GameID)||''}/{(current.env||current.Env)||''}</Descriptions.Item>
              <Descriptions.Item label="State">{current.state || current.State}</Descriptions.Item>
              <Descriptions.Item label="Mode">{current.mode || current.Mode}</Descriptions.Item>
              <Descriptions.Item label="Route">{current.route || current.Route}</Descriptions.Item>
              <Descriptions.Item label="Idempotency">{current.idempotency_key || current.IdempotencyKey}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginTop: 16 }}>Payload Preview</h4>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f6', padding: 8, border: '1px solid #eee' }}>{preview}</pre>
          </>
        )}
      </Drawer>
    </Card>
  );
}
