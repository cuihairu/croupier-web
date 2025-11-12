import React, { useState, useEffect } from 'react';
import {
  Card, Table, Space, Button, Tag, Modal, Form, Input, Select,
  Tree, Tabs, Descriptions, List, Avatar, Typography, Popconfirm,
  Transfer, message, Drawer, Steps, Switch
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  ApartmentOutlined, FunctionOutlined, LinkOutlined,
  SettingOutlined, ApiOutlined, PlayCircleOutlined,
  CopyOutlined, ExportOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface EntityDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  schema: any;
  operations: {
    [key: string]: {
      function: string;
      description: string;
      parameters?: any;
      ui?: any;
    };
  };
  resources?: {
    [key: string]: {
      title: string;
      functions: string[];
      ui?: any;
    };
  };
  relationships?: {
    [key: string]: {
      type: string;
      target: string;
      cardinality: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'draft';
  usageCount: number;
}

interface FunctionInfo {
  id: string;
  name: string;
  description: string;
  parameters: any;
  category: string;
}

export default function VirtualObjectManager() {
  const [entities, setEntities] = useState<EntityDefinition[]>([]);
  const [functions, setFunctions] = useState<FunctionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEntity, setSelectedEntity] = useState<EntityDefinition | null>(null);
  const [composerVisible, setComposerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('entities');
  const [form] = Form.useForm();

  useEffect(() => {
    loadEntities();
    loadFunctions();
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/entities/list');
      const data = await response.json();

      // 模拟数据 (实际从API获取)
      const mockEntities: EntityDefinition[] = [
        {
          id: 'player-entity',
          name: '玩家实体',
          description: '游戏玩家的完整管理实体，包含账户、状态、经济等操作',
          version: '1.0.0',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '玩家ID' },
              nickname: { type: 'string', title: '昵称' },
              level: { type: 'integer', title: '等级' },
              status: { type: 'string', enum: ['active', 'banned', 'suspended'], title: '状态' }
            }
          },
          operations: {
            'get': { function: 'player.get', description: '获取玩家信息' },
            'ban': { function: 'player.ban', description: '封禁玩家' },
            'unban': { function: 'player.unban', description: '解封玩家' },
            'addGold': { function: 'economy.addGold', description: '增加金币' },
            'getInventory': { function: 'inventory.list', description: '获取背包' }
          },
          resources: {
            'player-profile': {
              title: '玩家档案',
              functions: ['player.get', 'player.updateProfile']
            },
            'player-economy': {
              title: '经济管理',
              functions: ['economy.addGold', 'economy.deductGold', 'economy.getBalance']
            }
          },
          relationships: {
            'guild': { type: 'belongsTo', target: 'guild-entity', cardinality: 'one' },
            'items': { type: 'hasMany', target: 'item-entity', cardinality: 'many' }
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          status: 'active',
          usageCount: 1250
        },
        {
          id: 'guild-entity',
          name: '公会实体',
          description: '游戏公会管理实体，支持公会创建、成员管理、活动组织',
          version: '1.2.0',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '公会ID' },
              name: { type: 'string', title: '公会名称' },
              level: { type: 'integer', title: '公会等级' },
              memberCount: { type: 'integer', title: '成员数量' }
            }
          },
          operations: {
            'create': { function: 'guild.create', description: '创建公会' },
            'dissolve': { function: 'guild.dissolve', description: '解散公会' },
            'addMember': { function: 'guild.addMember', description: '添加成员' },
            'removeMember': { function: 'guild.removeMember', description: '移除成员' },
            'levelUp': { function: 'guild.levelUp', description: '升级公会' }
          },
          resources: {
            'guild-management': {
              title: '公会管理',
              functions: ['guild.create', 'guild.dissolve', 'guild.levelUp']
            },
            'member-management': {
              title: '成员管理',
              functions: ['guild.addMember', 'guild.removeMember', 'guild.listMembers']
            }
          },
          relationships: {
            'members': { type: 'hasMany', target: 'player-entity', cardinality: 'many' },
            'leader': { type: 'hasOne', target: 'player-entity', cardinality: 'one' }
          },
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-25T12:45:00Z',
          status: 'active',
          usageCount: 850
        },
        {
          id: 'item-entity',
          name: '道具实体',
          description: '游戏道具管理实体，支持道具创建、属性配置、交易等',
          version: '1.1.0',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', title: '道具ID' },
              name: { type: 'string', title: '道具名称' },
              type: { type: 'string', title: '道具类型' },
              rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary'], title: '稀有度' }
            }
          },
          operations: {
            'create': { function: 'item.create', description: '创建道具' },
            'enhance': { function: 'item.enhance', description: '强化道具' },
            'trade': { function: 'item.trade', description: '道具交易' },
            'decompose': { function: 'item.decompose', description: '分解道具' }
          },
          resources: {
            'item-crafting': {
              title: '道具制作',
              functions: ['item.create', 'item.enhance', 'item.decompose']
            }
          },
          relationships: {
            'owner': { type: 'belongsTo', target: 'player-entity', cardinality: 'one' }
          },
          createdAt: '2024-01-12T14:20:00Z',
          updatedAt: '2024-01-22T09:15:00Z',
          status: 'active',
          usageCount: 2100
        }
      ];

      setEntities(mockEntities);
    } catch (error) {
      message.error('加载虚拟对象失败');
      console.error('Load entities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunctions = async () => {
    try {
      const response = await fetch('/api/descriptors');
      const data = await response.json();

      // 转换函数数据
      const functionList = Object.entries(data || {}).map(([id, desc]: [string, any]) => ({
        id,
        name: desc.name || id,
        description: desc.description || '无描述',
        parameters: desc.parameters || {},
        category: desc.category || 'general'
      }));

      setFunctions(functionList);
    } catch (error) {
      console.error('Load functions error:', error);
    }
  };

  const handleCreateEntity = async (values: any) => {
    try {
      const entityData = {
        id: values.id,
        name: values.name,
        description: values.description,
        version: '1.0.0',
        schema: JSON.parse(values.schema),
        operations: {},
        status: 'draft'
      };

      const response = await fetch('/api/entities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityData)
      });

      if (response.ok) {
        message.success('虚拟对象创建成功');
        setModalVisible(false);
        form.resetFields();
        loadEntities();
      } else {
        throw new Error('创建失败');
      }
    } catch (error) {
      message.error('虚拟对象创建失败');
    }
  };

  const handleDeleteEntity = async (entityId: string) => {
    try {
      const response = await fetch(`/api/entities/${entityId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('虚拟对象删除成功');
        loadEntities();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      message.error('虚拟对象删除失败');
    }
  };

  const handleToggleStatus = async (entityId: string, status: string) => {
    try {
      const response = await fetch(`/api/entities/${entityId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        message.success('状态更新成功');
        loadEntities();
      } else {
        throw new Error('状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const openComposer = (entity?: EntityDefinition) => {
    setSelectedEntity(entity || null);
    setComposerVisible(true);
  };

  const renderEntityTree = (entity: EntityDefinition) => {
    const treeData = [
      {
        title: entity.name,
        key: 'entity',
        icon: <ApartmentOutlined />,
        children: [
          {
            title: `操作 (${Object.keys(entity.operations).length})`,
            key: 'operations',
            icon: <FunctionOutlined />,
            children: Object.entries(entity.operations).map(([key, op]) => ({
              title: `${key} → ${op.function}`,
              key: `op-${key}`,
              icon: <ApiOutlined />,
              isLeaf: true
            }))
          },
          {
            title: `资源 (${Object.keys(entity.resources || {}).length})`,
            key: 'resources',
            icon: <SettingOutlined />,
            children: Object.entries(entity.resources || {}).map(([key, res]) => ({
              title: `${res.title} (${res.functions.length}个函数)`,
              key: `res-${key}`,
              icon: <LinkOutlined />,
              isLeaf: true
            }))
          },
          {
            title: `关系 (${Object.keys(entity.relationships || {}).length})`,
            key: 'relationships',
            icon: <LinkOutlined />,
            children: Object.entries(entity.relationships || {}).map(([key, rel]) => ({
              title: `${key} → ${rel.target} (${rel.type})`,
              key: `rel-${key}`,
              icon: <LinkOutlined />,
              isLeaf: true
            }))
          }
        ]
      }
    ];
    return <Tree treeData={treeData} defaultExpandAll />;
  };

  const entityColumns = [
    {
      title: '实体名称',
      key: 'name',
      render: (text: any, record: EntityDefinition) => (
        <Space direction="vertical" size={0}>
          <strong>{record.name}</strong>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.id} v{record.version}
          </Text>
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作数量',
      key: 'operationCount',
      render: (text: any, record: EntityDefinition) => (
        <Tag color="blue">{Object.keys(record.operations).length} 个操作</Tag>
      )
    },
    {
      title: '资源数量',
      key: 'resourceCount',
      render: (text: any, record: EntityDefinition) => (
        <Tag color="green">{Object.keys(record.resources || {}).length} 个资源</Tag>
      )
    },
    {
      title: '关系数量',
      key: 'relationshipCount',
      render: (text: any, record: EntityDefinition) => (
        <Tag color="orange">{Object.keys(record.relationships || {}).length} 个关系</Tag>
      )
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => <Text code>{count.toLocaleString()}</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: EntityDefinition) => {
        const statusConfig = {
          active: { color: 'success', text: '活跃' },
          inactive: { color: 'default', text: '停用' },
          draft: { color: 'warning', text: '草稿' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <div>
            <Tag color={config.color}>{config.text}</Tag>
            <Switch
              size="small"
              checked={status === 'active'}
              onChange={(checked) =>
                handleToggleStatus(record.id, checked ? 'active' : 'inactive')
              }
            />
          </div>
        );
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (time: string) => new Date(time).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (text: any, record: EntityDefinition) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setModalType('view');
              setSelectedEntity(record);
              setModalVisible(true);
            }}
          >
            查看
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openComposer(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => {
              // 复制实体逻辑
              message.success('实体已复制到剪贴板');
            }}
          >
            复制
          </Button>
          <Popconfirm
            title="确定要删除此虚拟对象吗？"
            description="删除后相关的操作和资源将不可用"
            onConfirm={() => handleDeleteEntity(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <ApartmentOutlined />
            虚拟对象管理
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalType('create');
                setSelectedEntity(null);
                setModalVisible(true);
              }}
            >
              创建虚拟对象
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => openComposer()}
            >
              对象编排器
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={() => message.info('导出功能开发中')}
            >
              导出配置
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="虚拟对象列表" key="entities">
            <Table
              columns={entityColumns}
              dataSource={entities}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个虚拟对象`
              }}
              expandable={{
                expandedRowRender: (record) => (
                  <Card size="small" title="结构视图">
                    {renderEntityTree(record)}
                  </Card>
                ),
                rowExpandable: () => true
              }}
            />
          </TabPane>

          <TabPane tab="关系图谱" key="relationships">
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <ApartmentOutlined style={{ fontSize: 48, color: '#ccc' }} />
                <div style={{ marginTop: 16, color: '#666' }}>
                  关系图谱功能开发中...
                </div>
              </div>
            </Card>
          </TabPane>

          <TabPane tab="使用统计" key="statistics">
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">使用统计面板开发中...</Text>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建/查看Modal */}
      <Modal
        title={modalType === 'create' ? '创建虚拟对象' :
               modalType === 'edit' ? '编辑虚拟对象' : '查看虚拟对象'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={modalType === 'view' ? null : undefined}
        width={800}
      >
        {modalType === 'view' && selectedEntity ? (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="实体ID">{selectedEntity.id}</Descriptions.Item>
                <Descriptions.Item label="名称">{selectedEntity.name}</Descriptions.Item>
                <Descriptions.Item label="版本">{selectedEntity.version}</Descriptions.Item>
                <Descriptions.Item label="状态">{selectedEntity.status}</Descriptions.Item>
                <Descriptions.Item label="使用次数" span={2}>
                  {selectedEntity.usageCount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {selectedEntity.description}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="结构信息" key="structure">
              {renderEntityTree(selectedEntity)}
            </TabPane>
            <TabPane tab="Schema定义" key="schema">
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(selectedEntity.schema, null, 2)}
              </pre>
            </TabPane>
          </Tabs>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateEntity}
            initialValues={selectedEntity || {}}
          >
            <Form.Item
              name="id"
              label="实体ID"
              rules={[{ required: true, message: '请输入实体ID' }]}
            >
              <Input placeholder="例如: player-entity" />
            </Form.Item>

            <Form.Item
              name="name"
              label="实体名称"
              rules={[{ required: true, message: '请输入实体名称' }]}
            >
              <Input placeholder="例如: 玩家实体" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea rows={3} placeholder="描述这个虚拟对象的用途和功能" />
            </Form.Item>

            <Form.Item
              name="schema"
              label="Schema定义"
              rules={[{ required: true, message: '请输入Schema定义' }]}
            >
              <TextArea
                rows={6}
                placeholder="输入JSON Schema定义"
                defaultValue={JSON.stringify({
                  type: 'object',
                  properties: {
                    id: { type: 'string', title: 'ID' },
                    name: { type: 'string', title: '名称' }
                  }
                }, null, 2)}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {modalType === 'create' ? '创建' : '保存'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 对象编排器Drawer */}
      <Drawer
        title="虚拟对象编排器"
        placement="right"
        size="large"
        open={composerVisible}
        onClose={() => setComposerVisible(false)}
      >
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <SettingOutlined style={{ fontSize: 48, color: '#ccc' }} />
          <div style={{ marginTop: 16, color: '#666' }}>
            对象编排器开发中...
          </div>
        </div>
      </Drawer>
    </div>
  );
}