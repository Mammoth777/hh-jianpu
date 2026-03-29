# Agent Collaboration Hub

> 跨 AI Agent 协作基础设施 — 让 GitHub Copilot、OpenCode、Qwen Code 等工具共享指令、技能和任务。

---

## 架构概览

```
.agents/                              ← 🔵 Hub（单一信源）
├── README.md                        ← 本文件
├── instructions.md                  ← 项目指令（所有 agent 共享）
├── skills/                          ← 技能库（所有 agent 共享）
│   ├── self-improvement/SKILL.md
│   ├── release/SKILL.md
│   ├── bug-fix/SKILL.md
│   ├── clear-todo/SKILL.md
│   └── user-feedback/SKILL.md
└── learnings/                       ← 经验库（所有 agent 共享）
    ├── LEARNINGS.md
    ├── ERRORS.md
    └── FEATURE_REQUESTS.md

.github/                             ← 🟢 GitHub Copilot 适配器
├── copilot-instructions.md          → symlink → ../.agents/instructions.md
├── skills/                          → symlink → ../.agents/skills/
└── prompts/                         ← Copilot 专属 prompt 模板（保留）

.opencode/                           ← 🟡 OpenCode 适配器
└── skills/                          → symlink → ../.agents/skills/

AGENTS.md                            ← 🔴 通用适配器（Claude Code, Qwen 等）
                                        引用 .agents/instructions.md
```

---

## 核心设计原则

### 1. 单一信源 (Single Source of Truth)

所有 agent 共享的内容只在 `.agents/` 中维护一份。各 agent 工具通过 **symlink** 或 **引用** 访问：

| Agent 工具 | 指令来源 | 技能来源 |
|------------|---------|---------|
| GitHub Copilot | `.github/copilot-instructions.md` → symlink | `.github/skills/` → symlink |
| OpenCode | `AGENTS.md` → 引用 | `.opencode/skills/` → symlink |
| Qwen Code | `AGENTS.md` → 引用 | `.agents/skills/` 直接 |
| Claude Code | `AGENTS.md` → 引用 | `.agents/skills/` 直接 |

### 2. 待办清单

用户在根目录 `TODO.md` 中用 checkbox 随手记录待办，说"清空 todo"时 Agent 整理分类并逐一完成。触发 `clear-todo` skill。

---

## 快速使用

### 对于 Agent

任何 agent 在启动会话时应：
1. 读取 `.agents/instructions.md` 获取项目规范
2. 检查根目录 `TODO.md` 是否有待办事项
3. 遇到错误/经验 记录到 `.agents/learnings/`

### 对于开发者

```bash
# 查看当前待办
cat TODO.md

# 添加新 agent 适配器（以 .cursor/ 为例）
ln -s ../.agents/skills .cursor/skills
```

### 添加新 Skill

在 `.agents/skills/` 下创建新目录和 `SKILL.md`，所有 agent 自动可用：

```bash
mkdir -p .agents/skills/my-new-skill
# 编辑 .agents/skills/my-new-skill/SKILL.md
```

---

## 维护者

- **创建时间**: 2026-03-01
- **维护者**: Jachy
