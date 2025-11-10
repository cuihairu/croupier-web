import React, { useEffect, useState } from 'react';
import { Card, Col, Input, Row, Space, Tag, Typography } from 'antd';
import GameTypeInfo from '@/components/analytics/GameTypeInfo';
import { loadAnalyticsSpec } from '@/services/analyticsSpec';

const { Title } = Typography;

export default function AnalyticsTypesDemo() {
  const [ids, setIds] = useState<string[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const spec = await loadAnalyticsSpec();
      const all = (spec.game_types?.game_types || []).map((g) => g.id);
      setIds(all);
    })();
  }, []);

  const filtered = ids.filter((id) => id.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={4} style={{ margin: 0 }}>Game Types Preview</Title>
      <Input.Search placeholder="筛选类型 id" onSearch={setQ} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360 }} />
      <Row gutter={[16, 16]}>
        {filtered.map((id) => (
          <Col span={12} key={id}>
            <Card size="small" title={<Tag color="blue">{id}</Tag>}>
              <GameTypeInfo gameTypeId={id} />
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
