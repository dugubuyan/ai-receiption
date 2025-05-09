import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/api/orders';
      const params = {};

      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      if (orderStatus) {
        params.status = orderStatus;
      }

      const response = await axios.get(url, { params });
      setOrders(response.data);
    } catch (error) {
      message.error('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange, orderStatus]);

  // 查看订单详情
  const handleViewDetail = (record) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  // 更新订单状态
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, { status });
      message.success('状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '桌号',
      dataIndex: 'table_number',
      key: 'table_number',
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) => `¥${text}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateStatus(record.id, value)}
        >
          <Select.Option value="pending">待处理</Select.Option>
          <Select.Option value="processing">处理中</Select.Option>
          <Select.Option value="completed">已完成</Select.Option>
          <Select.Option value="cancelled">已取消</Select.Option>
        </Select>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const detailColumns = [
    {
      title: '菜品名称',
      dataIndex: ['MenuItem', 'name'],
      key: 'name',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `¥${text}`,
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => `¥${record.price * record.quantity}`,
    },
  ];

  return (
    <Card title="订单管理">
      <Space style={{ marginBottom: 16 }}>
        <RangePicker onChange={setDateRange} />
        <Select
          style={{ width: 120 }}
          placeholder="订单状态"
          allowClear
          onChange={setOrderStatus}
        >
          <Select.Option value="pending">待处理</Select.Option>
          <Select.Option value="processing">处理中</Select.Option>
          <Select.Option value="completed">已完成</Select.Option>
          <Select.Option value="cancelled">已取消</Select.Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <>
            <p>订单号：{selectedOrder.id}</p>
            <p>桌号：{selectedOrder.table_number}</p>
            <p>状态：{selectedOrder.status}</p>
            <p>创建时间：{new Date(selectedOrder.created_at).toLocaleString()}</p>
            <Table
              columns={detailColumns}
              dataSource={selectedOrder.OrderItems}
              rowKey="id"
              pagination={false}
            />
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <h3>总计：¥{selectedOrder.total_amount}</h3>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
};

export default OrderPage;