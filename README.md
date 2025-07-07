# Cookie & Storage 复制粘贴插件

这是一个强大的浏览器插件，可以方便地在不同网站之间复制和粘贴 Cookie 和 Storage 数据，特别适用于本地开发环境。

## 功能特点

- **智能复制**：一键复制当前网页的所有 Cookie
- **智能粘贴**：自动识别本地开发环境并智能粘贴 Cookie
- **强制粘贴**：提供强制粘贴模式，解决域名限制问题
- **Storage 支持**：支持复制粘贴 localStorage 和 sessionStorage
- **广泛支持**：支持多种本地开发环境域名模式
- **友好反馈**：详细的操作反馈和错误提示
- **直观展示**：以列表形式展示 Cookie 和 Storage 的键值对

## 支持的域名类型

### 自动识别的本地开发环境：

- `localhost`
- `127.0.0.1`
- `*.local`（如 `app.local`）
- `*.dev`（如 `api.dev`、`xxx.dev.com`）
- `*.test`（如 `app.test`）
- `*.dev.*`（如 `api.dev.example.com`）
- `*.local.*`（如 `app.local.com`）
- `*.test.*`（如 `api.test.org`）
- `192.168.*.*`（局域网地址）
- `10.*.*.*`（内网地址）
- `172.16.*.*` - `172.31.*.*`（内网地址）

## 使用方法

### Cookie 操作
1. **安装插件**：在浏览器中安装此插件(根目录直接导入到浏览器扩展插件即可)
2. **打开面板**：点击浏览器工具栏中的插件图标
3. **复制 Cookie**：在源网页点击"复制 Cookie"按钮
4. **粘贴 Cookie**：在目标网页点击"粘贴 Cookie"按钮
5. **强制粘贴**：如果普通粘贴失败，可以尝试"强制粘贴"按钮

### Storage 操作
1. **复制 Storage**：在源网页点击"复制 Storage"按钮，将复制当前域名的 localStorage 和 sessionStorage
2. **粘贴 Storage**：在目标网页点击"粘贴 Storage"按钮，将设置对应的 localStorage 和 sessionStorage

## 使用场景

- **本地开发**：在不同的本地开发环境间复制登录状态和用户数据
- **测试环境**：在测试环境和本地环境间同步 Cookie 和 Storage 数据
- **代理调试**：使用本地代理工具时保持登录状态和应用配置
- **多域名开发**：在多个子域名间共享 Cookie 和 Storage 数据
- **前端调试**：快速复制应用的完整状态数据，包括用户设置、缓存等

## 技术实现

### 核心功能

- 使用 Chrome Extensions API 进行 Cookie 操作
- 使用 Chrome Scripting API 进行 Storage 操作
- 智能域名匹配算法，支持正则表达式模式
- 异常处理和回退机制，确保最大兼容性
- 本地存储机制，保持 Cookie 和 Storage 数据持久化
- 脚本注入技术，安全访问页面的 localStorage 和 sessionStorage

### 图标设计

- **SVG矢量图标**：支持无损缩放和高清显示
- **设计理念**：结合Cookie饼干和复制符号，直观表达插件功能
- **色彩风格**：采用马克龙色系，柔和温暖的配色提升用户体验

### 主要文件

- `manifest.json`: 插件配置文件，定义权限和入口
- `popup.html`: 插件弹出窗口的界面结构
- `popup.js`: 插件的核心逻辑和交互处理
- `styles.css`: 界面样式定义

## 故障排除

如果遇到 Cookie 粘贴失败的问题：

1. **检查域名**：确认目标域名是否在支持列表中
2. **尝试强制粘贴**：使用"强制粘贴"按钮绕过域名限制
3. **检查控制台**：打开浏览器开发者工具查看详细错误信息
4. **检查权限**：确认插件已获得必要的权限


## 开发说明

本插件使用纯原生 JavaScript 开发，遵循 Chrome Extensions Manifest V3 规范。主要技术栈：

- **JavaScript ES6+**: 核心逻辑实现
- **Chrome Extensions API**: Cookie 操作和标签页管理
- **Chrome Scripting API**: Storage 数据操作
- **HTML5 + CSS3**: 用户界面
- **正则表达式**: 域名模式匹配
