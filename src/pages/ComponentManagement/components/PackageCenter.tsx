import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, Tag, Modal, Form, Input, Select, Upload, message, Popconfirm, Switch } from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  PoweroffOutlined
} from '@ant-design/icons';

const { Option } = Select;

interface PackageInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  functions: string[];
  installTime: string;
  lastUsed?: string;
  status: 'active' | 'inactive' | 'error';
  dependencies?: string[];
}

export default function PackageCenter() {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'install' | 'edit'>('install');
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/packs/list');
      const data = await response.json();

      // 转换包数据为UI需要的格式 - 添加严格的数据验证
      let packageList: PackageInfo[] = [];

      if (data && Array.isArray(data.packages)) {
        packageList = data.packages.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name || pkg.id,
          version: pkg.version || '1.0.0',
          description: pkg.description || '暂无描述',
          author: pkg.author || '未知',
          enabled: pkg.enabled ?? true,
          functions: Object.keys(pkg.functions || {}),
          installTime: pkg.installTime || new Date().toISOString(),
          status: pkg.enabled ? 'active' : 'inactive',
          dependencies: pkg.dependencies || []
        }));
      } else {
        // API返回错误或格式不正确时，使用空数组
        console.warn('API返回数据格式不正确:', data);
        packageList = [];
      }

      setPackages(packageList);
    } catch (error) {
      message.error('加载组件包列表失败');
      console.error('Load packages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallPackage = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('package', values.file.file);
      formData.append('enabled', values.enabled ? 'true' : 'false');

      const response = await fetch('/api/packs/install', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        message.success('组件包安装成功');
        setModalVisible(false);
        form.resetFields();
        loadPackages();
      } else {
        throw new Error('安装失败');
      }
    } catch (error) {
      message.error('组件包安装失败');
    }
  };

  const handleTogglePackage = async (packageId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/packs/${packageId}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST'
      });

      if (response.ok) {
        message.success(`组件包${enabled ? '启用' : '禁用'}成功`);
        loadPackages();
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      message.error(`组件包${enabled ? '启用' : '禁用'}失败`);
    }
  };

  const handleUninstallPackage = async (packageId: string) => {
    try {
      const response = await fetch(`/api/packs/${packageId}/uninstall`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('组件包卸载成功');
        loadPackages();
      } else {
        throw new Error('卸载失败');
      }
    } catch (error) {
      message.error('组件包卸载失败');
    }
  };

  const handleExportPackage = (packageId: string) => {
    const url = `/api/packs/${packageId}/export`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packageId}.tgz`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns = [
    {
      title: '包名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: PackageInfo) => (
        <Space direction="vertical" size={0}>
          <strong>{name}</strong>
          <span style={{ color: '#666', fontSize: '12px' }}>v{record.version}</span>
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
      title: '函数数量',
      dataIndex: 'functions',
      key: 'functions',
      render: (functions: string[]) => (
        <Tag color="blue">{functions.length} 个函数</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: PackageInfo) => {
        const statusConfig = {
          active: { color: 'success', text: '运行中' },
          inactive: { color: 'default', text: '已停用' },
          error: { color: 'error', text: '错误' }
        };
        return <Tag color={statusConfig[status as keyof typeof statusConfig].color}>
          {statusConfig[status as keyof typeof statusConfig].text}
        </Tag>;
      }
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '安装时间',
      dataIndex: 'installTime',
      key: 'installTime',
      render: (time: string) => new Date(time).toLocaleDateString()
    },
    {
      title: '启用/禁用',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: PackageInfo) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleTogglePackage(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (text: any, record: PackageInfo) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setModalType('edit');
              setSelectedPackage(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExportPackage(record.id)}
          >
            导出
          </Button>
          <Popconfirm
            title="确定要卸载此组件包吗？"
            description="卸载后所有相关函数将不可用"
            onConfirm={() => handleUninstallPackage(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              卸载
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        title="组件包管理"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalType('install');
                setSelectedPackage(null);
                setModalVisible(true);
              }}
            >
              安装新包
            </Button>
            <Button icon={<UploadOutlined />}>
              从URL安装
            </Button>
            <Button onClick={loadPackages}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个组件包`
          }}
        />
      </Card>

      {/* 安装/编辑弹框 */}
      <Modal
        title={modalType === 'install' ? '安装组件包' : '编辑组件包'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInstallPackage}
          initialValues={{
            enabled: true,
            ...selectedPackage
          }}
        >
          {modalType === 'install' && (
            <Form.Item
              name="file"
              label="组件包文件"
              rules={[{ required: true, message: '请选择组件包文件' }]}
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                accept=".tgz,.tar.gz"
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item
            name="enabled"
            label="安装后启用"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          {modalType === 'edit' && (
            <>
              <Form.Item
                name="name"
                label="包名"
                rules={[{ required: true, message: '请输入包名' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="description"
                label="描述"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {modalType === 'install' ? '安装' : '保存'}
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
      </Modal>
    </div>
  );
}