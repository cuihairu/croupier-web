import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Switch, Select, Tag, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getMessage } from '@/utils/antdApp';
import { listUsers, createUser, updateUser, deleteUser, setUserPassword, listRoles, type UserRecord } from '@/services/croupier';

export default function UsersV2() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const roleOptions = useMemo(() => roles.map(r => ({ label: r.name, value: r.name })), [roles]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([listUsers(), listRoles()]);
      setUsers(u.users || []);
      setRoles((r.roles || []).map((x: any) => ({ id: x.id, name: x.name })));
    } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (rec: UserRecord) => { setEditing(rec); form.setFieldsValue({ username: rec.username, display_name: rec.display_name, email: rec.email, phone: (rec as any).phone, active: (rec as any).active, roles: rec.roles || [] }); setModalOpen(true); };
  const openPwd = (rec: UserRecord) => { setEditing(rec); pwdForm.resetFields(); setPwdOpen(true); };

  const submitUser = async () => {
    const v = await form.validateFields();
    try {
      if (editing) {
        await updateUser(editing.id, { display_name: v.display_name, email: v.email, phone: v.phone, active: v.active, roles: v.roles });
        getMessage()?.success('已更新');
      } else {
        const resp = await createUser({ username: v.username, display_name: v.display_name, email: v.email, phone: v.phone, password: v.password, active: v.active, roles: v.roles });
        getMessage()?.success(`已创建 #${resp.id}`);
      }
      setModalOpen(false);
      refresh();
    } catch {}
  };
  const submitPwd = async () => {
    const v = await pwdForm.validateFields();
    if (!editing) return;
    await setUserPassword(editing.id, v.password);
    getMessage()?.success('密码已设置');
    setPwdOpen(false);
  };

  const remove = async (rec: UserRecord) => { await deleteUser(rec.id); getMessage()?.success('已删除'); refresh(); };

  const columns: ColumnsType<UserRecord> = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '显示名', dataIndex: 'display_name', key: 'display_name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '手机', dataIndex: 'phone', key: 'phone' },
    { title: '启用', dataIndex: 'active', key: 'active', render: (v: boolean) => v ? '是' : '否' },
    { title: '角色', dataIndex: 'roles', key: 'roles', render: (arr?: string[]) => (arr||[]).map(r => <Tag key={r}>{r}</Tag>) },
    { title: '操作', key: 'ops', render: (_: any, rec) => (
      <Space>
        <Button size="small" onClick={() => openEdit(rec)}>编辑</Button>
        <Button size="small" onClick={() => openPwd(rec)}>设置密码</Button>
        <Popconfirm title="确定删除该用户？" onConfirm={() => remove(rec)}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="用户管理" extra={<Button type="primary" onClick={openAdd}>新增用户</Button>}>
        <Table rowKey="id" columns={columns} dataSource={users} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editing ? '编辑用户' : '新增用户'} open={modalOpen} onOk={submitUser} onCancel={() => setModalOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical" initialValues={{ active: true }}>
          {!editing && (
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}> <Input /> </Form.Item>
          )}
          <Form.Item label="显示名" name="display_name"> <Input /> </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ type: 'email', message: '邮箱格式不正确' }]}> <Input /> </Form.Item>
          <Form.Item label="手机号" name="phone"> <Input /> </Form.Item>
          {!editing && (
            <Form.Item label="初始密码" name="password"> <Input.Password /> </Form.Item>
          )}
          <Form.Item label="启用" name="active" valuePropName="checked"> <Switch /> </Form.Item>
          <Form.Item label="角色" name="roles"> <Select mode="multiple" options={roleOptions} placeholder="选择角色" /> </Form.Item>
        </Form>
      </Modal>

      <Modal title={`设置密码：${editing?.username || ''}`} open={pwdOpen} onOk={submitPwd} onCancel={() => setPwdOpen(false)} destroyOnHidden>
        <Form form={pwdForm} layout="vertical">
          <Form.Item label="新密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 位' }]}> <Input.Password /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
