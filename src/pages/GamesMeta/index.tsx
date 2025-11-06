import React, { useEffect, useState } from 'react';
import { Avatar, Upload, App, Space, Button, Typography, Image, Form, Input, Select, Tag } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { assetURL } from '@/utils/url';
import { deleteGame, listGamesMeta, upsertGame, type Game as GameMeta, uploadAsset } from '@/services/croupier';
import { useAccess } from '@umijs/max';
import XResourceTable from '@/components/XResourceTable';
import XEntityForm from '@/components/XEntityForm';
import type { ProColumns } from '@ant-design/pro-components';

const GamesMetaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const access: any = useAccess?.() || {};
  const canManage = !!access.canGamesManage;
  const canRead = !!access.canGamesRead;
  const [data, setData] = useState<GameMeta[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameMeta | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listGamesMeta();
      setData(res?.games || []);
    } catch (e: any) {
      message.error(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // When present, render icons; transform site-relative paths using assetURL
  const looksLikeUrl = (v?: string) => !!v;
  const columns: ProColumns<GameMeta>[] = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      width: 80,
      render: (v) => looksLikeUrl(v) ? (
        <img
          src={assetURL(v)}
          alt=""
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, display: 'block' }}
          onError={(e: any) => { try { e.currentTarget.style.display = 'none'; } catch {} }}
        />
      ) : null,
    },
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name', width: 180, ellipsis: true },
    { title: 'Alias', dataIndex: 'alias_name', width: 140, ellipsis: true },
    { title: 'Homepage', dataIndex: 'homepage', width: 220, render: (v: any) => v ? <a href={assetURL(v)} target="_blank" rel="noreferrer">{v}</a> : null },
    { title: 'Status', dataIndex: 'status', width: 120, render: (v: any) => {
      const color = v === 'online' ? 'green' : v === 'running' ? 'blue' : 'default';
      return v ? <Tag color={color}>{v}</Tag> : null;
    }},
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    { title: 'Updated At', dataIndex: 'updated_at', width: 200 },
  ];

  const handleAdd = () => {
    setCurrentGame(null);
    setModalVisible(true);
  };

  const handleEdit = (record: GameMeta) => {
    setCurrentGame(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: GameMeta) => {
    await deleteGame(record.id!);
    message.success('Deleted');
    load();
  };

  const handleSubmit = async (data: any) => {
    // When editing, carry id so backend updates instead of creating a new row
    const payload = currentGame?.id ? { id: currentGame.id, ...data } : data;
    await upsertGame(payload as any);
    load();
  };

  const basicFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'alias_name', label: 'Alias Name' },
    { name: 'homepage', label: 'Homepage' },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const getInitialValues = (game: GameMeta) => ({
    id: game.id,
    name: game.name,
    alias_name: (game as any).alias_name,
    homepage: (game as any).homepage,
    status: (game as any).status,
    description: game.description,
    icon: game.icon,
  });

  const renderIconSection = (form: any) => {
    const url: string | undefined = form?.getFieldValue?.('icon');
    const fileList = url ? [{ uid: '-1', name: 'icon', status: 'done' as const, url: assetURL(url), thumbUrl: assetURL(url) }] : [];
    return (
      <>
        <Form.Item name="status" label="Status" initialValue={(currentGame as any)?.status || 'online'}>
          <Select
            style={{ maxWidth: 240 }}
            options={[
              { label: 'online',  value: 'online' },
              { label: 'offline', value: 'offline' },
              { label: 'running', value: 'running' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Icon">
          <Upload
            listType="picture-card"
            accept="image/*"
            fileList={fileList as any}
            maxCount={1}
            onRemove={() => { form.setFieldsValue({ icon: '' }); return true; }}
            onPreview={(file) => { const u = (file.url || file.thumbUrl) as string; if (u) window.open(u, '_blank'); }}
            customRequest={async (opts: any) => {
              try {
                const res = await uploadAsset(opts.file as File);
                const next = (res?.URL || res?.url || '').toString();
                if (!next) throw new Error('No URL returned');
                form.setFieldsValue({ icon: next });
                message.success('Icon uploaded');
                opts.onSuccess && opts.onSuccess(res, opts.file);
              } catch (e: any) {
                message.error(e?.message || 'Upload failed');
                opts.onError && opts.onError(e);
              }
            }}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <div style={{ fontSize: 24, color: '#999' }}>+</div>
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
          <Form.Item name="icon" noStyle>
            <Input placeholder="https://... or /uploads/..." allowClear style={{ marginTop: 8, maxWidth: 420 }} />
          </Form.Item>
        </Form.Item>
      </>
    );
  };

  return (
    <div>
      <XResourceTable<GameMeta>
        dataSource={data}
        loading={loading}
        rowKey={(record) => record.id?.toString() || `row-${record.name || Math.random()}`}
        columns={columns}
        onAdd={canManage ? handleAdd : undefined}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDelete : undefined}
        title="游戏列表"
        addButtonText="Add Game"
        deleteConfirmTitle="Delete Game"
        getDeleteConfirmContent={(record) => `Are you sure you want to delete game "${record.name}"?`}
        canAdd={canManage}
        canEdit={canManage}
        canDelete={canManage}
      />

      <XEntityForm<GameMeta>
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={currentGame ? 'Edit Game' : 'Add Game'}
        entity={currentGame}
        onSubmit={handleSubmit}
        basicFields={[...basicFields]}
        getInitialValues={getInitialValues}
        customContent={renderIconSection}
      />
    </div>
  );
};

export default GamesMetaPage;
