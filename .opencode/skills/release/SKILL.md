---
name: release
description: 创建版本发布 - 自动更新版本号、CHANGELOG、运行测试、构建并提交
license: MIT
compatibility: opencode,claude
metadata:
  audience: maintainers
  workflow: github
---

## 什么是这个 Skill

这是一个版本发布自动化 skill，用于：
- 自动计算并更新版本号（支持 patch/minor/major）
- 自动更新 CHANGELOG
- 自动运行测试确保无回归
- 自动构建项目
- 自动 git commit 和 tag

## 什么时候使用

当准备发布新版本时使用：
- `skill: release patch` - 发布补丁版本（如 1.0.0 → 1.0.1）
- `skill: release minor` - 发布小版本（如 1.0.0 → 1.1.0）
- `skill: release major` - 发布大版本（如 1.0.0 → 2.0.0）

## 发布前检查清单

在执行发布前，必须确认以下事项：

### 1. 功能完成度
- [ ] 所有计划内的功能已完成
- [ ] CHANGELOG 中 Unreleased 部分已填写完整
- [ ] README.md 功能列表已更新（如有新功能）

### 2. 代码质量
- [ ] 所有单元测试通过：`pnpm test`
- [ ] 构建成功：`pnpm build`
- [ ] 无 lint 错误：`pnpm lint`

### 3. 发布确认
- [ ] 与项目负责人确认发布版本号
- [ ] 确认 CHANGELOG 内容准确无误

## 工作流程

### 步骤 1：检查工作区状态
```bash
git status
```
确保没有未提交的更改，或确认这些更改应该包含在本次发布中。

### 步骤 2：确定版本类型
根据发布内容确定版本类型：
- **patch**：Bug 修复、小优化 → `patch`
- **minor**：新功能、向后兼容的改进 → `minor`
- **major**：破坏性变更、重大重构 → `major`

### 步骤 3：运行发布脚本
```bash
./scripts/release.sh [patch|minor|major]
```

脚本会自动执行：
1. 确认工作区状态
2. 计算新版本号
3. 更新根 package.json 版本
4. 更新子包（packages/core、apps/web）版本
5. 更新 CHANGELOG（将 Unreleased 内容移到新版本）
6. 运行测试
7. 构建项目
8. Git add → commit → tag

### 步骤 4：推送发布
```bash
git push origin main
git push origin v{x.y.z}
```

### 步骤 5：发布完成
- 在 GitHub 创建 Release（可选）
- 通知相关人员

## 注意事项

1. **不要跳过测试**：测试失败必须修复后再发布
2. **先审查 CHANGELOG**：确保内容准确、无误
3. **确认版本号**：大版本发布前与团队确认
4. **处理冲突**：如果 CHANGELOG 有冲突，手动解决后继续
5. **撤销发布**：如果发布后发现严重问题，需要：
   - 删除本地 tag：`git tag -d v{x.y.z}`
   - 删除远程 tag：`git push origin :refs/tags/v{x.y.z}`
   - 撤销 commit：`git reset --hard HEAD~1`
   - 重新修复后再次发布

## 项目特定配置

当前项目使用：
- 包管理：pnpm（monorepo）
- 版本脚本：`./scripts/release.sh`
- 测试命令：`pnpm test`
- 构建命令：`pnpm build`
- Lint 命令：`pnpm lint`

## 常见问题

### Q: 发布脚本需要交互确认怎么办？
A: 在确认无误后输入 `y` 继续。如果想跳过确认直接发布，可以修改脚本或手动执行各步骤。

### Q: 测试失败了怎么办？
A: 停止发布，修复测试问题后重新发布。

### Q: 可以只更新版本号不发布吗？
A: 可以手动修改 package.json，然后手动更新 CHANGELOG。

### Q: 如何查看当前版本？
A: `cat package.json | grep version` 或 `git tag | tail -1`
