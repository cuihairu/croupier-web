import React, { useEffect, useState } from 'react';
import { Card, Space, Button, Row, Col, Statistic } from 'antd';
import { fetchAnalyticsRealtime } from '@/services/croupier/analytics';

export default function AnalyticsRealtimePage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await fetchAnalyticsRealtime(); setData(r||{}); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);
  useEffect(()=>{
    if (!auto) return;
    const id = setInterval(load, 5000);
    return ()=> clearInterval(id);
  }, [auto]);

  return (
    <div style={{ padding: 24 }}>
      <Card title="实时大屏" extra={<Space><Button onClick={load} loading={loading}>刷新</Button><Button type={auto?'primary':'default'} onClick={()=> setAuto(x=>!x)}>{auto?'自动刷新:开':'自动刷新:关'}</Button></Space>}>
        <Row gutter={[16,16]}>
          <Col span={6}><Card loading={loading}><Statistic title="实时在线" value={data?.online||0} /></Card></Col>
          <Col span={6}><Card loading={loading}><Statistic title="5分钟活跃" value={data?.active_5m||0} /></Card></Col>
          <Col span={6}><Card loading={loading}><Statistic title="5分钟订单额(分)" value={data?.rev_5m||0} /></Card></Col>
          <Col span={6}><Card loading={loading}><Statistic title="支付成功率" value={data?.pay_succ_rate||0} suffix="%" /></Card></Col>
        </Row>
      </Card>
    </div>
  );
}

