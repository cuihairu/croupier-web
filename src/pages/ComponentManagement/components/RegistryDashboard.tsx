import React from 'react';
import { Card } from 'antd';

// 这里重用现有的Registry组件逻辑
// 后续可以根据需要进行增强

export default function RegistryDashboard() {
  return (
    <Card title="注册表管理" bordered={false}>
      <div>
        <p>这里将复用现有的 Registry 页面功能，包括：</p>
        <ul>
          <li>Agent注册状态</li>
          <li>函数覆盖率统计</li>
          <li>连接监控</li>
          <li>性能指标</li>
        </ul>
        <p>可以通过以下方式集成:</p>
        <pre>{`
import Registry from '@/pages/Registry';

export default function RegistryDashboard() {
  return <Registry />;
}
        `}</pre>
      </div>
    </Card>
  );
}