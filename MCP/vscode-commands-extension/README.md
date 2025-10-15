# VSCode Commands Extension for MCP

这是一个VSCode扩展，为MCP服务器提供VSCode命令API接口。通过WebSocket与MCP服务器通信，实现在当前VSCode窗口中执行各种操作。

## 安装说明

### 1. 安装扩展

将整个扩展文件夹复制到VSCode扩展目录，或者使用以下方法安装：

```bash
# 在扩展目录中
cd "C:\Users\70912\Documents\Cline\MCP\vscode-commands-extension"
npm install
npm run compile
```

### 2. 手动安装到VSCode

1. 打开VSCode
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Extensions: Install from VSIX"
4. 或者直接将扩展文件夹复制到VSCode扩展目录：
   - Windows: `%USERPROFILE%\.vscode\extensions\`
   - macOS: `~/.vscode/extensions/`
   - Linux: `~/.vscode/extensions/`

### 3. 配置MCP服务器

确保MCP服务器配置正确指向编译后的文件：

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

## 功能特性

- **面板控制**: 打开/切换各种VSCode面板
- **文件操作**: 打开文件、文件夹，创建新文件
- **编辑器操作**: 分割编辑器、关闭编辑器
- **视图控制**: 切换终端、面板显示
- **主题设置**: 切换颜色主题
- **工作区管理**: 保存工作区

## 工作原理

1. **MCP服务器** 启动WebSocket服务器（端口8765）
2. **VSCode扩展** 连接到MCP服务器的WebSocket
3. **Cline插件** 通过MCP协议调用工具
4. **MCP服务器** 通过WebSocket发送命令到扩展
5. **VSCode扩展** 在当前窗口执行VSCode命令
6. **结果** 通过WebSocket返回给MCP服务器

## 开发

### 构建项目
```bash
npm run compile
```

### 开发模式（监听文件变化）
```bash
npm run watch
```

## 故障排除

1. **扩展未连接**: 确保扩展已安装并启用
2. **WebSocket连接失败**: 检查端口8765是否被占用
3. **命令执行失败**: 检查VSCode版本兼容性

## 许可证

MIT License
