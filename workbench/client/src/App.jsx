import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import ConfigPage from './pages/ConfigPage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import './App.css';

const { Header, Content, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [
    {
      key: 'config',
      label: <Link to="/config">配置管理</Link>,
    },
    {
      key: 'menu',
      label: <Link to="/menu">菜单管理</Link>,
    },
    {
      key: 'order',
      label: <Link to="/order">订单管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          {collapsed ? (
            <MenuUnfoldOutlined
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
            />
          ) : (
            <MenuFoldOutlined
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<div>仪表盘页面</div>} />
            <Route path="/users" element={<div>用户管理页面</div>} />
            <Route path="/settings" element={<div>系统设置页面</div>} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App