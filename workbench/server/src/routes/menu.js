import express from 'express';
import { MenuItem } from '../models/index.js';
import multer from 'multer';
import csv from 'csv-parse';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 上传菜单文件
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传文件' });
  }

  const parser = fs.createReadStream(req.file.path)
    .pipe(csv.parse({ columns: true, trim: true }));

  try {
    for await (const record of parser) {
      await MenuItem.create({
        name: record.name,
        price: parseFloat(record.price),
        category: record.category,
        description: record.description || null
      });
    }

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    res.json({ message: '菜单导入成功' });
  } catch (error) {
    // 删除临时文件
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// 获取所有菜品
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个菜品
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: '菜品不存在' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新菜品
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: '菜品不存在' });
    }
    await menuItem.update(req.body);
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除菜品
router.delete('/:id', async (req, res) => {
  try {
    const result = await MenuItem.destroy({
      where: { id: req.params.id }
    });
    if (!result) {
      return res.status(404).json({ error: '菜品不存在' });
    }
    res.json({ message: '菜品已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;