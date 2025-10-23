import React, { useEffect, useState } from 'react';
import { Space, Select, Tag } from 'antd';

const ENVS = ['prod', 'stage', 'test', 'dev'];

export default function GameSelector() {
  const [game, setGame] = useState<string | undefined>(localStorage.getItem('game_id') || undefined);
  const [env, setEnv] = useState<string | undefined>(localStorage.getItem('env') || 'dev');

  useEffect(() => {
    if (game) localStorage.setItem('game_id', game);
    if (env) localStorage.setItem('env', env);
  }, [game, env]);

  return (
    <Space>
      <Tag>Scope</Tag>
      <Select
        placeholder="game_id"
        style={{ minWidth: 160 }}
        value={game}
        onChange={setGame}
        options={(game ? [game] : []).map((g) => ({ label: g, value: g }))}
        allowClear
      />
      <Select style={{ width: 120 }} value={env} onChange={setEnv} options={ENVS.map((e) => ({ label: e, value: e }))} />
    </Space>
  );
}

