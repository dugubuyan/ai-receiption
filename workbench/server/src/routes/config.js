import express from 'express';
import { Config } from '../models/index.js';
import multer from 'multer';
import csv from 'csv-parse';
import fs from 'fs';

const router = express.Router();

// 配置文件上传
const upload = multer({ dest: 'uploads/' });

// 获取所有配置
router.get('/', async (req, res) => {
  try {
    const configs = await Config.findAll();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个配置
router.get('/:key', async (req, res) => {
  try {
    const config = await Config.findOne({
      where: { config_key: req.params.key }
    });
    if (!config) {
      return res.status(404).json({ error: '配置项不存在' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新配置
router.put('/:key', async (req, res) => {
  try {
    const [config, created] = await Config.upsert({
      config_key: req.params.key,
      config_value: req.body.value
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除配置
router.delete('/:key', async (req, res) => {
  try {
    const result = await Config.destroy({
      where: { config_key: req.params.key }
    });
    if (!result) {
      return res.status(404).json({ error: '配置项不存在' });
    }
    res.json({ message: '配置项已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;