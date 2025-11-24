const express = require('express');
const path = require('path');

const app = express();
const PORT = 12000;

// 处理React应用的资源文件
app.use('/assets', express.static('dist/renderer/assets'));

// 设置静态文件目录（用于测试页面等）
app.use('/test', express.static('.'));

// 默认路由处理React应用
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/renderer/index.html'));
});

// 特殊路由处理React应用
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/renderer/index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`测试页面: http://0.0.0.0:${PORT}/test/test.html`);
  console.log(`React应用: http://0.0.0.0:${PORT}/`);
});