import React, { useEffect, useState } from 'react';
import { Card, Select, Space, Button, message } from 'antd';
import GameTypeInfo from './GameTypeInfo';
import { loadAnalyticsSpec } from '@/services/analyticsSpec';
import { saveGameMeta } from '@/services/gameMeta';

export interface GameTypeSelectCardProps {
  gameTypeId?: string;
  genreCode?: string;
  onChange?: (nextType: string, nextCode?: string) => void;
  onSave?: (nextType: string, nextCode?: string) => Promise<void> | void;
}

export default function GameTypeSelectCard({ gameTypeId, genreCode, onChange, onSave }: GameTypeSelectCardProps) {
  const [value, setValue] = useState<string | undefined>(gameTypeId);
  const [codeValue, setCodeValue] = useState<string | undefined>(genreCode);
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [codeOptions, setCodeOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    (async () => {
      const spec = await loadAnalyticsSpec();
      const items = (spec.game_types?.game_types || []).map((g: any) => ({ label: `${g.name} (${g.id})`, value: g.id }));
      setOptions(items);
      const genres = (spec.taxonomy?.genres || []).map((x: any) => ({ label: `${x.code} ${x.zh_name || x.name}`.trim(), value: x.code }));
      setCodeOptions(genres);
      if (!genreCode && gameTypeId && Array.isArray(spec.taxonomy?.genres)) {
        const found = spec.taxonomy.genres.find((x: any) => Array.isArray(x.maps_to) && x.maps_to.includes(gameTypeId));
        if (found) setCodeValue(found.code);
      }
    })();
  }, []);

  useEffect(() => setValue(gameTypeId), [gameTypeId]);
  useEffect(() => setCodeValue(genreCode), [genreCode]);

  return (
    <Card size="small" bodyStyle={{ padding: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <span>游戏类型：</span>
          <Select
            showSearch
            allowClear
            placeholder="选择游戏类型"
            style={{ minWidth: 320 }}
            options={options}
            value={value}
            onChange={(v) => {
              setValue(v);
              (async () => {
                const spec = await loadAnalyticsSpec();
                const found = (spec.taxonomy?.genres || []).find((x: any) => Array.isArray(x.maps_to) && x.maps_to.includes(v));
                if (found) setCodeValue(found.code);
              })();
              onChange?.(v!, codeValue);
            }}
            optionFilterProp="label"
          />
          <span>传统分类：</span>
          <Select
            showSearch
            allowClear
            placeholder="选择 genre_code（传统分类）"
            style={{ minWidth: 220 }}
            options={codeOptions}
            value={codeValue}
            onChange={(c) => {
              setCodeValue(c);
              if (value) onChange?.(value, c);
            }}
            optionFilterProp="label"
          />
          <Button
            type="primary"
            onClick={async () => {
              if (!value) { message.warning('请选择游戏类型'); return; }
              try {
                await onSave?.(value, codeValue);
                try { await saveGameMeta((window as any)?.currentGameId || 0, { game_type: value, genre_code: codeValue }); } catch {}
                message.success('已保存');
              } catch (e: any) {
                message.error(e?.message || '保存失败');
              }
            }}
          >保存</Button>
        </Space>
        {value && <GameTypeInfo gameTypeId={value} />}
      </Space>
    </Card>
  );
}
