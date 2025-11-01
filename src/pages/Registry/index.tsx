import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Space, Typography, Button, message, Tag } from 'antd';
import GameSelector from '@/components/GameSelector';
import { fetchRegistry } from '@/services/croupier';

export default function RegistryPage() {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [assigns, setAssigns] = useState<Record<string, string[]>>({});
  const [coverage, setCoverage] = useState<any[]>([]);
  const [gameId, setGameId] = useState<string | undefined>(localStorage.getItem('game_id') || undefined);
  const [env, setEnv] = useState<string | undefined>(localStorage.getItem('env') || undefined);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRegistry();
      setAgents(res.agents || []);
      setFunctions(res.functions || []);
      setAssigns((res as any).assignments || {});
      setCoverage((res as any).coverage || []);
    } catch (e: any) {
      message.error(e?.message || 'Load failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { load().catch(()=>{}); }, []);

  // keep scope in sync
  useEffect(() => {
    const onStorage = () => {
      setGameId(localStorage.getItem('game_id') || undefined);
      setEnv(localStorage.getItem('env') || undefined);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filteredAgents = useMemo(() => {
    return (agents || []).filter((a) => {
      if (gameId && a.GameID !== gameId) return false;
      if (env && a.Env !== env) return false;
      return true;
    });
  }, [agents, gameId, env]);

  const filteredFunctions = useMemo(() => {
    return (functions || []).filter((f) => {
      if (gameId && f.GameID !== gameId) return false;
      return true;
    });
  }, [functions, gameId]);

  const currentAssignKey = useMemo(() => {
    if (!gameId) return undefined;
    return `${gameId}|${env || ''}`;
  }, [gameId, env]);

  const currentCoverage = useMemo(() => {
    if (!currentAssignKey) return undefined;
    return (coverage || []).find((c) => c.game_env === currentAssignKey);
  }, [coverage, currentAssignKey]);

  return (
    <Card title="Registry" extra={<GameSelector />}> 
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Typography.Text>
          Scope: <b>{gameId || '-'}</b> / <b>{env || '-'}</b>
        </Typography.Text>
        <Typography.Text strong>Agents</Typography.Text>
        <Table size="small" rowKey={(r)=>r.AgentID||r.agent_id} loading={loading} dataSource={filteredAgents}
          columns={[
            {title:'agent', dataIndex:'AgentID'},
            {title:'game', dataIndex:'GameID'},
            {title:'env', dataIndex:'Env'},
            {title:'rpc', dataIndex:'RpcAddr'},
            {title:'functions', dataIndex:'Functions'},
            {title:'health', render: (_: any, r: any) => r.Healthy ? <Tag color="green">ok</Tag> : <Tag color="red">expired</Tag>},
            {title:'ttl(sec)', dataIndex:'ExpiresInSec'},
          ]}
          pagination={false} />

        <Typography.Text strong>Functions</Typography.Text>
        <Table size="small" rowKey={(r)=> (r.GameID||r.game_id)+':' +(r.ID||r.id)} loading={loading} dataSource={filteredFunctions}
          columns={[{title:'game', dataIndex:'GameID'}, {title:'id', dataIndex:'ID'}, {title:'agents', dataIndex:'Agents'}]} pagination={false} />

        <Typography.Text strong>Assignments</Typography.Text>
        <div style={{ whiteSpace:'pre-wrap', background:'#fafafa', padding:8, border:'1px solid #eee' }}>{JSON.stringify(assigns, null, 2)}</div>

        <Typography.Text strong>Coverage</Typography.Text>
        {currentCoverage ? (
          <Table
            size="small"
            rowKey={(r)=>r.fn}
            loading={loading}
            dataSource={Object.entries(currentCoverage.functions || {}).map(([fn, cnt]) => ({ fn, cnt }))}
            columns={[
              { title: 'function', dataIndex: 'fn', render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { title: 'agents', dataIndex: 'cnt', render: (v: number) => v > 0 ? <Tag color="green">{v}</Tag> : <Tag color="red">0</Tag> },
            ]}
            pagination={false}
          />
        ) : (
          <Table size="small" rowKey={(r)=>r.game_env} loading={loading} dataSource={coverage}
            columns={[{title:'game|env', dataIndex:'game_env'}, {title:'functions', render:(_,r)=> <span style={{fontFamily:'monospace'}}>{JSON.stringify(r.functions)}</span>}]}
            pagination={false} />
        )}

        <Button onClick={load}>Reload</Button>
      </Space>
    </Card>
  );
}
