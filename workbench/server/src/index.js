import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const app = express()
const port = process.env.PORT || 30001

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 中间件配置
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' })
})

// 生产环境下服务静态文件
if (process.env.NODE_ENV === 'production') {
  const clientPath = join(__dirname, '../../client/dist')
  app.use(express.static(clientPath))
  
  app.get('*', (req, res) => {
    res.sendFile(join(clientPath, 'index.html'))
  })
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '服务器内部错误' })
})

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})