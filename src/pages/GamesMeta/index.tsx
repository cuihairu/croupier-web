import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, Table, message, Typography, Popconfirm, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { deleteGameMeta, listGameMeta, upsertGameMeta, type GameMeta } from '@/services/croupier';

const GamesMetaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GameMeta[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<GameMeta>();
  const [editing, setEditing] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listGameMeta();
      setData(res?.games || []);
    } catch (e: any) {
      message.error(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns: ColumnsType<GameMeta> = [
    { title: 'Icon', dataIndex: 'icon', width: 64, render: (v) => v ? <Avatar shape="square" src={v} /> : null },
    { title: 'Game ID', dataIndex: 'game_id' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    { title: 'Updated At', dataIndex: 'updated_at', width: 200 },
    {
      title: 'Actions', width: 200,
      render: (_, rec) => (
        <Space>
          <Button size="small" onClick={() => { setEditing(true); form.setFieldsValue(rec); setOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete this game?" onConfirm={async ()=>{ await deleteGameMeta(rec.game_id); message.success('Deleted'); load(); }}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const onAdd = () => {
    setEditing(false);
    form.resetFields();
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      await upsertGameMeta(v);
      message.success(editing ? 'Updated' : 'Created');
      setOpen(false);
      load();
    } catch {}
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onAdd}>Add Game</Button>
        <Typography.Text type="secondary">Manage game id/name/icon/description (DB-backed)</Typography.Text>
      </Space>
      <Table<GameMeta>
        rowKey={(r)=>r.game_id}
        loading={loading}
        columns={columns}
        dataSource={data}
      />
      <Modal
        title={editing ? 'Edit Game' : 'Add Game'}
        open={open}
        onCancel={()=>setOpen(false)}
        onOk={onSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="game_id" label="Game ID" rules={[{ required: true }]}>
            <Input placeholder="unique game identifier" disabled={editing} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="icon" label="Icon URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GamesMetaPage;

