import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('ai-receiption', 'root', 'bonjour-Dev@2025', {
  host: '8.153.76.114',
  dialect: 'mysql',
  logging: false
});

// 配置表模型
const Config = sequelize.define('Config', {
  config_key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  config_value: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'configs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 菜单表模型
const MenuItem = sequelize.define('MenuItem', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 订单表模型
const Order = sequelize.define('Order', {
  table_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 订单详情表模型
const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 建立关联关系
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(MenuItem);
MenuItem.hasMany(OrderItem);

export { sequelize, Config, MenuItem, Order, OrderItem };