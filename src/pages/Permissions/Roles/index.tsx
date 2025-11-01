import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Descriptions,
  Drawer,
  Badge,
  Input,
  Select,
  message,
  Tooltip,
  Typography
} from 'antd';
import {
  TeamOutlined,
  CrownOutlined,
  CodeOutlined,
  TestTubeOutlined,
  SettingOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  RobotOutlined,
  DesktopOutlined,
  MarketingOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface GameRole {
  key: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  permissions: string[];
  userCount: number;
  icon: React.ReactNode;
  color: string;
}

// 23个游戏团队角色数据
const gameRoles: GameRole[] = [
  // 管理层
  {
    key: 'super_admin',
    name: 'super_admin',
    displayName: '超级管理员',
    description: '系统最高权限，紧急情况处理，重要决策审批',
    category: '管理层',
    permissions: ['*'],
    userCount: 1,
    icon: <CrownOutlined />,
    color: '#ff4d4f'
  },
  {
    key: 'admin',
    name: 'admin',
    displayName: '系统管理员',
    description: '日常系统管理和维护，用户权限分配',
    category: '管理层',
    permissions: ['system:config', 'system:restart', 'user:*', 'game:*', 'function:*'],
    userCount: 2,
    icon: <SettingOutlined />,
    color: '#fa541c'
  },
  {
    key: 'project_manager',
    name: 'project_manager',
    displayName: '项目经理',
    description: '项目进度管理，资源协调，风险控制',
    category: '管理层',
    permissions: ['game:config:read', 'player:query', 'data:report', 'monitor:view'],
    userCount: 3,
    icon: <TeamOutlined />,
    color: '#fa8c16'
  },
  {
    key: 'producer',
    name: 'producer',
    displayName: '制作人',
    description: '产品规划，商业决策，跨部门协调',
    category: '管理层',
    permissions: ['data:*', 'design:view', 'content:view', 'marketing:view'],
    userCount: 2,
    icon: <CrownOutlined />,
    color: '#faad14'
  },
  // 技术团队
  {
    key: 'tech_lead',
    name: 'tech_lead',
    displayName: '技术负责人',
    description: '技术架构设计，团队管理，技术决策',
    category: '技术团队',
    permissions: ['function:*', 'job:*', 'system:monitor', 'monitor:*'],
    userCount: 3,
    icon: <CodeOutlined />,
    color: '#1890ff'
  },
  {
    key: 'senior_developer',
    name: 'senior_developer',
    displayName: '高级开发工程师',
    description: '核心功能开发，代码审查，技术指导',
    category: '技术团队',
    permissions: ['function:*', 'job:*', 'game:config:update', 'monitor:view'],
    userCount: 8,
    icon: <CodeOutlined />,
    color: '#13c2c2'
  },
  {
    key: 'developer',
    name: 'developer',
    displayName: '开发工程师',
    description: '功能开发，Bug修复，单元测试',
    category: '技术团队',
    permissions: ['function:register', 'function:update', 'job:create', 'player:query'],
    userCount: 15,
    icon: <CodeOutlined />,
    color: '#52c41a'
  },
  {
    key: 'tester',
    name: 'tester',
    displayName: '测试工程师',
    description: '功能测试，Bug验证，质量保证',
    category: '技术团队',
    permissions: ['function:test', 'job:create', 'player:create:test', 'design:view'],
    userCount: 6,
    icon: <TestTubeOutlined />,
    color: '#722ed1'
  },
  {
    key: 'ops',
    name: 'ops',
    displayName: '运维工程师',
    description: '系统监控，故障处理，部署发布',
    category: '技术团队',
    permissions: ['system:monitor', 'monitor:*', 'function:deploy', 'security:monitor'],
    userCount: 4,
    icon: <SettingOutlined />,
    color: '#eb2f96'
  },
  // 设计团队
  {
    key: 'game_designer',
    name: 'game_designer',
    displayName: '游戏策划/设计师',
    description: '游戏玩法设计，系统设计，用户体验优化',
    category: '设计团队',
    permissions: ['design:*', 'level:*', 'content:create', 'event:design'],
    userCount: 12,
    icon: <DesktopOutlined />,
    color: '#f759ab'
  },
  {
    key: 'numerical_designer',
    name: 'numerical_designer',
    displayName: '数值策划',
    description: '游戏数值平衡，经济系统设计，奖励机制设计',
    category: '设计团队',
    permissions: ['numerical:*', 'economy:*', 'data:economy', 'reward:config'],
    userCount: 5,
    icon: <BarChartOutlined />,
    color: '#ff85c0'
  },
  {
    key: 'level_designer',
    name: 'level_designer',
    displayName: '关卡策划',
    description: '关卡设计，难度平衡，关卡内容制作',
    category: '设计团队',
    permissions: ['level:*', 'design:level', 'content:level', 'data:level'],
    userCount: 8,
    icon: <DesktopOutlined />,
    color: '#b37feb'
  },
  {
    key: 'system_designer',
    name: 'system_designer',
    displayName: '系统策划',
    description: '游戏系统设计，功能需求定义，系统交互设计',
    category: '设计团队',
    permissions: ['design:system', 'content:system', 'function:view'],
    userCount: 6,
    icon: <DesktopOutlined />,
    color: '#9254de'
  },
  {
    key: 'ui_designer',
    name: 'ui_designer',
    displayName: 'UI设计师',
    description: '用户界面设计，交互设计，视觉效果设计',
    category: '设计团队',
    permissions: ['design:ui', 'content:ui', 'player:query'],
    userCount: 4,
    icon: <DesktopOutlined />,
    color: '#73d13d'
  },
  // 运营团队
  {
    key: 'operator',
    name: 'operator',
    displayName: '游戏运营',
    description: '活动策划，用户运营，数据运营，内容运营',
    category: '运营团队',
    permissions: ['event:*', 'announcement:*', 'mail:system', 'reward:send'],
    userCount: 10,
    icon: <MarketingOutlined />,
    color: '#95de64'
  },
  {
    key: 'marketing',
    name: 'marketing',
    displayName: '市场营销',
    description: '市场推广，用户获取，品牌管理，营销活动',
    category: '运营团队',
    permissions: ['marketing:*', 'data:marketing', 'player:segment'],
    userCount: 5,
    icon: <MarketingOutlined />,
    color: '#5cdbd3'
  },
  {
    key: 'community',
    name: 'community',
    displayName: '社区管理',
    description: '社区维护，用户互动，内容审核，社区活动',
    category: '运营团队',
    permissions: ['community:*', 'player:communicate', 'content:community'],
    userCount: 7,
    icon: <TeamOutlined />,
    color: '#69c0ff'
  },
  {
    key: 'content_manager',
    name: 'content_manager',
    displayName: '内容管理员',
    description: '内容审核，内容发布，内容质量控制',
    category: '运营团队',
    permissions: ['content:*', 'announcement:*', 'audit:content'],
    userCount: 4,
    icon: <EditOutlined />,
    color: '#85a5ff'
  },
  // 数据分析团队
  {
    key: 'analyst',
    name: 'analyst',
    displayName: '数据分析师',
    description: '数据分析，用户行为分析，运营报告',
    category: '数据分析团队',
    permissions: ['data:*', 'player:export', 'economy:analyze'],
    userCount: 6,
    icon: <BarChartOutlined />,
    color: '#ffc069'
  },
  {
    key: 'bi_analyst',
    name: 'bi_analyst',
    displayName: '商业智能分析师',
    description: '商业分析，商业智能报告，决策支持',
    category: '数据分析团队',
    permissions: ['data:*', 'economy:report', 'marketing:analytics'],
    userCount: 3,
    icon: <BarChartOutlined />,
    color: '#ffd666'
  },
  {
    key: 'user_researcher',
    name: 'user_researcher',
    displayName: '用户研究员',
    description: '用户研究，用户体验研究，产品优化建议',
    category: '数据分析团队',
    permissions: ['data:user', 'player:behavior', 'design:research'],
    userCount: 2,
    icon: <EyeOutlined />,
    color: '#fff566'
  },
  // 客服团队
  {
    key: 'support_manager',
    name: 'support_manager',
    displayName: '客服主管',
    description: '客服团队管理，重大问题处理，服务质量控制',
    category: '客服团队',
    permissions: ['support:*', 'player:*', 'ban:*', 'reward:compensation'],
    userCount: 2,
    icon: <CustomerServiceOutlined />,
    color: '#d3adf7'
  },
  {
    key: 'senior_support',
    name: 'senior_support',
    displayName: '高级客服',
    description: '复杂问题处理，新人培训，流程优化',
    category: '客服团队',
    permissions: ['support:*', 'player:update', 'ban:temporary', 'reward:compensation:basic'],
    userCount: 5,
    icon: <CustomerServiceOutlined />,
    color: '#efdbff'
  },
  {
    key: 'support',
    name: 'support',
    displayName: '客服人员',
    description: '日常客服，问题处理，用户沟通',
    category: '客服团队',
    permissions: ['player:query', 'support:ticket', 'mail:support:template'],
    userCount: 12,
    icon: <CustomerServiceOutlined />,
    color: '#f9f0ff'
  },
  // 特殊角色
  {
    key: 'gm',
    name: 'gm',
    displayName: '游戏管理员(GM)',
    description: '游戏内管理，玩家争议处理，游戏秩序维护',
    category: '特殊角色',
    permissions: ['gm:*', 'player:*', 'ban:*', 'reward:*'],
    userCount: 8,
    icon: <SafetyOutlined />,
    color: '#ff7875'
  },
  {
    key: 'bot_operator',
    name: 'bot_operator',
    displayName: '托/机器人操作员',
    description: '游戏托管理，机器人配置，自动化操作',
    category: '特殊角色',
    permissions: ['bot:*', 'player:bot', 'monitor:bot'],
    userCount: 3,
    icon: <RobotOutlined />,
    color: '#ffa39e'
  },
  {
    key: 'security',
    name: 'security',
    displayName: '安全专员',
    description: '安全监控，风险识别，安全事件处理',
    category: '特殊角色',
    permissions: ['security:*', 'ban:*', 'audit:*', 'monitor:security'],
    userCount: 2,
    icon: <SafetyOutlined />,
    color: '#ffbb96'
  },
  {
    key: 'auditor',
    name: 'auditor',
    displayName: '审计员',
    description: '操作审计，合规检查，风险评估',
    category: '特殊角色',
    permissions: ['audit:*', 'data:audit', 'system:audit'],
    userCount: 2,
    icon: <EyeOutlined />,
    color: '#ffd591'
  }
];

export default function RolesPage() {
  const [roles, setRoles] = useState<GameRole[]>(gameRoles);
  const [filteredRoles, setFilteredRoles] = useState<GameRole[]>(gameRoles);
  const [selectedRole, setSelectedRole] = useState<GameRole | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = ['管理层', '技术团队', '设计团队', '运营团队', '数据分析团队', '客服团队', '特殊角色'];

  useEffect(() => {
    let filtered = roles;

    if (searchText) {
      filtered = filtered.filter(role =>
        role.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
        role.description.toLowerCase().includes(searchText.toLowerCase()) ||
        role.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(role => role.category === selectedCategory);
    }

    setFilteredRoles(filtered);
  }, [searchText, selectedCategory, roles]);

  const handleViewRole = (role: GameRole) => {
    setSelectedRole(role);
    setDrawerVisible(true);
  };

  const columns: ColumnsType<GameRole> = [
    {
      title: '角色',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: GameRole) => (
        <Space>
          <span style={{ color: record.color }}>{record.icon}</span>
          <div>
            <div><strong>{text}</strong></div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.name}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '团队',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
      filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Badge
          count={permissions.length}
          style={{ backgroundColor: permissions.includes('*') ? '#ff4d4f' : '#1890ff' }}
        />
      ),
      sorter: (a, b) => a.permissions.length - b.permissions.length,
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />,
      sorter: (a, b) => a.userCount - b.userCount,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: GameRole) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewRole(record)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2}>
            <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            游戏团队角色管理
          </Title>
          <Text type="secondary">
            管理23个专业游戏团队角色，包含管理层、技术、设计、运营、数据分析、客服和特殊角色
          </Text>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="搜索角色名称或描述"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择团队类别"
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
            style={{ width: 200 }}
          >
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
          <div style={{ marginLeft: 'auto' }}>
            <Text type="secondary">
              总计 {filteredRoles.length} 个角色，{roles.reduce((sum, role) => sum + role.userCount, 0)} 个用户
            </Text>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRoles}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Drawer
        title={selectedRole ? `角色详情 - ${selectedRole.displayName}` : '角色详情'}
        placement="right"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedRole && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="角色标识">
                <Space>
                  <span style={{ color: selectedRole.color }}>{selectedRole.icon}</span>
                  <Text code>{selectedRole.name}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="显示名称">
                {selectedRole.displayName}
              </Descriptions.Item>
              <Descriptions.Item label="所属团队">
                <Tag color={selectedRole.color}>{selectedRole.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="角色描述">
                {selectedRole.description}
              </Descriptions.Item>
              <Descriptions.Item label="用户数量">
                <Badge count={selectedRole.userCount} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="权限列表">
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedRole.permissions.map((permission) => (
                    <Tag
                      key={permission}
                      color={permission === '*' ? 'red' : 'blue'}
                      style={{ marginBottom: '4px' }}
                    >
                      {permission}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: '24px' }}>
              <Title level={4}>权限说明</Title>
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                <Text type="secondary">
                  {selectedRole.permissions.includes('*')
                    ? '拥有系统所有权限，请谨慎分配给用户。'
                    : `该角色拥有 ${selectedRole.permissions.length} 个具体权限，遵循最小权限原则。`
                  }
                </Text>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}