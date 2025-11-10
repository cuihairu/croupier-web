import React, { useEffect, useState } from 'react';
import { Table, Typography, Space } from 'antd';
import { listGames, type GameRecord, updateGame } from '@/services/games';
import GameTypeTag from '@/components/analytics/GameTypeTag';
import GameTypeSelectCard from '@/components/analytics/GameTypeSelectCard';

const { Title } = Typography;

export default function GamesTableDemo() {
  const [data, setData] = useState<GameRecord[]>([]);
  const [current, setCurrent] = useState<GameRecord | null>(null);

  useEffect(() => { (async () => setData(await listGames()))(); }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '游戏类型', key: 'game_type', render: (_: any, r: GameRecord) => <GameTypeTag id={r.game_type} /> },
    { title: '分类代码', dataIndex: 'genre_code', key: 'genre_code', width: 120 },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Title level={4} style={{ margin: 0 }}>Games With Types</Title>
      <Table rowKey={(r) => String(r.id)} columns={columns as any} dataSource={data} size="small" onRow={(r) => ({ onClick: () => setCurrent(r) })} />
      {current && (
        <GameTypeSelectCard
          gameTypeId={current.game_type}
          genreCode={current.genre_code}
          onSave={async (t, c) => {
            await updateGame(current.id, { game_type: t, genre_code: c });
            setData(await listGames());
          }}
        />
      )}
    </Space>
  );
}
