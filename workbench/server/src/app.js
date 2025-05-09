import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { sequelize } from './models/index.js';
import configRouter from './routes/config.js';
import menuRouter from './routes/menu.js';
import orderRouter from './routes/order.js';

const app = express();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 路由
app.use('/api/configs', configRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', orderRouter);

// 数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    // 同步数据库模型
    return sequelize.sync();
  })
  .then(() => {
    console.log('数据库模型同步成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

export default app;