import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Input, Select, Button, Space } from 'antd';
import { getMessage } from '@/utils/antdApp';
import { addGame, listGames, GameEntry } from '@/services/croupier';
import GameSelector from '@/components/GameSelector';

export default function GameManagePage() {
  const [data, setData] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const reload = async () => {
    setLoading(true);
    try {
      const res = await listGames();
      setData(res.games || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onAdd = async () => {
    try {
      const v = await form.validateFields();
      await addGame(v);
      getMessage()?.success('Added');
      form.resetFields();
      reload();
    } catch (e) {}
  };

  return (
    <Card title="Game Management" extra={<GameSelector />}> 
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form form={form} layout="inline">
          <Form.Item name="game_id" label="game_id" rules={[{ required: true }]}>
            <Input placeholder="e.g. game_kr" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="env" label="env">
            <Select style={{ width: 160 }} allowClear options={["prod","stage","test","dev"].map(e=>({label:e,value:e}))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={onAdd}>Add</Button>
          </Form.Item>
        </Form>
        <Table rowKey={(r)=>r.game_id+"/"+(r.env||"-")} loading={loading} dataSource={data} pagination={false}
          columns={[{title:'game_id', dataIndex:'game_id'}, {title:'env', dataIndex:'env'}]} />
      </Space>
    </Card>
  );
}
