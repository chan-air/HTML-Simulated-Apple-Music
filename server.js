const express = require('express');
const { diskStorage } = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const CONTROL_PORT = 1000;
const USER_PORT = 1001;

// 创建uploads目录（如果不存在）
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于处理文件上传
const storage = diskStorage({
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
        if (file.mimetype.startsWith('audio/') || 
            ['.mp3', '.wav', '.ogg', '.m4a'].includes(path.extname(file.originalname).toLowerCase())) {
            return cb(null, true);
        }
    }
    // 封面文件
    else if (file.fieldname === 'coverFile') {
        if (file.mimetype.startsWith('image/') ||
            ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(path.extname(file.originalname).toLowerCase())) {
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

// 创建multer实例
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 限制文件大小为50MB
    }
});

// 创建multer实例，结合文件过滤

// 静态文件服务
app.use(express.static('.'));

// 中间件：解析JSON请求体
app.use(express.json());

// 存储音乐数据
let musicData = [];
let playlists = [];

// 路由：获取音乐列表
app.get('/api/music', (req, res) => {
    res.json(musicData);
});

// 路由：创建歌单
app.post('/api/playlist', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: '歌单名称不能为空' });
    }
    
    const newPlaylist = {
        id: Date.now(),
        name,
        description: description || '',
        songs: []
    };
    
    playlists.push(newPlaylist);
    res.json({ message: '歌单创建成功', playlist: newPlaylist });
});

// 路由：获取所有歌单
app.get('/api/playlists', (req, res) => {
    res.json(playlists);
});

// 路由：编辑歌单
app.put('/api/playlist/:id', (req, res) => {
    const playlistId = parseInt(req.params.id);
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex === -1) {
        return res.status(404).json({ error: '歌单不存在' });
    }
    
    const { name, description, songs } = req.body;
    
    if (name !== undefined) playlists[playlistIndex].name = name;
    if (description !== undefined) playlists[playlistIndex].description = description;
    if (songs !== undefined) playlists[playlistIndex].songs = songs;
    
    res.json({ message: '歌单更新成功', playlist: playlists[playlistIndex] });
});

// 路由：添加音乐
app.post('/api/music', (req, res) => {
    const { title, artist, album, coverFile, audioFile, lyricsFile } = req.body;
    
    if (!title || !artist || !audioFile) {
        return res.status(400).json({ error: '音乐信息不全，无法上传' });
    }
    
    const newMusic = {
        id: Date.now(),
        title,
        artist,
        album: album || '',
        coverFile: coverFile || '',
        audioFile,
        lyricsFile: lyricsFile || ''
    };
    
    musicData.push(newMusic);
    res.json({ message: '音乐添加成功', music: newMusic });
});

// 路由：获取播放设置
app.get('/api/settings', (req, res) => {
    // 返回播放设置，例如是否允许切歌等
    res.json({
        allowSkip: true,
        allowSeek: true
    });
});

// 路由：更新播放设置
app.put('/api/settings', (req, res) => {
    const { allowSkip, allowSeek } = req.body;
    // 这里可以存储播放设置到全局变量或其他存储方式
    global.settings = {
        allowSkip: allowSkip !== undefined ? allowSkip : true,
        allowSeek: allowSeek !== undefined ? allowSeek : true
    };
    
    res.json({ message: '播放设置更新成功', settings: global.settings });
});

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

// 启动两个服务器
app.listen(CONTROL_PORT, () => {
    console.log(`控制端服务器运行在 http://localhost:${CONTROL_PORT}`);
});

const userApp = express();
userApp.use(express.static('.'));
userApp.use(express.json());

// 用户端API路由
userApp.get('/api/music', (req, res) => {
    res.json(musicData);
});

userApp.get('/api/playlists', (req, res) => {
    res.json(playlists);
});

userApp.get('/api/settings', (req, res) => {
    // 返回播放设置
    res.json(global.settings || {
        allowSkip: true,
        allowSeek: true
    });
});

userApp.listen(USER_PORT, () => {
    console.log(`用户端服务器运行在 http://localhost:${USER_PORT}`);
});