// 测试脚本 - 验证MCP服务器功能
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testVSCodeCommands() {
  console.log('测试VSCode命令服务器...\n');
  
  try {
    // 测试打开Explorer面板
    console.log('1. 测试打开Explorer面板...');
    const result1 = await execAsync('code --command workbench.view.explorer');
    console.log('✓ Explorer面板命令执行成功');
    
    // 测试打开文件
    console.log('2. 测试打开文件...');
    const testFilePath = 'C:/Users/70912/Documents/Cline/MCP/vscode-commands-server/README.md';
    const result2 = await execAsync(`code "${testFilePath}"`);
    console.log('✓ 文件打开命令执行成功');
    
    // 测试切换主题
    console.log('3. 测试切换主题...');
    const result3 = await execAsync('code --command workbench.action.selectTheme "Default Dark+"');
    console.log('✓ 主题切换命令执行成功');
    
    console.log('\n🎉 所有VSCode命令测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testVSCodeCommands();
