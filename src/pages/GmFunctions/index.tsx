import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Select, Form, Input, InputNumber, Switch, Button, Space, Typography, Divider, message } from 'antd';
import GameSelector from '@/components/GameSelector';
import { listDescriptors, invokeFunction, startJob, cancelJob, FunctionDescriptor } from '@/services/croupier';

const { Text, Paragraph } = Typography;

// Render form items from JSON Schema subset
function renderFormItems(desc?: FunctionDescriptor) {
  const items: any[] = [];
  const props = (desc?.params && desc.params.properties) || {};
  const required: string[] = (desc?.params && desc.params.required) || [];
  for (const key of Object.keys(props)) {
    const schema = props[key] || {};
    const label = required.includes(key) ? (
      <span>
        {key}
        <Text type="danger">*</Text>
      </span>
    ) : (
      key
    );
    let node = <Input />;
    switch (schema.type) {
      case 'integer':
      case 'number':
        node = <InputNumber style={{ width: '100%' }} />;
        break;
      case 'boolean':
        node = <Switch />;
        break;
      default:
        node = <Input />;
    }
    items.push(
      <Form.Item key={key} name={key} label={label} rules={required.includes(key) ? [{ required: true, message: `${key} is required` }] : []}>
        {node}
      </Form.Item>,
    );
  }
  return items;
}

export default function GmFunctionsPage() {
  const [descs, setDescs] = useState<FunctionDescriptor[]>([]);
  const [currentId, setCurrentId] = useState<string>();
  const [invoking, setInvoking] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [events, setEvents] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const [form] = Form.useForm();

  const currentDesc = useMemo(() => descs.find((d) => d.id === currentId), [descs, currentId]);

  useEffect(() => {
    listDescriptors().then((d) => {
      setDescs(d);
      if (d?.length) {
        setCurrentId(d[0].id);
      }
    });
    return () => {
      if (esRef.current) esRef.current.close();
    };
  }, []);

  useEffect(() => {
    // reset form when function changes
    const props = (currentDesc?.params && currentDesc.params.properties) || {};
    const init: any = {};
    Object.keys(props).forEach((k) => (init[k] = undefined));
    form.setFieldsValue(init);
  }, [currentDesc?.id]);

  const onInvoke = async () => {
    try {
      const values = await form.validateFields();
      setInvoking(true);
      const res = await invokeFunction(currentId!, values);
      message.success('Invoke OK');
      setEvents([JSON.stringify(res)]);
    } catch (e: any) {
      if (e?.errorFields) return; // form error
      message.error(e?.message || 'Invoke failed');
    } finally {
      setInvoking(false);
    }
  };

  const onStartJob = async () => {
    try {
      const values = await form.validateFields();
      const res = await startJob(currentId!, values);
      setJobId(res.job_id);
      setEvents([]);
      // open SSE
      if (esRef.current) esRef.current.close();
      const es = new EventSource(`/api/stream_job?id=${encodeURIComponent(res.job_id)}`);
      es.onmessage = (ev) => setEvents((prev) => [...prev, ev.data]);
      es.addEventListener('done', () => es.close());
      es.addEventListener('error', () => es.close());
      esRef.current = es;
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || 'Start job failed');
    }
  };

  const onCancel = async () => {
    if (!jobId) return;
    await cancelJob(jobId);
    message.info('Cancel sent');
  };

  return (
    <Card title="GM Functions" extra={<Text type="secondary">dev</Text>}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <GameSelector />
        <Space>
          <span>Select Function:</span>
          <Select style={{ minWidth: 320 }} value={currentId} onChange={setCurrentId} options={descs.map((d) => ({ label: `${d.id} v${d.version || ''}`, value: d.id }))} />
        </Space>
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 12 }}>
          {renderFormItems(currentDesc)}
        </Form>
        <Space>
          <Button type="primary" onClick={onInvoke} loading={invoking} disabled={!currentId}>
            Invoke
          </Button>
          <Button onClick={onStartJob} disabled={!currentId}>
            Start Job
          </Button>
          <Button onClick={onCancel} danger disabled={!jobId}>
            Cancel Job
          </Button>
        </Space>
        <Divider />
        <Typography>
          <Text strong>Output / Events</Text>
          <Paragraph>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{events.join('\n')}</pre>
          </Paragraph>
        </Typography>
      </Space>
    </Card>
  );
}
