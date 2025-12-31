const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 创建uploads目录（如果不存在）
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于处理文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 文件保存目录
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
    // 音频文件
    if (file.fieldname === 'audioFile') {
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || 
            path.extname(file.originalname).toLowerCase() === '.mp3' ||
            path.extname(file.originalname).toLowerCase() === '.wav') {
            return cb(null, true);
        }
    }
    // 封面文件
    else if (file.fieldname === 'coverFile') {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ||
            path.extname(file.originalname).toLowerCase() === '.jpg' ||
            path.extname(file.originalname).toLowerCase() === '.jpeg' ||
            path.extname(file.originalname).toLowerCase() === '.png') {
            return cb(null, true);
        }
    }
    // 歌词文件
    else if (file.fieldname === 'lyricsFile') {
        if (path.extname(file.originalname).toLowerCase() === '.lrc' ||
            path.extname(file.originalname).toLowerCase() === '.ttml' ||
            file.mimetype === 'text/plain') {
            return cb(null, true);
        }
    }
    
    // 如果不是允许的类型，拒绝文件
    cb(new Error('不支持的文件类型'));
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 限制文件大小为50MB
    }
});

// 静态文件服务
app.use(express.static('.'));

// 处理文件上传
app.post('/upload', upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverFile', maxCount: 1 },
    { name: 'lyricsFile', maxCount: 1 }
]), (req, res) => {
    try {
        const files = req.files;
        const result = {};
        
        // 检查是否有错误
        if (!files) {
            return res.status(400).json({ error: '没有上传任何文件' });
        }
        
        // 处理音频文件
        if (files.audioFile) {
            result.audioFile = {
                originalName: files.audioFile[0].originalname,
                filename: files.audioFile[0].filename,
                path: files.audioFile[0].path,
                size: files.audioFile[0].size,
                mimetype: files.audioFile[0].mimetype
            };
        }
        
        // 处理封面文件
        if (files.coverFile) {
            result.coverFile = {
                originalName: files.coverFile[0].originalname,
                filename: files.coverFile[0].filename,
                path: files.coverFile[0].path,
                size: files.coverFile[0].size,
                mimetype: files.coverFile[0].mimetype
            };
        }
        
        // 处理歌词文件
        if (files.lyricsFile) {
            result.lyricsFile = {
                originalName: files.lyricsFile[0].originalname,
                filename: files.lyricsFile[0].filename,
                path: files.lyricsFile[0].path,
                size: files.lyricsFile[0].size,
                mimetype: files.lyricsFile[0].mimetype
            };
        }
        
        res.json({
            message: '文件上传成功',
            files: result
        });
    } catch (error) {
        console.error('上传错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('上传目录: /uploads');
});