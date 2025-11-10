import React, { useEffect, useState } from 'react';
import { Tag, Tooltip } from 'antd';
import { loadAnalyticsSpec } from '@/services/analyticsSpec';

export default function GameTypeTag({ id }: { id?: string }) {
  const [label, setLabel] = useState<string>(id || '');
  const [summary, setSummary] = useState<string>('');
  useEffect(() => {
    (async () => {
      const spec = await loadAnalyticsSpec();
      const hit = (spec.game_types?.game_types || []).find((g: any) => g.id === id);
      if (hit) {
        setLabel(`${hit.name} (${hit.id})`);
        setSummary(hit.summary || '');
      } else {
        setLabel(id || '');
      }
    })();
  }, [id]);
  return (
    <Tooltip title={summary || undefined}>
      <Tag color="blue">{label}</Tag>
    </Tooltip>
  );
}
