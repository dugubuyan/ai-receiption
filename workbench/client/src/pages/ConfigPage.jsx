import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Table, Space } from 'antd';
import axios from 'axios';

const ConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取所有配置
  const fetchConfigs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/configs');
      setConfigs(response.data);
    } catch (error) {
      message.error('获取配置失败');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // 更新配置
  const handleUpdate = async (key, value) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/api/configs/${key}`, { value });
      message.success('配置更新成功');
      fetchConfigs();
    } catch (error) {
      message.error('配置更新失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '配置项',
      dataIndex: 'config_key',
      key: 'config_key',
    },
    {
      title: '配置值',
      dataIndex: 'config_value',
      key: 'config_value',
      render: (text, record) => (
        <Form.Item
          style={{ margin: 0 }}
          name={['configs', record.config_key]}
          initialValue={text}
        >
          <Input.TextArea
            autoSize
            onBlur={(e) => handleUpdate(record.config_key, e.target.value)}
          />
        </Form.Item>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <Card title="配置管理">
      <Form form={form} layout="vertical">
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="config_key"
          loading={loading}
          pagination={false}
        />
      </Form>
    </Card>
  );
};

export default ConfigPage;