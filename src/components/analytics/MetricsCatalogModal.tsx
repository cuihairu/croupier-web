import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Input, Table, Typography, Tag, Space, message } from 'antd';
import { loadAnalyticsSpec, MetricDef } from '@/services/analyticsSpec';

const { Text } = Typography;

export interface MetricsCatalogModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MetricsCatalogModal({ open, onClose }: MetricsCatalogModalProps) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [data, setData] = useState<MetricDef[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const spec = await loadAnalyticsSpec();
      setData(spec.metrics?.metrics || []);
      setLoading(false);
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((m) =>
      (m.id || '').toLowerCase().includes(q) ||
      (m.zh_name || '').toLowerCase().includes(q) ||
      (m.zh_desc || '').toLowerCase().includes(q),
    );
  }, [query, data]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 240, render: (v: string) => <Text code>{v}</Text> },
    { title: '指标', dataIndex: 'zh_name', key: 'zh_name', width: 200 },
    { title: '说明', dataIndex: 'zh_desc', key: 'zh_desc' },
    {
      title: '操作', key: 'op', width: 120,
      render: (_: any, r: MetricDef) => (
        <Space>
          <a
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(r.id);
                message.success('已复制指标ID');
              } catch {
                message.info(r.id);
              }
            }}
          >复制ID</a>
        </Space>
      )
    },
  ];

  return (
    <Modal open={open} title="指标目录" onCancel={onClose} onOk={onClose} width={900}>
      <Input.Search placeholder="搜索指标（ID/名称/说明）" allowClear onSearch={setQuery} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: 12 }} />
      <Table rowKey={(r) => r.id} columns={columns as any} dataSource={filtered} loading={loading} size="small" pagination={{ pageSize: 10 }} />
    </Modal>
  );
}
