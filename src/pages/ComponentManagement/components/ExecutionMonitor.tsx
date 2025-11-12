import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Space, Button, Tag, Progress, Modal, Typography, Input, Select, DatePicker } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface JobExecution {
  id: string;
  functionId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: number;
  userId: string;
  gameId: string;
  environment: string;
  result?: any;
  error?: string;
  logs?: string[];
  idempotencyKey?: string;
}

export default function ExecutionMonitor() {
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobExecution | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    functionId: '',
    userId: '',
    dateRange: null as any
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    loadExecutions();

    if (realTimeEnabled) {
      startRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [filters, realTimeEnabled]);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.functionId) params.append('function_id', filters.functionId);
      if (filters.userId) params.append('user_id', filters.userId);
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.append('start_time', filters.dateRange[0].toISOString());
        params.append('end_time', filters.dateRange[1].toISOString());
      }

      const response = await fetch(`/api/jobs/list?${params.toString()}`);
      const data = await response.json();

      // 模拟数据（实际应该从API获取）
      const mockExecutions: JobExecution[] = [
        {
          id: 'job_001',
          functionId: 'prom.query',
          status: 'running',
          startTime: new Date(Date.now() - 30000).toISOString(),
          progress: 65,
          userId: 'admin',
          gameId: 'tower-defense',
          environment: 'production',
          idempotencyKey: 'idem_001'
        },
        {
          id: 'job_002',
          functionId: 'player.ban',
          status: 'completed',
          startTime: new Date(Date.now() - 120000).toISOString(),
          endTime: new Date(Date.now() - 90000).toISOString(),
          duration: 30000,
          progress: 100,
          userId: 'gm_user',
          gameId: 'card-game',
          environment: 'production',
          result: { success: true, playerId: 'player123', banDuration: '24h' }
        },
        {
          id: 'job_003',
          functionId: 'http.request',
          status: 'failed',
          startTime: new Date(Date.now() - 300000).toISOString(),
          endTime: new Date(Date.now() - 270000).toISOString(),
          duration: 30000,
          progress: 100,
          userId: 'dev_user',
          gameId: 'rpg-game',
          environment: 'staging',
          error: 'Connection timeout after 30 seconds'
        }
      ];

      setExecutions(mockExecutions);
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    if (eventSourceRef.current) return;

    eventSourceRef.current = new EventSource('/api/jobs/stream');
    eventSourceRef.current.onmessage = (event) => {
      const jobUpdate = JSON.parse(event.data);
      setExecutions(prev => {
        const index = prev.findIndex(job => job.id === jobUpdate.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...jobUpdate };
          return updated;
        } else {
          return [jobUpdate, ...prev];
        }
      });
    };
  };

  const stopRealTimeUpdates = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST'
      });
      if (response.ok) {
        loadExecutions();
      }
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const showJobLogs = async (job: JobExecution) => {
    setSelectedJob(job);
    setLogModalVisible(true);

    // 加载完整日志
    try {
      const response = await fetch(`/api/jobs/${job.id}/logs`);
      const logs = await response.json();
      setSelectedJob(prev => prev ? { ...prev, logs } : null);
    } catch (error) {
      console.error('Failed to load job logs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'processing',
      completed: 'success',
      failed: 'error',
      cancelled: 'default'
    };
    return colors[status as keyof typeof colors];
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text code copyable style={{ fontSize: '12px' }}>
          {id}
        </Text>
      )
    },
    {
      title: '函数',
      dataIndex: 'functionId',
      key: 'functionId',
      render: (functionId: string) => <Tag color="blue">{functionId}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record: JobExecution) => (
        <Progress
          percent={progress}
          size="small"
          status={record.status === 'failed' ? 'exception' : undefined}
          showInfo={false}
        />
      )
    },
    {
      title: '执行时间',
      key: 'duration',
      render: (text: any, record: JobExecution) => {
        if (record.status === 'running') {
          const elapsed = Date.now() - new Date(record.startTime).getTime();
          return formatDuration(elapsed);
        }
        return formatDuration(record.duration);
      }
    },
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => <Text code>{userId}</Text>
    },
    {
      title: '游戏/环境',
      key: 'gameEnv',
      render: (text: any, record: JobExecution) => (
        <Space direction="vertical" size={0}>
          <Tag color="orange">{record.gameId}</Tag>
          <Tag color="geekblue">{record.environment}</Tag>
        </Space>
      )
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      render: (text: any, record: JobExecution) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showJobLogs(record)}
          >
            日志
          </Button>
          {record.status === 'running' && (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleCancelJob(record.id)}
            >
              取消
            </Button>
          )}
          {record.result && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                const blob = new Blob([JSON.stringify(record.result, null, 2)], {
                  type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `result_${record.id}.json`;
                a.click();
              }}
            >
              下载结果
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        title="函数执行监控"
        extra={
          <Space>
            <Button
              type={realTimeEnabled ? 'primary' : 'default'}
              icon={realTimeEnabled ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            >
              {realTimeEnabled ? '暂停实时' : '开启实时'}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadExecutions}>
              刷新
            </Button>
          </Space>
        }
      >
        {/* 过滤器 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="running">运行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
              <Option value="cancelled">已取消</Option>
            </Select>

            <Input
              placeholder="函数ID"
              style={{ width: 150 }}
              value={filters.functionId}
              onChange={(e) => setFilters({ ...filters, functionId: e.target.value })}
            />

            <Input
              placeholder="用户ID"
              style={{ width: 120 }}
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            />

            <RangePicker
              showTime
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={executions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} 个任务`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 日志查看Modal */}
      <Modal
        title={`任务日志 - ${selectedJob?.id}`}
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedJob && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 基本信息 */}
            <Card size="small" title="基本信息">
              <Space wrap>
                <Text>函数: <Tag>{selectedJob.functionId}</Tag></Text>
                <Text>状态: <Tag color={getStatusColor(selectedJob.status)}>{selectedJob.status}</Tag></Text>
                <Text>进度: {selectedJob.progress}%</Text>
                <Text>用户: <Tag>{selectedJob.userId}</Tag></Text>
              </Space>
            </Card>

            {/* 结果/错误 */}
            {selectedJob.result && (
              <Card size="small" title="执行结果">
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {JSON.stringify(selectedJob.result, null, 2)}
                </pre>
              </Card>
            )}

            {selectedJob.error && (
              <Card size="small" title="错误信息">
                <pre style={{ background: '#fff2f0', padding: 12, borderRadius: 4, color: '#a8071a' }}>
                  {selectedJob.error}
                </pre>
              </Card>
            )}

            {/* 执行日志 */}
            <Card size="small" title="执行日志">
              <div
                style={{
                  height: 300,
                  overflow: 'auto',
                  background: '#001529',
                  color: '#fff',
                  padding: 12,
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              >
                {selectedJob.logs?.map((log, index) => (
                  <div key={index}>{log}</div>
                )) || '暂无日志'}
              </div>
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  );
}