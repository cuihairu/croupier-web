import React, { useEffect, useState } from 'react';
import { Card, Space, DatePicker, Select, Button, Row, Col, Statistic, Divider, Table } from 'antd';
import { fetchAnalyticsOverview } from '@/services/croupier/analytics';

export default function AnalyticsOverviewPage() {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<any>(null);
  const [channel, setChannel] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [data, setData] = useState<any>({});

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (range && range[0]) params.start = range[0].toISOString();
      if (range && range[1]) params.end = range[1].toISOString();
      if (channel) params.channel = channel;
      if (platform) params.platform = platform;
      const r = await fetchAnalyticsOverview(params);
      setData(r || {});
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const exportCSV = () => {
    try {
      const rows = [
        ['metric','value'],
        ['dau', data?.dau||0],['wau', data?.wau||0],['mau', data?.mau||0],
        ['new_users', data?.new_users||0],
        ['retention_d1', data?.d1||0],['retention_d7', data?.d7||0],['retention_d30', data?.d30||0],
        ['pay_rate', data?.pay_rate||0],['arpu', data?.arpu||0],['arppu', data?.arppu||0],
        ['revenue_cents', data?.revenue_cents||0],
      ];
      const csv = rows.map(r=>r.join(',')).join('\n');
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='overview.csv'; a.click(); URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="概览 KPI" extra={
        <Space>
          <DatePicker.RangePicker showTime value={range as any} onChange={setRange as any} />
          <Select allowClear placeholder="渠道" value={channel} onChange={setChannel} style={{ width: 140 }} options={[]} />
          <Select allowClear placeholder="平台" value={platform} onChange={setPlatform} style={{ width: 140 }} options={[]} />
          <Button type="primary" onClick={load}>查询</Button>
          <Button onClick={exportCSV}>导出 CSV</Button>
        </Space>
      }>
        <Row gutter={[16,16]}>
          <Col span={4}><Card loading={loading}><Statistic title="DAU" value={data?.dau||0} /></Card></Col>
          <Col span={4}><Card loading={loading}><Statistic title="WAU" value={data?.wau||0} /></Card></Col>
          <Col span={4}><Card loading={loading}><Statistic title="MAU" value={data?.mau||0} /></Card></Col>
          <Col span={4}><Card loading={loading}><Statistic title="新增" value={data?.new_users||0} /></Card></Col>
          <Col span={4}><Card loading={loading}><Statistic title="注册用户总数" value={data?.registered_total||0} /></Card></Col>
          <Col span={4}><Card loading={loading}><Statistic title="收入(分)" value={data?.revenue_cents||0} /></Card></Col>
        </Row>
        <Row gutter={[16,16]} style={{ marginTop: 12 }}>
          <Col span={8}><Card loading={loading}><Statistic title="付费率" suffix="%" value={data?.pay_rate||0} /></Card></Col>
          <Col span={8}><Card loading={loading}><Statistic title="ARPU" value={data?.arpu||0} /></Card></Col>
          <Col span={8}><Card loading={loading}><Statistic title="ARPPU" value={data?.arppu||0} /></Card></Col>
        </Row>
        <Divider />
        <Row gutter={[16,16]}>
          <Col span={8}><Card loading={loading}><Statistic title="D1 留存" value={data?.d1||0} suffix="%" /></Card></Col>
          <Col span={8}><Card loading={loading}><Statistic title="D7 留存" value={data?.d7||0} suffix="%" /></Card></Col>
          <Col span={8}><Card loading={loading}><Statistic title="D30 留存" value={data?.d30||0} suffix="%" /></Card></Col>
        </Row>
        <Divider />
        <Card title="时间序列（占位）" size="small">
          <Table size="small" pagination={false} dataSource={(data?.series?.dau||[]).map((p:any,i:number)=>({key:i,time:p[0],value:p[1]}))}
            columns={[{title:'时间',dataIndex:'time'},{title:'DAU',dataIndex:'value'}]}
          />
        </Card>
      </Card>
    </div>
  );
}
