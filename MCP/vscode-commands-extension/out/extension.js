"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const ws_1 = require("ws");
function activate(context) {
    console.log('VSCode Commands Extension for MCP is now active!');
    // Connect to MCP server via WebSocket
    const wsClient = new ws_1.WebSocket('ws://localhost:8765');
    let isConnected = false;
    wsClient.on('open', () => {
        console.log('Connected to MCP server');
        isConnected = true;
    });
    wsClient.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('Received message from MCP server:', message);
            // Handle command execution requests
            if (message.command && message.id) {
                try {
                    let result;
                    // Execute the corresponding VSCode command
                    switch (message.command) {
                        case 'vscode-commands.openExplorer':
                            result = await vscode.commands.executeCommand('workbench.view.explorer');
                            break;
                        case 'vscode-commands.openSearch':
                            result = await vscode.commands.executeCommand('workbench.view.search');
                            break;
                        case 'vscode-commands.openDebug':
                            result = await vscode.commands.executeCommand('workbench.view.debug');
                            break;
                        case 'vscode-commands.openExtensions':
                            result = await vscode.commands.executeCommand('workbench.view.extensions');
                            break;
                        case 'vscode-commands.openSourceControl':
                            result = await vscode.commands.executeCommand('workbench.view.scm');
                            break;
                        case 'vscode-commands.toggleSidebar':
                            result = await vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
                            break;
                        case 'vscode-commands.openFile':
                            const filePath = message.args?.filePath;
                            if (filePath) {
                                const uri = vscode.Uri.file(filePath);
                                const document = await vscode.workspace.openTextDocument(uri);
                                await vscode.window.showTextDocument(document);
                                result = `File opened: ${filePath}`;
                            }
                            break;
                        case 'vscode-commands.openFolder':
                            const folderPath = message.args?.folderPath;
                            if (folderPath) {
                                const uri = vscode.Uri.file(folderPath);
                                await vscode.commands.executeCommand('vscode.openFolder', uri);
                                result = `Folder opened: ${folderPath}`;
                            }
                            break;
                        case 'vscode-commands.newFile':
                            const newFilePath = message.args?.filePath;
                            if (newFilePath) {
                                const dir = path.dirname(newFilePath);
                                if (!fs.existsSync(dir)) {
                                    fs.mkdirSync(dir, { recursive: true });
                                }
                                fs.writeFileSync(newFilePath, '');
                                const uri = vscode.Uri.file(newFilePath);
                                const document = await vscode.workspace.openTextDocument(uri);
                                await vscode.window.showTextDocument(document);
                                result = `File created and opened: ${newFilePath}`;
                            }
                            break;
                        case 'vscode-commands.splitEditor':
                            const direction = message.args?.direction;
                            const splitCommand = direction === 'horizontal'
                                ? 'workbench.action.splitEditorDown'
                                : 'workbench.action.splitEditor';
                            result = await vscode.commands.executeCommand(splitCommand);
                            break;
                        case 'vscode-commands.closeEditor':
                            result = await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                            break;
                        case 'vscode-commands.closeAllEditors':
                            result = await vscode.commands.executeCommand('workbench.action.closeAllEditors');
                            break;
                        case 'vscode-commands.toggleTerminal':
                            const terminalVisible = message.args?.visible;
                            if (terminalVisible) {
                                result = await vscode.commands.executeCommand('workbench.action.terminal.focus');
                            }
                            else {
                                result = await vscode.commands.executeCommand('workbench.action.togglePanel');
                            }
                            break;
                        case 'vscode-commands.togglePanel':
                            result = await vscode.commands.executeCommand('workbench.action.togglePanel');
                            break;
                        case 'vscode-commands.changeTheme':
                            const theme = message.args?.theme;
                            if (theme) {
                                await vscode.commands.executeCommand('workbench.action.selectTheme', theme);
                                result = `Theme changed to: ${theme}`;
                            }
                            break;
                        case 'vscode-commands.saveWorkspace':
                            const workspacePath = message.args?.workspacePath;
                            if (workspacePath) {
                                await vscode.commands.executeCommand('workbench.action.saveWorkspaceAs', workspacePath);
                                result = `Workspace saved to: ${workspacePath}`;
                            }
                            break;
                        default:
                            throw new Error(`Unknown command: ${message.command}`);
                    }
                    // Send success response
                    wsClient.send(JSON.stringify({
                        id: message.id,
                        success: true,
                        result: result || 'Command executed successfully'
                    }));
                }
                catch (error) {
                    // Send error response
                    wsClient.send(JSON.stringify({
                        id: message.id,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    }));
                }
            }
        }
        catch (error) {
            console.error('Error processing message:', error);
        }
    });
    wsClient.on('close', () => {
        console.log('Disconnected from MCP server');
        isConnected = false;
    });
    wsClient.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    // Register all commands
    const commands = [
        // Panel control commands
        vscode.commands.registerCommand('vscode-commands.openExplorer', () => {
            return vscode.commands.executeCommand('workbench.view.explorer');
        }),
        vscode.commands.registerCommand('vscode-commands.openSearch', () => {
            return vscode.commands.executeCommand('workbench.view.search');
        }),
        vscode.commands.registerCommand('vscode-commands.openDebug', () => {
            return vscode.commands.executeCommand('workbench.view.debug');
        }),
        vscode.commands.registerCommand('vscode-commands.openExtensions', () => {
            return vscode.commands.executeCommand('workbench.view.extensions');
        }),
        vscode.commands.registerCommand('vscode-commands.openSourceControl', () => {
            return vscode.commands.executeCommand('workbench.view.scm');
        }),
        vscode.commands.registerCommand('vscode-commands.toggleSidebar', (visible) => {
            return vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
        }),
        // File operations
        vscode.commands.registerCommand('vscode-commands.openFile', async (filePath) => {
            try {
                const uri = vscode.Uri.file(filePath);
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document);
                return `File opened: ${filePath}`;
            }
            catch (error) {
                throw new Error(`Failed to open file: ${filePath}`);
            }
        }),
        vscode.commands.registerCommand('vscode-commands.openFolder', async (folderPath) => {
            try {
                const uri = vscode.Uri.file(folderPath);
                await vscode.commands.executeCommand('vscode.openFolder', uri);
                return `Folder opened: ${folderPath}`;
            }
            catch (error) {
                throw new Error(`Failed to open folder: ${folderPath}`);
            }
        }),
        vscode.commands.registerCommand('vscode-commands.newFile', async (filePath) => {
            try {
                // Create directory if it doesn't exist
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Create file
                fs.writeFileSync(filePath, '');
                // Open the file
                const uri = vscode.Uri.file(filePath);
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document);
                return `File created and opened: ${filePath}`;
            }
            catch (error) {
                throw new Error(`Failed to create file: ${filePath}`);
            }
        }),
        // Editor operations
        vscode.commands.registerCommand('vscode-commands.splitEditor', (direction) => {
            const command = direction === 'horizontal'
                ? 'workbench.action.splitEditorDown'
                : 'workbench.action.splitEditor';
            return vscode.commands.executeCommand(command);
        }),
        vscode.commands.registerCommand('vscode-commands.closeEditor', () => {
            return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        }),
        vscode.commands.registerCommand('vscode-commands.closeAllEditors', () => {
            return vscode.commands.executeCommand('workbench.action.closeAllEditors');
        }),
        // View operations
        vscode.commands.registerCommand('vscode-commands.toggleTerminal', (visible) => {
            if (visible) {
                return vscode.commands.executeCommand('workbench.action.terminal.focus');
            }
            else {
                return vscode.commands.executeCommand('workbench.action.togglePanel');
            }
        }),
        vscode.commands.registerCommand('vscode-commands.togglePanel', (visible) => {
            return vscode.commands.executeCommand('workbench.action.togglePanel');
        }),
        // Theme and settings
        vscode.commands.registerCommand('vscode-commands.changeTheme', async (theme) => {
            try {
                await vscode.commands.executeCommand('workbench.action.selectTheme', theme);
                return `Theme changed to: ${theme}`;
            }
            catch (error) {
                throw new Error(`Failed to change theme: ${theme}`);
            }
        }),
        // Workspace operations
        vscode.commands.registerCommand('vscode-commands.saveWorkspace', async (workspacePath) => {
            try {
                await vscode.commands.executeCommand('workbench.action.saveWorkspaceAs', workspacePath);
                return `Workspace saved to: ${workspacePath}`;
            }
            catch (error) {
                throw new Error(`Failed to save workspace: ${workspacePath}`);
            }
        })
    ];
    // Add all commands to context
    commands.forEach(command => {
        context.subscriptions.push(command);
    });
    // Create API provider for MCP server
    const apiProvider = new VSCodeCommandsApiProvider();
    context.subscriptions.push(apiProvider);
    // Register the API provider
    return {
        getApi: () => apiProvider
    };
}
exports.activate = activate;
class VSCodeCommandsApiProvider {
    constructor() {
        this._onDidExecuteCommand = new vscode.EventEmitter();
        this.onDidExecuteCommand = this._onDidExecuteCommand.event;
    }
    async executeCommand(command, ...args) {
        try {
            const result = await vscode.commands.executeCommand(command, ...args);
            this._onDidExecuteCommand.fire({ command, result });
            return result;
        }
        catch (error) {
            throw new Error(`Command execution failed: ${command} - ${error}`);
        }
    }
    dispose() {
        this._onDidExecuteCommand.dispose();
    }
}
function deactivate() {
    console.log('VSCode Commands Extension for MCP is now deactivated!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map