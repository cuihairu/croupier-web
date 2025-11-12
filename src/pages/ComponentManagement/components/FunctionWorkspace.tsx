import React from 'react';
import { Card } from 'antd';

// 这里重用现有的GmFunctions组件逻辑
// 后续可以根据需要进行增强

export default function FunctionWorkspace() {
  return (
    <Card title="函数工作台" bordered={false}>
      <div>
        <p>这里将复用现有的 GmFunctions 页面功能，包括：</p>
        <ul>
          <li>函数调用表单</li>
          <li>参数配置</li>
          <li>执行结果展示</li>
          <li>历史记录</li>
        </ul>
        <p>可以通过以下方式集成:</p>
        <pre>{`
import GmFunctions from '@/pages/GmFunctions';

export default function FunctionWorkspace() {
  return <GmFunctions />;
}
        `}</pre>
      </div>
    </Card>
  );
}