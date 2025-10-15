// 测试MCP服务器基本功能
const { WebSocket } = require('ws');

async function testMCPConnection() {
    console.log('测试MCP服务器连接...');
    
    try {
        // 连接到MCP服务器
        const ws = new WebSocket('ws://localhost:8765');
        
        ws.on('open', () => {
            console.log('✓ 成功连接到MCP服务器');
            
            // 发送测试消息
            const testMessage = {
                id: 'test-123',
                command: 'vscode-commands.openExplorer',
                args: {}
            };
            
            ws.send(JSON.stringify(testMessage));
            console.log('✓ 测试消息已发送');
        });
        
        ws.on('message', (data) => {
            const response = JSON.parse(data.toString());
            console.log('收到响应:', response);
            
            if (response.id === 'test-123') {
                if (response.success) {
                    console.log('✓ MCP服务器响应正常');
                } else {
                    console.log('✗ MCP服务器返回错误:', response.error);
                }
                ws.close();
            }
        });
        
        ws.on('error', (error) => {
            console.log('✗ 连接错误:', error.message);
        });
        
        ws.on('close', () => {
            console.log('连接已关闭');
        });
        
    } catch (error) {
        console.log('✗ 测试失败:', error.message);
    }
}

testMCPConnection();
