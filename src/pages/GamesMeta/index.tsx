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
      message.error(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // When present, render icons; transform site-relative paths using assetURL
  const looksLikeUrl = (v?: string) => !!v;
  const columns: ProColumns<GameMeta>[] = [
    {
      title: '图标',
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
    { title: '名称', dataIndex: 'name', width: 180, ellipsis: true },
    { title: '别名', dataIndex: 'alias_name', width: 140, ellipsis: true },
    { title: '主页', dataIndex: 'homepage', width: 220, render: (v: any) => v ? <a href={assetURL(v)} target="_blank" rel="noreferrer">{v}</a> : null },
    { title: '状态', dataIndex: 'status', width: 120, render: (v: any) => {
      const colorMap: any = { online: 'green', running: 'blue', dev: 'orange', test: 'purple', maintenance: 'gold', offline: 'default' };
      const textMap: any = { online: '在线', running: '运行中', dev: '开发', test: '测试', maintenance: '维护', offline: '下线' };
      const color = colorMap[v] || 'default';
      const text = textMap[v] || v;
      return v ? <Tag color={color}>{text}</Tag> : null;
    }},
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '更新时间', dataIndex: 'updated_at', width: 200 },
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
    message.success('已删除');
    load();
  };

  const handleSubmit = async (data: any) => {
    // When editing, carry id so backend updates instead of creating a new row
    const payload = currentGame?.id ? { id: currentGame.id, ...data } : data;
    await upsertGame(payload as any);
    load();
  };

  const basicFields = [
    { name: 'name', label: '名称', required: true, rules: [{ required: true, message: '请输入名称' }] },
    { name: 'alias_name', label: '别名' },
    { name: 'homepage', label: '主页' },
    { name: 'description', label: '描述', type: 'textarea' as const },
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

  const renderIconSection = (outerForm: any) => {
    // Use a shouldUpdate block so we interact with form only after it is mounted/connected
    return (
      <>
        <Form.Item name="status" label="状态" initialValue={(currentGame as any)?.status || 'dev'}>
          <Select
            style={{ maxWidth: 240 }}
            options={[
              { label: '开发', value: 'dev' },
              { label: '测试', value: 'test' },
              { label: '运行中', value: 'running' },
              { label: '在线',  value: 'online' },
              { label: '维护', value: 'maintenance' },
              { label: '下线', value: 'offline' },
            ]}
          />
        </Form.Item>
        <Form.Item label="图标">
          <Form.Item noStyle shouldUpdate>
            {(innerForm: any) => {
              const url: string | undefined = innerForm?.getFieldValue?.('icon');
              const fileList = url ? [{ uid: '-1', name: 'icon', status: 'done' as const, url: assetURL(url), thumbUrl: assetURL(url) }] : [];
              return (
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  fileList={fileList as any}
                  maxCount={1}
                  onRemove={() => { innerForm.setFieldsValue({ icon: '' }); return true; }}
                  onPreview={(file) => { const u = (file.url || file.thumbUrl) as string; if (u) window.open(u, '_blank'); }}
                  customRequest={async (opts: any) => {
                    try {
                      const res = await uploadAsset(opts.file as File);
                      const next = (res?.URL || res?.url || '').toString();
                      if (!next) throw new Error('未返回URL');
                      innerForm.setFieldsValue({ icon: next });
                      message.success('图标已上传');
                      opts.onSuccess && opts.onSuccess(res, opts.file);
                    } catch (e: any) {
                      message.error(e?.message || '上传失败');
                      opts.onError && opts.onError(e);
                    }
                  }}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <div style={{ fontSize: 24, color: '#999' }}>+</div>
                      <div style={{ marginTop: 8 }}>上传</div>
                    </div>
                  )}
                </Upload>
              );
            }}
          </Form.Item>
          <Form.Item name="icon" noStyle>
            <Input placeholder="https://... 或 /uploads/..." allowClear style={{ marginTop: 8, maxWidth: 420 }} />
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
        addButtonText="新增游戏"
        deleteConfirmTitle="删除游戏"
        getDeleteConfirmContent={(record) => `确认删除游戏 "${record.name}" 吗？`}
        canAdd={canManage}
        canEdit={canManage}
        canDelete={canManage}
      />

      <XEntityForm<GameMeta>
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={currentGame ? '编辑游戏' : '新增游戏'}
        entity={currentGame}
        onSubmit={handleSubmit}
        basicFields={[...basicFields]}
        getInitialValues={getInitialValues}
        customContent={renderIconSection}
        submitButtonText="保存"
        cancelButtonText="取消"
        successMessage="保存成功"
        failureMessage="保存失败"
      />
    </div>
  );
};

export default GamesMetaPage;
