# 音乐文件上传器

一个简单的Web应用，允许用户上传音乐文件、封面图片和歌词文件。

## 功能特性

- 上传音频文件 (.mp3, .wav)
- 上传封面图片 (.jpg, .jpeg, .png)
- 上传歌词文件 (.lrc, .ttml)
- 文件预览功能
- 文件信息显示
- 服务器端文件验证

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Express
- 文件上传：Multer

## 安装和运行

1. 确保已安装 Node.js 和 npm

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动服务器：
   ```bash
   npm start
   # 或者使用 nodemon 进行开发
   npm run dev
   ```

4. 在浏览器中打开 `http://localhost:3000`

## 支持的文件格式

- **音频文件**: .mp3, .wav
- **封面图片**: .jpg, .jpeg, .png
- **歌词文件**: .lrc, .ttml

## 文件上传

上传的文件将保存在 `/uploads` 目录中，系统会自动生成唯一的文件名以避免冲突。

## 项目结构

```
/workspace/
├── index.html          # 前端页面
├── server.js           # Express 服务器
├── package.json        # 项目配置和依赖
├── uploads/            # 上传文件存储目录
└── README.md           # 项目说明
```

## 注意事项

- 文件大小限制为50MB
- 服务器会对上传的文件类型进行验证
- 所有上传的文件都会保存在本地 `uploads` 目录中
