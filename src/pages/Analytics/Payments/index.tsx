import React, { useEffect, useState } from 'react';
import { Card, Space, DatePicker, Select, Button, Table, Tag } from 'antd';
import { exportToXLSX } from '@/utils/export';
import { fetchAnalyticsPaymentsSummary, fetchAnalyticsTransactions } from '@/services/croupier/analytics';

export default function AnalyticsPaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<any>(null);
  const [channel, setChannel] = useState<string>('');
  const [summary, setSummary] = useState<any>({ totals:{}, by_channel:[], by_product:[] });
  const [tx, setTx] = useState<any>({ transactions: [], total: 0 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { page, size };
      if (range && range[0]) params.start = range[0].toISOString();
      if (range && range[1]) params.end = range[1].toISOString();
      if (channel) params.channel = channel;
      const s = await fetchAnalyticsPaymentsSummary(params);
      setSummary(s || { totals:{}, by_channel:[], by_product:[] });
      const t = await fetchAnalyticsTransactions(params);
      setTx(t || { transactions: [], total: 0 });
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [page, size]);

  return (
    <div style={{ padding: 24 }}>
      <Card title="支付分析" extra={<Space>
        <DatePicker.RangePicker value={range as any} onChange={setRange as any} />
        <Select allowClear placeholder="渠道" value={channel} onChange={setChannel} style={{ width: 140 }} options={[]} />
        <Button type="primary" onClick={()=> { setPage(1); load(); }}>查询</Button>
      </Space>}>
        <Space size={16} wrap>
          <Tag color="blue">收入(分): {summary?.totals?.revenue_cents||0}</Tag>
          <Tag color="gold">退款(分): {summary?.totals?.refunds_cents||0}</Tag>
          <Tag color="red">失败数: {summary?.totals?.failed||0}</Tag>
          <Tag>成功率: {summary?.totals?.success_rate||0}%</Tag>
        </Space>
        <Table style={{ marginTop: 12 }} size="small" loading={loading}
          rowKey={(r:any,i:number)=> i}
          dataSource={tx?.transactions||[]}
          columns={[{title:'时间',dataIndex:'time'},{title:'订单',dataIndex:'order_id'},{title:'用户',dataIndex:'user_id'},{title:'金额(分)',dataIndex:'amount_cents'},{title:'状态',dataIndex:'status'},{title:'渠道',dataIndex:'channel'},{title:'原因',dataIndex:'reason'}]}
          pagination={{ current: page, pageSize: size, total: tx?.total||0, showSizeChanger: true, onChange:(p,ps)=>{ setPage(p); setSize(ps||20);} }}
        />
        <div style={{ marginTop: 8 }}>
          <Button onClick={async ()=>{
            const rows = [['time','order_id','user_id','amount_cents','status','channel','reason']].concat((tx?.transactions||[]).map((r:any)=>[r.time,r.order_id,r.user_id,r.amount_cents,r.status,r.channel,r.reason]));
            await exportToXLSX('payments.xlsx', [{ sheet:'transactions', rows }]);
          }}>导出 Excel</Button>
        </div>
      </Card>
    </div>
  );
}
