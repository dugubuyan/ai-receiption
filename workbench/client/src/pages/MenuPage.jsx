import React, { useState, useEffect } from 'react';
import { Card, Upload, Button, message, Table, Space, Modal, Form, Input, InputNumber } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // 获取菜单列表
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      message.error('获取菜单失败');
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // 处理文件上传
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await axios.post('http://localhost:3000/api/menu/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('菜单导入成功');
      fetchMenuItems();
    } catch (error) {
      message.error('菜单导入失败');
    } finally {
      setLoading(false);
    }
    return false;
  };

  // 处理编辑
  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/menu/${id}`);
      message.success('删除成功');
      fetchMenuItems();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理更新
  const handleUpdate = async (values) => {
    try {
      await axios.put(`http://localhost:3000/api/menu/${editingItem.id}`, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchMenuItems();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `¥${text}`,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="菜单管理">
      <Upload
        accept=".csv"
        showUploadList={false}
        beforeUpload={handleUpload}
      >
        <Button icon={<UploadOutlined />} loading={loading}>
          上传菜单文件
        </Button>
      </Upload>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={menuItems}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="编辑菜品"
        open={editModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MenuPage;