import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Typography,
  Avatar,
  Switch,
  Popconfirm
} from 'antd';
import { getMessage } from '@/utils/antdApp';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  LockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface User {
  key: string;
  username: string;
  description: string;
  roles: string[];
  status: 'active' | 'inactive';
  lastLogin: string;
  createTime: string;
}

// 用户数据（基于我们之前创建的用户配置）
const initialUsers: User[] = [
  {
    key: 'super_admin',
    username: 'super_admin',
    description: '系统超级管理员',
    roles: ['super_admin'],
    status: 'active',
    lastLogin: '2024-01-15 09:00:00',
    createTime: '2024-01-01 00:00:00'
  },
  {
    key: 'admin',
    username: 'admin',
    description: '系统管理员',
    roles: ['admin'],
    status: 'active',
    lastLogin: '2024-01-15 08:30:00',
    createTime: '2024-01-01 00:00:00'
  },
  {
    key: 'project_manager',
    username: 'project_manager',
    description: '项目经理',
    roles: ['project_manager'],
    status: 'active',
    lastLogin: '2024-01-14 17:45:00',
    createTime: '2024-01-02 00:00:00'
  },
  {
    key: 'producer',
    username: 'producer',
    description: '制作人',
    roles: ['producer'],
    status: 'active',
    lastLogin: '2024-01-14 16:20:00',
    createTime: '2024-01-02 00:00:00'
  },
  {
    key: 'tech_lead',
    username: 'tech_lead',
    description: '技术负责人',
    roles: ['tech_lead'],
    status: 'active',
    lastLogin: '2024-01-15 08:45:00',
    createTime: '2024-01-03 00:00:00'
  },
  {
    key: 'senior_dev',
    username: 'senior_dev',
    description: '高级开发工程师',
    roles: ['senior_developer'],
    status: 'active',
    lastLogin: '2024-01-15 09:15:00',
    createTime: '2024-01-03 00:00:00'
  },
  {
    key: 'dev_user',
    username: 'dev_user',
    description: '开发工程师',
    roles: ['developer'],
    status: 'active',
    lastLogin: '2024-01-15 09:10:00',
    createTime: '2024-01-03 00:00:00'
  },
  {
    key: 'test_user',
    username: 'test_user',
    description: '测试工程师',
    roles: ['tester'],
    status: 'active',
    lastLogin: '2024-01-15 08:50:00',
    createTime: '2024-01-03 00:00:00'
  },
  {
    key: 'ops_user',
    username: 'ops_user',
    description: '运维工程师',
    roles: ['ops'],
    status: 'active',
    lastLogin: '2024-01-15 07:30:00',
    createTime: '2024-01-03 00:00:00'
  },
  {
    key: 'game_designer',
    username: 'game_designer',
    description: '游戏策划/设计师',
    roles: ['game_designer'],
    status: 'active',
    lastLogin: '2024-01-14 18:00:00',
    createTime: '2024-01-04 00:00:00'
  },
  {
    key: 'numerical_designer',
    username: 'numerical_designer',
    description: '数值策划',
    roles: ['numerical_designer'],
    status: 'active',
    lastLogin: '2024-01-14 19:30:00',
    createTime: '2024-01-04 00:00:00'
  },
  {
    key: 'operator',
    username: 'operator',
    description: '游戏运营',
    roles: ['operator'],
    status: 'active',
    lastLogin: '2024-01-14 20:15:00',
    createTime: '2024-01-05 00:00:00'
  },
  {
    key: 'gm',
    username: 'gm',
    description: '游戏管理员(GM)',
    roles: ['gm'],
    status: 'active',
    lastLogin: '2024-01-14 22:30:00',
    createTime: '2024-01-05 00:00:00'
  },
  {
    key: 'bot_operator',
    username: 'bot_operator',
    description: '托/机器人操作员',
    roles: ['bot_operator'],
    status: 'active',
    lastLogin: '2024-01-14 23:45:00',
    createTime: '2024-01-05 00:00:00'
  },
  {
    key: 'support',
    username: 'support',
    description: '客服人员',
    roles: ['support'],
    status: 'active',
    lastLogin: '2024-01-15 06:00:00',
    createTime: '2024-01-06 00:00:00'
  }
];

// 角色选项
const roleOptions = [
  { value: 'super_admin', label: '超级管理员', color: '#ff4d4f' },
  { value: 'admin', label: '系统管理员', color: '#fa541c' },
  { value: 'project_manager', label: '项目经理', color: '#fa8c16' },
  { value: 'producer', label: '制作人', color: '#faad14' },
  { value: 'tech_lead', label: '技术负责人', color: '#1890ff' },
  { value: 'senior_developer', label: '高级开发工程师', color: '#13c2c2' },
  { value: 'developer', label: '开发工程师', color: '#52c41a' },
  { value: 'tester', label: '测试工程师', color: '#722ed1' },
  { value: 'ops', label: '运维工程师', color: '#eb2f96' },
  { value: 'game_designer', label: '游戏策划/设计师', color: '#f759ab' },
  { value: 'level_designer', label: '关卡策划', color: '#b37feb' },
  { value: 'system_designer', label: '系统策划', color: '#9254de' },
  { value: 'numerical_designer', label: '数值策划', color: '#ff85c0' },
  { value: 'ui_designer', label: 'UI设计师', color: '#73d13d' },
  { value: 'operator', label: '游戏运营', color: '#95de64' },
  { value: 'marketing', label: '市场营销', color: '#5cdbd3' },
  { value: 'community', label: '社区管理', color: '#69c0ff' },
  { value: 'content_manager', label: '内容管理员', color: '#85a5ff' },
  { value: 'analyst', label: '数据分析师', color: '#ffc069' },
  { value: 'bi_analyst', label: '商业智能分析师', color: '#ffd666' },
  { value: 'user_researcher', label: '用户研究员', color: '#fff566' },
  { value: 'support_manager', label: '客服主管', color: '#d3adf7' },
  { value: 'senior_support', label: '高级客服', color: '#efdbff' },
  { value: 'support', label: '客服人员', color: '#f9f0ff' },
  { value: 'gm', label: '游戏管理员(GM)', color: '#ff7875' },
  { value: 'bot_operator', label: '托/机器人操作员', color: '#ffa39e' },
  { value: 'security', label: '安全专员', color: '#ffbb96' },
  { value: 'auditor', label: '审计员', color: '#ffd591' }
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    let filtered = users;

    if (searchText) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.roles.includes(selectedRole));
    }

    setFilteredUsers(filtered);
  }, [searchText, selectedRole, users]);

  const getRoleColor = (roleName: string) => {
    const role = roleOptions.find(r => r.value === roleName);
    return role?.color || '#1890ff';
  };

  const getRoleLabel = (roleName: string) => {
    const role = roleOptions.find(r => r.value === roleName);
    return role?.label || roleName;
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      description: user.description,
      roles: user.roles,
      status: user.status
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // 编辑用户
        const updatedUsers = users.map(user =>
          user.key === editingUser.key
            ? { ...user, ...values }
            : user
        );
        setUsers(updatedUsers);
        getMessage()?.success('用户信息更新成功');
      } else {
        // 添加新用户
        const newUser: User = {
          key: values.username,
          username: values.username,
          description: values.description,
          roles: values.roles,
          status: values.status || 'active',
          lastLogin: '-',
          createTime: new Date().toLocaleString()
        };
        setUsers([...users, newUser]);
        getMessage()?.success('用户创建成功');
      }

      setModalVisible(false);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDelete = (userKey: string) => {
    const updatedUsers = users.filter(user => user.key !== userKey);
    setUsers(updatedUsers);
    getMessage()?.success('用户删除成功');
  };

  const handleStatusChange = (userKey: string, status: 'active' | 'inactive') => {
    const updatedUsers = users.map(user =>
      user.key === userKey ? { ...user, status } : user
    );
    setUsers(updatedUsers);
    getMessage()?.success(`用户状态已${status === 'active' ? '启用' : '禁用'}`);
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><strong>{text}</strong></div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <div>
          {roles.map(role => (
            <Tag key={role} color={getRoleColor(role)} style={{ marginBottom: '2px' }}>
              {getRoleLabel(role)}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: User) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.key, checked ? 'active' : 'inactive')}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
      filters: [
        { text: '启用', value: 'active' },
        { text: '禁用', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (time: string) => (
        <Text type={time === '-' ? 'secondary' : undefined}>
          {time === '-' ? '从未登录' : time}
        </Text>
      ),
      sorter: (a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.username !== 'super_admin' && (
            <Popconfirm
              title="确定要删除此用户吗？"
              onConfirm={() => handleDelete(record.key)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2}>
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            用户管理
          </Title>
          <Text type="secondary">
            管理系统用户账号，分配角色权限，控制用户状态
          </Text>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="搜索用户名或描述"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="按角色筛选"
            value={selectedRole}
            onChange={setSelectedRole}
            allowClear
            style={{ width: 200 }}
          >
            {roleOptions.map(role => (
              <Option key={role.value} value={role.value}>
                <Tag color={role.color} style={{ margin: 0 }}>{role.label}</Tag>
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加用户
          </Button>
          <div style={{ marginLeft: 'auto' }}>
            <Text type="secondary">
              总计 {filteredUsers.length} 个用户
            </Text>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              placeholder="请输入用户名"
              disabled={!!editingUser}
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入用户描述' }]}
          >
            <Input placeholder="请输入用户描述" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="roles"
            rules={[{ required: true, message: '请选择至少一个角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              optionLabelProp="label"
            >
              {roleOptions.map(role => (
                <Option
                  key={role.value}
                  value={role.value}
                  label={role.label}
                >
                  <Tag color={role.color} style={{ margin: 0 }}>
                    {role.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
