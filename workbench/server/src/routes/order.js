import express from 'express';
import { Order, OrderItem, MenuItem } from '../models/index.js';

const router = express.Router();

// 创建订单
router.post('/', async (req, res) => {
  try {
    const { table_number, items } = req.body;
    
    // 计算订单总金额
    let total_amount = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      if (!menuItem) {
        return res.status(400).json({ error: `菜品ID ${item.menu_item_id} 不存在` });
      }
      total_amount += menuItem.price * item.quantity;
    }

    // 创建订单
    const order = await Order.create({
      table_number,
      total_amount
    });

    // 创建订单详情
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      await OrderItem.create({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    // 返回创建的订单（包含详情）
    const createdOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [MenuItem]
      }]
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有订单
router.get('/', async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    const where = {};
    
    // 根据状态筛选
    if (status) {
      where.status = status;
    }
    
    // 根据日期范围筛选
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.$lte = new Date(end_date);
      }
    }

    const orders = await Order.findAll({
      where,
      include: [{
        model: OrderItem,
        include: [MenuItem]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个订单
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [MenuItem]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新订单状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取历史订单统计
router.get('/stats/history', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.$lte = new Date(end_date);
      }
    }

    const stats = await Order.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']]
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;