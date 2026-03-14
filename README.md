# Clock Learning App

一个时钟教学应用

使用 React + TypeScript + Vite 构建。

## 功能特性

- 📖 **认识时钟** - 分步教学，学习钟面、时针、分针和秒针
- 🖐️ **自由练习** - 可拖拽的交互式时钟，实时显示时间
- 🎯 **测验模式** - 两种测验模式（看钟说时间、拨钟设时间），四种难度级别
- 🌐 **中英文双语** - 完整的国际化支持
- 🔊 **音效反馈** - 点击、正确、错误的音效提示
- 📱 **响应式设计** - 适配桌面和移动设备

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **CSS Variables** - 样式主题

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── components/       # React 组件
│   ├── Clock.tsx     # 时钟核心组件
│   ├── LearnModule.tsx   # 认识时钟模块
│   ├── PracticeModule.tsx # 自由练习模块
│   ├── QuizModule.tsx     # 测验模块
│   └── Feedback.tsx       # 反馈和动画组件
├── hooks/            # 自定义 Hooks
│   ├── useSoundManager.ts  # 音效管理
│   └── useLanguage.ts     # 国际化管理
├── i18n/             # 国际化
│   └── translations.ts    # 翻译文本
├── types/            # TypeScript 类型定义
│   └── index.ts
├── utils/            # 工具函数
│   └── timeFormat.ts     # 时间格式化
├── App.tsx          # 主应用组件
└── index.css        # 全局样式
```

## 核心组件

### Clock 组件

可交互的 SVG 时钟组件，支持：
- 显示时、分、秒针
- 拖拽调整时间（交互模式）
- 吸附到5分钟刻度
- 实时模式（自动走秒）
- 高亮特定指针或数字

### LearnModule 组件

分步教学模块，包含 5 个步骤：
1. 认识钟面
2. 时针介绍
3. 分针介绍
4. 秒针介绍
5. 时间关系

### PracticeModule 组件

自由练习模块，支持：
- 拖拽调整时钟时间
- 实时显示数字时间和文字时间
- 重置到12:00
- 设置为当前时间
- 吸附到5分钟刻度开关

### QuizModule 组件

测验模块，包含：
- 两种模式：看钟说时间、拨钟设时间
- 四种难度：整点、半点、刻钟、5分钟
- 10道题目
- 分数统计和星星评价
- 答题反馈和正确答案提示

## 自定义

### 修改颜色主题

在 `src/index.css` 中修改 CSS 变量：

```css
:root {
  --color-primary: #4A90D9;
  --color-secondary: #5EC269;
  --color-accent: #FF9F43;
  --color-hour: #3B7DD8;
  --color-minute: #27AE60;
  --color-second: #E74C3C;
  /* ... */
}
```

### 添加翻译

在 `src/i18n/translations.ts` 中添加新的翻译条目：

```typescript
export const translations: Record<string, Record<Language, string>> = {
  'your.key': {
    zh: '中文翻译',
    en: 'English translation'
  }
};
```

## 许可证

MIT
