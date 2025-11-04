import React, { useEffect, useState } from 'react';
import { Avatar, Upload, App, Space, Button, Popconfirm } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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

  const columns: ProColumns<GameMeta>[] = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      width: 64,
      render: (v) => v ? <Avatar shape="square" src={v} /> : null
    },
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name' },
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
    await upsertGame(data as any);
    load();
  };

  const basicFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const getInitialValues = (game: GameMeta) => ({
    name: game.name,
    description: game.description,
    icon: game.icon,
  });

  const renderIconUpload = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Upload
        multiple={false}
        showUploadList={false}
        beforeUpload={(file) => {
          const max = 120 * 1024 * 1024; // 120MB
          if (file.size > max) {
            message.error('File is too large (max 120MB)');
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
        customRequest={async (opts: any) => {
          try {
            const res = await uploadAsset(opts.file as File);
            message.success('Uploaded');
            opts.onSuccess && opts.onSuccess(res, opts.file);
          } catch (e: any) {
            message.error(e?.message || 'Upload failed');
            opts.onError && opts.onError(e);
          }
        }}
      >
        <Button icon={<UploadOutlined />}>Upload Icon</Button>
      </Upload>
    </Space>
  );

  return (
    <div>
      <XResourceTable<GameMeta>
        dataSource={data}
        loading={loading}
        rowKey="id"
        columns={columns}
        onAdd={canManage ? handleAdd : undefined}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDelete : undefined}
        title="Game Metadata Management"
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
        basicFields={[
          ...basicFields,
          { name: 'icon', label: 'Icon URL', placeholder: 'https://...' }
        ]}
        getInitialValues={getInitialValues}
        extraFooterButtons={[renderIconUpload()]}
      />
    </div>
  );
};

export default GamesMetaPage;
