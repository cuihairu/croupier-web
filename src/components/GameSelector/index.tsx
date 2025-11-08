import React, { useEffect, useMemo, useState } from 'react';
import { Space, Select, Tag } from 'antd';
import { useAccess } from '@umijs/max';
import { listGamesMeta, type Game as GameMeta } from '@/services/croupier/gamesMeta';
import { listGameEnvs } from '@/services/croupier/envs';

const ENVS = ['prod', 'stage', 'test', 'dev'];

export default function GameSelector() {
  const access: any = useAccess?.() || {};
  const canListGames = !!(access.canGamesRead || access.canGamesManage);

  const [games, setGames] = useState<GameMeta[]>([]);
  const [envOptions, setEnvOptions] = useState<string[]>(ENVS);

  const [game, setGame] = useState<string | undefined>(localStorage.getItem('game_id') || undefined);
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(undefined);
  const [env, setEnv] = useState<string | undefined>(localStorage.getItem('env') || 'dev');

  // Load games list if permitted
  useEffect(() => {
    if (!canListGames) return;
    (async () => {
      try {
        const res = await listGamesMeta();
        setGames(res.games || []);
      } catch {}
    })();
  }, [canListGames]);

  // When game changes, persist and try to load envs for that game (if we can match it to an id)
  useEffect(() => {
    if (game) localStorage.setItem('game_id', game);
    const gid = selectedGameId ?? games.find((x) => x.name === game)?.id;
    if (gid) {
      (async () => {
        try {
          const res = await listGameEnvs(gid!);
          const opts = (res.envs || []).map((e) => e.env).filter(Boolean);
          setEnvOptions(opts.length ? opts : ENVS);
        } catch {
          setEnvOptions(ENVS);
        }
      })();
    } else {
      // Fallback to default list if not found
      setEnvOptions(ENVS);
    }
  }, [game, games, selectedGameId]);

  useEffect(() => {
    if (env) localStorage.setItem('env', env);
  }, [env]);

  const gameOptions = useMemo(() => {
    if (!canListGames) {
      return (game ? [game] : []).map((g) => ({ label: g, value: -1, gameName: g }));
    }
    return (games || []).map((g) => ({
      label: `${g.id}:${g.name}` + ((g as any).alias_name ? ` (${(g as any).alias_name})` : ''),
      value: g.id, // use numeric id as unique value to avoid duplicate keys
      gameId: g.id,
      gameName: g.name,
    }));
  }, [games, canListGames, game]);

  return (
    <Space>
      <Tag>Scope</Tag>
      <Select
        placeholder="game_id"
        style={{ minWidth: 200 }}
        showSearch
        allowClear
        value={selectedGameId}
        onChange={(val, opt: any) => {
          const id = typeof val === 'number' ? val : (val ? Number(val) : undefined);
          setSelectedGameId(id as any);
          setGame(opt?.gameName || undefined);
        }}
        options={gameOptions}
        filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
      />
      <Select
        placeholder="env"
        style={{ width: 140 }}
        showSearch
        allowClear
        value={env}
        onChange={setEnv}
        options={envOptions.map((e) => ({ label: e, value: e }))}
        filterOption={(input, option) => (option?.value as string).toLowerCase().includes(input.toLowerCase())}
      />
    </Space>
  );
}
