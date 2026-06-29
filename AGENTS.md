# Callisto — AI Work Log

> ACG 个人空间桌面应用 | 像素风 | 桌宠 + 仪表盘双模式
> 项目路径: `C:\Users\EDY\Desktop\Callisto` (本地开发用，完成后移至 USB)

## 当前目标

完成 Tauri 2 + React 项目脚手架，实现基础框架可运行。
- [x] Vite + React 19 + TypeScript 初始化
- [x] Tauri 2 Rust 后端脚手架
- [x] 应用图标生成
- [x] Rust 编译验证
- [x] Tauri 完整构建验证 (release)
- [ ] 下一步: 实现桌宠核心

## 技术栈决策

| 层 | 技术 | 原因 |
|---|---|---|
| 桌面框架 | Tauri 2 | 原生性能，<30MB 二进制 |
| 前端 | React 19 + TypeScript + Vite | 生态成熟 |
| 后端 | Rust | 性能、安全性 |
| 数据库 | SQLite (rusqlite) | 便携、零配置 |
| 像素 UI | 自定义 CSS (retro8-ui 风格) | 主题统一 |
| 状态管理 | Zustand | 轻量、TypeScript 友好 |
| 路由 | react-router | 标准方案 |
| 图表 | Chart.js 或 uPlot | 轻量 |

## 功能模块与状态

| 模块 | 优先级 | 状态 | 说明 |
|---|---|---|---|
| 项目脚手架 | P0 | **完成** | Tauri 2 + React 初始化完成, 构建成功 |
| 桌宠核心 | P0 | 未开始 | NekoAI 风格精灵引擎 |
| 番剧/影视/游戏追踪 | P0 | 未开始 | Bangumi/AniList 元数据 |
| 小说写作 | P0 | 未开始 | WorldForge 灵感 |
| 小说阅读 + Boss Key | P0 | 未开始 | EPUB/TXT/PDF |
| 音乐播放器 | P0 | 未开始 | 桌面歌词 + 可视化 |
| 时长统计引擎 | P1 | 未开始 | 游戏/听歌/阅读/番茄钟 |
| 宠物感知系统 | P1 | 未开始 | 活动检测 + 游戏模式 |
| 数据分享/导出 | P2 | 未开始 | 隐私卡片 |
| 像素草地前景 | P2 | 未开始 | Elliot 风格装饰 |
| 内存优化 | P2 | 未开始 | 幽灵模式等 |

## 参考项目

- **AniMeow**: Flutter 追番 app，Bangumi/AniList 双源、日历提醒、统计、Excel 导入导出
- **NekoAI**: Tauri 桌宠，带 AI 聊天
- **WorldForge**: Tauri 小说写作，灵感/角色/世界观/伏笔模块
- **murmur**: PWA 小说写作 studio
- **ncmc**: Rust .ncm 解密工具
- **retro8-ui**: 像素风 CSS 框架

## 架构要点

```
Callisto/
├── src/                  # React 前端
│   ├── components/       # 共享组件 (ui/ layout/ pet/)
│   ├── pages/            # 页面（路由懒加载）
│   ├── stores/           # Zustand stores
│   ├── hooks/            # 自定义 hooks
│   ├── styles/           # 全局样式（像素风）
│   └── types/            # TypeScript 类型
├── src-tauri/            # Rust 后端
│   ├── src/
│   │   ├── main.rs       # 入口
│   │   ├── lib.rs        # Tauri setup + commands
│   │   ├── commands/     # (计划) Tauri commands
│   │   ├── db/           # (计划) 数据库
│   │   ├── tracker/      # (计划) 时长统计
│   │   ├── monitor/      # (计划) 进程/活动检测
│   │   └── audio/        # (计划) 音频处理
│   ├── Cargo.toml
│   └── tauri.conf.json
├── AGENTS.md             # AI 工作日志
└── ARCHITECTURE.md       # 架构设计
```

## 关键约定

- 后端 Rust 处理所有重量级操作：DB、进程检测、文件 I/O
- 前端 React 只负责渲染和用户交互
- 所有数据存储于 SQLite，路径可配置（USB 便携）
- 像素风颜色：#2b1b17（深棕）、#8b6b4a（暖棕）、#d4a574（米色）、#f0d5b0（浅米）、#c0775a（锈红）
- 不添加多余注释（除非必要）

## 最近操作

- 2026-06-29: 项目脚手架完成 - Vite + React + Tauri 2 + 图标生成, 构建成功
- 2026-06-29: AGENTS.md + ARCHITECTURE.md 创建
- 2026-06-29: 时长统计与宠物感知系统设计文档 (E:\Temp\opencode\时长统计与互动系统.md)
- 2026-06-29: Git init + first commit
