import React, { useEffect, useMemo, useState } from 'react';
import { Card, Descriptions, Divider, Space, Tag, Typography, Empty, Spin } from 'antd';
import { getGameTypeById, getMetricById, loadAnalyticsSpec, type GameType, type MetricDef } from '@/services/analyticsSpec';

const { Title, Paragraph, Text } = Typography;

export interface GameTypeInfoProps {
  gameTypeId?: string; // configs 中的 game_types.id
  bordered?: boolean;
}

export default function GameTypeInfo({ gameTypeId, bordered = true }: GameTypeInfoProps) {
  const [loading, setLoading] = useState(true);
  const [gt, setGt] = useState<GameType | undefined>();
  const [metrics, setMetrics] = useState<Record<string, MetricDef>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await loadAnalyticsSpec();
      const g = gameTypeId ? await getGameTypeById(gameTypeId) : undefined;
      // build metrics index
      const defaultIds = g?.recommended_metrics || [];
      const idToDef: Record<string, MetricDef> = {};
      await Promise.all(
        defaultIds.map(async (id) => {
          const m = await getMetricById(id);
          if (m) idToDef[id] = m;
        }),
      );
      if (!mounted) return;
      setGt(g);
      setMetrics(idToDef);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [gameTypeId]);

  const content = useMemo(() => {
    if (!gt) return <Empty description="未配置的游戏类型" />;
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={5} style={{ margin: 0 }}>
          {gt.name} <Text type="secondary">({gt.id})</Text>
        </Title>
        {gt.summary && <Text>{gt.summary}</Text>}
        {gt.description && <Paragraph style={{ marginBottom: 0 }}>{gt.description}</Paragraph>}
        <Descriptions bordered={bordered} size="small" column={1}>
          <Descriptions.Item label="特征">
            <Space wrap>
              {(gt.characteristics || []).map((c) => (
                <Tag key={c} color="blue">
                  {c}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          {gt.aliases && gt.aliases.length > 0 && (
            <Descriptions.Item label="别名">
              <Space wrap>
                {gt.aliases.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          {gt.examples && gt.examples.length > 0 && (
            <Descriptions.Item label="代表作">
              <Space wrap>
                {gt.examples.map((ex) => (
                  <Tag key={ex}>{ex}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="推荐指标">
            <Space wrap>
              {(gt.recommended_metrics || []).map((id) => {
                const m = metrics[id];
                const label = m?.zh_name ? `${m.zh_name} (${id})` : id;
                return (
                  <Tag key={id} color="green">
                    {label}
                  </Tag>
                );
              })}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="推荐事件">
            <Space wrap>
              {(gt.recommended_events || []).map((e) => (
                <Tag key={e} color="default">
                  <code>{e}</code>
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          {gt.breakdowns && gt.breakdowns.length > 0 && (
            <Descriptions.Item label="默认维度">
              <Space wrap>
                {gt.breakdowns.map((d) => (
                  <Tag key={d} color="purple">
                    {d}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Space>
    );
  }, [gt, bordered, metrics]);

  return (
    <Card size="small" bordered={bordered} bodyStyle={{ padding: 16 }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        content
      )}
    </Card>
  );
}
