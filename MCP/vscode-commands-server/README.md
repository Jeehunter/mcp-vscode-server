# VSCode Commands MCP Server

一个用于在Cline插件中执行VSCode命令的MCP服务器。通过这个服务器，您可以使用自然语言来控制VSCode的各种功能。

## 功能特性

### 面板控制
- `open_explorer` - 打开资源管理器面板
- `open_search` - 打开搜索面板
- `open_debug` - 打开调试面板
- `open_extensions` - 打开扩展面板
- `open_source_control` - 打开源代码管理面板
- `toggle_sidebar` - 切换侧边栏显示/隐藏

### 文件操作
- `open_file` - 打开指定文件
- `open_folder` - 打开指定文件夹
- `new_file` - 创建并打开新文件

### 编辑器操作
- `split_editor` - 分割编辑器（水平/垂直）
- `close_editor` - 关闭当前编辑器
- `close_all_editors` - 关闭所有编辑器

### 视图控制
- `toggle_terminal` - 切换终端显示/隐藏
- `toggle_panel` - 切换面板显示/隐藏

### 主题和设置
- `change_theme` - 切换颜色主题
- `save_workspace` - 保存工作区

## 安装和配置

### 1. 构建项目
```bash
npm install
npm run build
```

### 2. 配置MCP设置

在VSCode的Cline插件设置文件 `cline_mcp_settings.json` 中添加：

```json
{
  "mcpServers": {
    "vscode-commands": {
      "command": "node",
      "args": [
        "C:/Users/70912/Documents/Cline/MCP/vscode-commands-server/build/index.js"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 3. 重启Cline插件

重启VSCode或重新加载Cline插件以使配置生效。

## 使用方法

在Cline插件中，您现在可以使用以下类型的命令：

### 示例命令
- "打开资源管理器面板"
- "打开搜索功能"
- "切换到深色主题"
- "分割编辑器为水平视图"
- "打开当前目录"
- "创建新文件"

## 技术实现

这个MCP服务器使用VSCode的命令行接口（`code`命令）来执行各种操作。它通过子进程执行系统命令，并将结果返回给Cline插件。

### 依赖项
- `@modelcontextprotocol/sdk` - MCP协议SDK
- TypeScript - 开发语言
- Node.js - 运行时环境

## 开发

### 项目结构
```
vscode-commands-server/
├── src/
│   └── index.ts          # 主服务器实现
├── build/
│   └── index.js          # 编译后的JavaScript文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目文档
```

### 构建和测试
```bash
# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run watch

# 运行测试
node test-server.js
```

## 注意事项

- 确保VSCode命令行工具（`code`命令）在系统PATH中可用
- 某些命令可能需要VSCode实例已经运行
- 文件路径需要使用绝对路径或相对于当前工作目录的路径

## 许可证

MIT License
