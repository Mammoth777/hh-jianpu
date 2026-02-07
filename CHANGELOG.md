# 更新日志 (CHANGELOG)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 📖 **简谱源码编写说明文档** - 详细的语法规则和示例
  - 完整的元信息、音符、高低八度、变音记号说明
  - 时值（减时线、延长线）、休止符、小节线规则
  - 实用示例和常见问题解答
  - 学习路径和调试技巧
  - 文档位置：`docs/user-guide/notation-syntax.md`

- 🔍 **帮助模态框** - 在页面上查看编写说明
  - 点击顶部栏的「❓ 帮助」按钮打开
  - 响应式设计，支持桌面和移动设备
  - 包含完整的语法规则、示例和常见问题
  - 快速查找功能，方便学习

- 🔧 **可拖动分隔线** - 编辑模式下调整布局
  - 编辑器和预览面板之间可拖动调整宽度
  - 平滑的拖动体验，带视觉反馈
  - 悬停时显示蓝色提示线
  - 拖动时全屏高亮
  - 自动限制最小宽度（300px），防止面板过小
  - 支持桌面设备（移动设备保持原有响应式布局）

### Changed
- 🎨 **编辑器布局优化**
  - 从固定 50/50 分割改为可自定义宽度
  - 提升用户自定义体验

---

## [0.1.0] - 2026-02-07

### Added
- ✨ **核心功能**
  - 简谱文本解析器（Parser）
  - SVG 渲染器（Renderer）
  - 音频播放器（Player with Tone.js）
  
- 🎼 **编辑功能**
  - 实时简谱编辑器
  - 语法错误提示
  - 300ms 防抖优化
  
- ▶️ **播放功能**
  - 音符高亮跟随
  - 速度调节（40-240 BPM）
  - 播放控制（播放/暂停/停止）
  
- 🎨 **用户界面**
  - 双模式切换（编辑/演奏）
  - 响应式布局
  - 极简设计风格
  - 三首示例曲谱
  
- 📚 **文档**
  - 用户需求分析文档
  - 产品设计文档
  - 技术架构文档
  - 测试报告（功能测试、单元测试、最终交付）
  - 开发总结文档
  
- 🧪 **测试**
  - 19 个单元测试（100% 通过）
  - Parser、Renderer、Player 全覆盖
  - 生产构建验证

### Fixed
- 🐛 Parser REST token 未添加到 currentNotes 数组
- 🐛 TypeScript NodeJS.Timeout 浏览器兼容性问题
- 🐛 高低八度识别逻辑错误
- 🐛 测试文件模块解析失败

### Technical
- 📦 **技术栈**
  - TypeScript 5.4.0
  - React 18.3.0
  - Vite 5.4.21
  - Zustand 4.5.0
  - Tone.js 15.0.4
  - Tailwind CSS 3.4.0
  - Vitest 2.1.9
  
- 🏗️ **架构**
  - Monorepo with pnpm workspace
  - Core library + Web application
  - 打包体积：135KB (gzipped)

---

## 版本说明

### v0.1.0 - MVP (Minimum Viable Product)
首个可用版本，包含基础的编辑、渲染和播放功能。

### Unreleased - 增强体验
- 添加用户帮助文档和界面交互优化
- 提升编辑器使用体验

---

## 即将到来

### v0.1.1 - Bug 修复与打磨
- [ ] 移动端真机测试
- [ ] 细节优化
- [ ] 性能监控

### v0.2.0 - 编辑体验升级
- [ ] CodeMirror 6 集成
- [ ] 语法高亮
- [ ] 错误波浪线
- [ ] 本地存储

### v0.3.0 - 高级功能
- [ ] 选段循环播放
- [ ] 变调（移调）功能
- [ ] 导出图片/PDF
- [ ] 打印友好样式

---

**日期格式**: YYYY-MM-DD  
**版本标签**: [版本号] - YYYY-MM-DD
