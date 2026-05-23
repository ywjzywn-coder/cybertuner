# CyberTuner Design System

> **风格定义**: 现代极客极简风（Modern Geek Minimalist）  
> **技术栈**: 纯 CSS 自定义属性（CSS Custom Properties），无 Tailwind  
> **主题策略**: Light / Dark 双模式，支持 `prefers-color-scheme` 自动检测 + 手动切换

---

## 1. Color Palette 色彩系统

所有颜色通过 CSS 自定义属性（`--variable`）定义于 `:root`，暗色模式通过 `body.dark-theme` 类覆盖。

### 1.1 背景色 Background

| Token                  | Light Mode  | Dark Mode   | 用途                     |
|------------------------|-------------|-------------|--------------------------|
| `--bg-body`            | `#f7f7f5`   | `#111111`   | 页面底色（暖灰/深岩灰）  |
| `--bg-surface`         | `#ffffff`   | `#1e1e1e`   | 卡片/容器表面            |
| `--bg-surface-hover`   | `#f0f0f0`   | `#2a2a2a`   | 悬停态/内嵌区域背景      |

### 1.2 文字色 Text

| Token                  | Light Mode  | Dark Mode   | 用途                     |
|------------------------|-------------|-------------|--------------------------|
| `--text-primary`       | `#111111`   | `#f5f5f5`   | 标题、主要内容文字       |
| `--text-secondary`     | `#666666`   | `#a0a0a0`   | 副标题、辅助说明         |
| `--text-tertiary`      | `#999999`   | `#666666`   | 最弱层级（频率数值等）   |

### 1.3 边框色 Border

| Token                  | Light Mode  | Dark Mode   | 用途                     |
|------------------------|-------------|-------------|--------------------------|
| `--border-color`       | `#e5e5e5`   | `#333333`   | 默认卡片/分割线边框      |
| `--border-active`      | `#111111`   | `#f5f5f5`   | 选中/激活态边框          |

### 1.4 强调色 Accent

| Token                  | 色值        | 用途                               |
|------------------------|-------------|------------------------------------|
| `--accent-orange`      | `#ff4f00`   | **主强调色**。CTA按钮、音准完美指示 |
| `--accent-orange:hover`| `#e64700`   | 主按钮悬停态                       |
| `--accent-green`       | `#00a651`   | **成功/达标色**。调音完美、引擎就绪 |
| `--accent-dark`        | `#2d2d2d` / `#3a3a3a` | 次级按钮背景（Light/Dark） |

### 1.5 阴影 Shadows

| Token                  | Light Mode                         | Dark Mode                          |
|------------------------|------------------------------------|------------------------------------|
| `--shadow-sm`          | `0 1px 2px rgba(0,0,0,0.05)`      | `0 1px 2px rgba(0,0,0,0.5)`       |
| `--shadow-md`          | `0 4px 12px rgba(0,0,0,0.08)`     | `0 4px 12px rgba(0,0,0,0.5)`      |
| Console Card Inset     | `inset 0 2px 8px rgba(0,0,0,0.02)`| `inset 0 2px 8px rgba(0,0,0,0.2)` |

---

## 2. Typography 排版系统

### 2.1 字体栈 Font Stacks

```css
--font-mono: 'IBM Plex Mono', 'Courier New', monospace;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Google Fonts 引用：**
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

> **设计原则**: 等宽字体 `IBM Plex Mono` 用于所有**数据展示、标签、标题**，营造终端/仪器感；无衬线字体 `Inter` 仅用于**正文段落和按钮文字**，保证可读性。

### 2.2 字号层级 Type Scale

| 角色                | 字体族           | 字号      | 字重   | 行高   | 附加属性                |
|---------------------|------------------|-----------|--------|--------|-------------------------|
| **大号数据展示**    | `--font-mono`    | `56px`    | `500`  | `1`    | `letter-spacing: -2px`  |
| **移动端大号数据**  | `--font-mono`    | `48px`    | `500`  | `1`    | `letter-spacing: -2px`  |
| **H1 品牌标题**     | `--font-mono`    | `18px`    | `600`  | 默认   | `letter-spacing: -0.5px`|
| **移动端 H1**       | `--font-mono`    | `16px`    | `600`  | 默认   | 同上                    |
| **副标题/Cents**    | `--font-mono`    | `14px`    | `400`  | 默认   | —                       |
| **CTA 按钮**        | `--font-sans`    | `14px`    | `600`  | 默认   | `letter-spacing: 0.5px; text-transform: uppercase` |
| **次级按钮**        | `--font-sans`    | `13px`    | `500`  | 默认   | —                       |
| **正文/Guide**      | `--font-sans`    | `13px`    | `400`  | `1.6`  | —                       |
| **下拉选择器**      | `--font-mono`    | `11px`    | `400`  | 默认   | —                       |
| **Section 标题**    | `--font-mono`    | `11px`    | `500`  | 默认   | `letter-spacing: 1px; text-transform: uppercase` |
| **品牌副标题**      | `--font-mono`    | `10px`    | `400`  | 默认   | `letter-spacing: 0.5px; text-transform: uppercase` |
| **频率/最小标注**   | `--font-mono`    | `10-11px` | `400`  | 默认   | `color: --text-tertiary`|

---

## 3. UI Characteristics 组件特征

### 3.1 Border Radius 圆角

| Token          | 数值     | 用途                              |
|----------------|----------|-----------------------------------|
| `--radius-sm`  | `6px`    | 按钮、下拉框、琴弦卡片、输入框   |
| `--radius-md`  | `12px`   | 内容卡片、信息面板                |
| `--radius-lg`  | `24px`   | 最外层主容器                      |

> **移动端**: 最外层容器降级为 `--radius-md`（`12px`）

### 3.2 Borders 边框

| 场景              | 规范                                              |
|-------------------|---------------------------------------------------|
| 默认卡片          | `1px solid var(--border-color)`                   |
| 悬停卡片          | `border-color: var(--border-active)`              |
| 激活/选中         | `border-color: var(--border-active)` + `box-shadow: 0 0 0 1px var(--border-active)` |
| 内部分割线        | `1px solid var(--border-color)`（实线）           |
| 数据行分隔        | `1px dashed var(--border-color)`（虚线）          |
| Header 底部       | `1px solid var(--border-color)`                   |

### 3.3 Shadows & Effects 阴影与效果

```css
/* 卡片浅层阴影 */
box-shadow: var(--shadow-sm);   /* 0 1px 2px rgba(0,0,0,0.05) */

/* 主容器深层阴影 */
box-shadow: var(--shadow-md);   /* 0 4px 12px rgba(0,0,0,0.08) */

/* Console 面板内凹阴影 */
box-shadow: inset 0 2px 8px rgba(0,0,0,0.02);  /* Light */
box-shadow: inset 0 2px 8px rgba(0,0,0,0.2);   /* Dark */
```

> **注意**: 本设计系统**不使用毛玻璃（backdrop-filter/blur）效果**。坚持纯粹的扁平阴影以保持极简美学。

### 3.4 Transitions 过渡动画

```css
--transition: 0.25s ease-in-out;
```

所有交互元素（背景色、边框色、颜色变化）统一使用此过渡时长。

### 3.5 状态指示器 Indicator Dots

```css
/* 默认态 */
width: 6px; height: 6px; border-radius: 50%;
background-color: var(--border-color);

/* 激活态 */
background-color: var(--accent-orange);   /* #ff4f00 */

/* 成功/达标态 */
background-color: var(--accent-green);    /* #00a651 */
```

---

## 4. Layout & Spacing 布局节奏

### 4.1 页面级

```css
body {
  padding: 24px;           /* 移动端: 12px */
}
```

### 4.2 主容器

```css
.app-container {
  max-width: 1000px;
  padding: 32px 40px;     /* 移动端: 16px */
  gap: 24px;               /* 移动端: 16px */
  border-radius: 24px;     /* 移动端: 12px */
}
```

### 4.3 网格布局

```css
/* 桌面端: 双栏 */
grid-template-columns: 1.2fr 0.8fr;
gap: 24px;

/* 移动端 (≤768px): 单栏 */
grid-template-columns: 1fr;
gap: 16px;
```

### 4.4 卡片内部

| 属性           | 桌面端    | 移动端    |
|----------------|-----------|-----------|
| 卡片 padding   | `24px`    | `16px`    |
| 区块间距       | `20-24px` | `16px`    |
| 标题底部间距   | `16px`    | `16px`    |

### 4.5 组件间距速查表

| 间距场景                    | 数值       |
|-----------------------------|------------|
| Header 底部 padding-bottom  | `20px`     |
| Header 内部控件 gap         | `12px`     |
| 主网格 gap                  | `24px`     |
| 右侧列内部 gap              | `24px`     |
| 琴弦网格 gap                | `10px`（移动端 `8px`）|
| 底部按钮组 gap              | `8px`（按钮之间）/ `12px`（组与CTA之间）|
| Console 面板 padding        | `20px`     |
| Console 行间距               | `12px`     |
| Info Row 底部 padding       | `8px`      |
| Guide 文本 margin-top       | `12px`     |

---

## 5. Component Patterns 组件模式

### 5.1 主操作按钮 (Primary CTA)

```css
background: var(--accent-orange);     /* #ff4f00 */
color: #fff;
font-family: var(--font-sans);
font-size: 14px;
font-weight: 600;
letter-spacing: 0.5px;
padding: 14px 24px;
border-radius: var(--radius-sm);      /* 6px */
text-transform: uppercase;
/* Hover: background: #e64700 */
```

### 5.2 次级按钮 (Secondary)

```css
background: var(--accent-dark);       /* #2d2d2d */
color: #fff;
font-family: var(--font-sans);
font-size: 13px;
font-weight: 500;
padding: 14px 20px;
border-radius: var(--radius-sm);
/* Active: background: var(--text-secondary) */
/* Hover: opacity: 0.85 */
```

### 5.3 选择卡片 (Selectable Card)

```css
padding: 14px;
min-height: 80px;
border-radius: var(--radius-sm);
background: var(--bg-surface);
border: 1px solid var(--border-color);
/* Hover: background: var(--bg-surface-hover); border-color: var(--border-active) */
/* Active: border-color: var(--border-active); box-shadow: 0 0 0 1px var(--border-active) */
```

### 5.4 下拉选择器 (Select Dropdown)

```css
background: var(--bg-surface-hover);
border: 1px solid var(--border-color);
font-family: var(--font-mono);
font-size: 11px;
padding: 7px 28px 7px 10px;
border-radius: var(--radius-sm);
max-width: 180px;
/* 右侧带 ▾ 伪元素箭头指示器 */
```

### 5.5 信息面板 (Info Panel / Console Card)

```css
background: var(--bg-surface-hover);
border: 1px solid var(--border-color);
border-radius: var(--radius-md);      /* 12px */
padding: 20px;
font-family: var(--font-mono);
font-size: 11px;
line-height: 1.6;
box-shadow: inset 0 2px 8px rgba(0,0,0,0.02);
/* 内部使用 1px dashed 虚线分隔数据行 */
```

### 5.6 切换开关 (Toggle Switch)

```css
width: 40px; height: 22px;
/* 滑块: 16x16px 圆形，白色，带 0 1px 3px 阴影 */
/* 未选中轨道: #d0d0d0 */
/* 选中轨道: #555 */
/* 滑块位移: translateX(18px) */
/* 圆角: 22px */
```

---

## 6. Responsive Breakpoints 响应式断点

| 断点         | 策略                                         |
|--------------|----------------------------------------------|
| `> 768px`    | 桌面端：双栏网格、横向按钮排列               |
| `≤ 768px`    | 移动端：单栏堆叠、Header 垂直排列、按钮纵向  |
| `≤ 380px`    | 超小屏：琴弦网格降为 2 列                     |

---

## 7. Dark Mode 切换规范

### CSS 层面

```css
/* 方式一：手动切换 —— 通过 JS 添加 class */
body.dark-theme { /* 覆盖所有 :root 变量 */ }

/* 方式二：系统自动检测 —— 仅在无手动覆盖时生效 */
@media (prefers-color-scheme: dark) {
  body:not(.light-theme) { /* 覆盖所有 :root 变量 */ }
}
```

### JS 层面

```javascript
// 初始化：读取 localStorage > 系统偏好
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  document.body.classList.add("dark-theme");
} else {
  document.body.classList.add("light-theme");
}

// 手动切换时同时写入 localStorage
localStorage.setItem("theme", "dark" | "light");
```

### Canvas 动态适配

Canvas 绘图内部需实时读取当前主题：
```javascript
const isDark = document.body.classList.contains("dark-theme");
const dimColor    = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
const highlightColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)";
```

---

## 8. 设计原则速查 Design Principles

1. **等宽字体优先** — 数据、标签、标题一律使用 `IBM Plex Mono`，仅正文和按钮使用 `Inter`
2. **零渐变、零毛玻璃** — 所有面板纯色填充，不使用 `backdrop-filter` 或 CSS 渐变
3. **极致克制的色彩** — 95% 灰度底色，仅在核心交互点使用 `#ff4f00` 橙和 `#00a651` 绿
4. **1px 边框即结构** — 用细边框代替阴影来划分层级，阴影仅作为辅助提升
5. **状态用颜色说话** — 激活态 = 橙色圆点，成功态 = 绿色圆点，默认态 = 灰色圆点
6. **对称的圆角体系** — 外容器 `24px`，内卡片 `12px`，小组件 `6px`，三级递减
