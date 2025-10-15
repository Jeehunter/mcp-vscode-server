#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';

class VSCodeCommandsServer {
  private server: Server;
  private wsServer: WebSocketServer;
  private wsConnection: WebSocket | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'vscode-commands-server',
        version: '0.1.0',
        description: 'MCP server for executing VSCode commands and controlling the editor',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Create WebSocket server for communication with VSCode extension
    this.wsServer = new WebSocketServer({ port: 8765 });
    this.setupWebSocketServer();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      this.wsServer.close();
      process.exit(0);
    });
  }

  private setupWebSocketServer() {
    this.wsServer.on('connection', (ws) => {
      console.error('VSCode extension connected');
      this.wsConnection = ws;

      ws.on('message', (data) => {
        console.error('Received message from extension:', data.toString());
      });

      ws.on('close', () => {
        console.error('VSCode extension disconnected');
        this.wsConnection = null;
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    this.wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  /**
   * Send command to VSCode extension via WebSocket
   */
  private async sendCommandToExtension(command: string, args: any = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.wsConnection) {
        reject(new Error('VSCode extension is not connected. Please make sure the extension is installed and active.'));
        return;
      }

      const messageId = Date.now().toString();
      const message = {
        id: messageId,
        command,
        args
      };

      const timeout = setTimeout(() => {
        reject(new Error(`Command timeout: ${command}`));
      }, 10000);

      const messageHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === messageId) {
            clearTimeout(timeout);
            this.wsConnection!.off('message', messageHandler);
            
            if (response.success) {
              resolve(response.result || 'Command executed successfully');
            } else {
              reject(new Error(response.error || 'Unknown error occurred'));
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          this.wsConnection!.off('message', messageHandler);
          reject(error);
        }
      };

      this.wsConnection.on('message', messageHandler);
      this.wsConnection.send(JSON.stringify(message));
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Panel control tools
        {
          name: 'open_explorer',
          description: 'Open the Explorer panel in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'open_search',
          description: 'Open the Search panel in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'open_debug',
          description: 'Open the Debug panel in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'open_extensions',
          description: 'Open the Extensions panel in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'open_source_control',
          description: 'Open the Source Control panel in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'toggle_sidebar',
          description: 'Toggle the sidebar visibility in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              visible: {
                type: 'boolean',
                description: 'Whether to show or hide the sidebar',
              },
            },
            required: ['visible'],
          },
        },

        // File operations
        {
          name: 'open_file',
          description: 'Open a file in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file to open',
              },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'open_folder',
          description: 'Open a folder in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              folderPath: {
                type: 'string',
                description: 'Path to the folder to open',
              },
            },
            required: ['folderPath'],
          },
        },
        {
          name: 'new_file',
          description: 'Create and open a new file in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path for the new file',
              },
            },
            required: ['filePath'],
          },
        },

        // Editor operations
        {
          name: 'split_editor',
          description: 'Split the editor in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              direction: {
                type: 'string',
                description: 'Split direction: horizontal or vertical',
                enum: ['horizontal', 'vertical'],
              },
            },
            required: ['direction'],
          },
        },
        {
          name: 'close_editor',
          description: 'Close the active editor in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'close_all_editors',
          description: 'Close all editors in VSCode',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },

        // View operations
        {
          name: 'toggle_terminal',
          description: 'Toggle the terminal in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              visible: {
                type: 'boolean',
                description: 'Whether to show or hide the terminal',
              },
            },
            required: ['visible'],
          },
        },
        {
          name: 'toggle_panel',
          description: 'Toggle the panel (bottom area) in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              visible: {
                type: 'boolean',
                description: 'Whether to show or hide the panel',
              },
            },
            required: ['visible'],
          },
        },

        // Theme and settings
        {
          name: 'change_theme',
          description: 'Change the color theme in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                description: 'Theme name (e.g., "Default Dark+", "Default Light+", "Visual Studio Dark")',
              },
            },
            required: ['theme'],
          },
        },

        // Workspace operations
        {
          name: 'save_workspace',
          description: 'Save current workspace in VSCode',
          inputSchema: {
            type: 'object',
            properties: {
              workspacePath: {
                type: 'string',
                description: 'Path to save the workspace file',
              },
            },
            required: ['workspacePath'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args = {} } = request.params;
        let result: string;

        switch (name) {
          // Panel control tools
          case 'open_explorer':
            result = await this.sendCommandToExtension('vscode-commands.openExplorer');
            break;
          case 'open_search':
            result = await this.sendCommandToExtension('vscode-commands.openSearch');
            break;
          case 'open_debug':
            result = await this.sendCommandToExtension('vscode-commands.openDebug');
            break;
          case 'open_extensions':
            result = await this.sendCommandToExtension('vscode-commands.openExtensions');
            break;
          case 'open_source_control':
            result = await this.sendCommandToExtension('vscode-commands.openSourceControl');
            break;
          case 'toggle_sidebar':
            result = await this.sendCommandToExtension('vscode-commands.toggleSidebar', { visible: args.visible });
            break;

          // File operations
          case 'open_file':
            result = await this.sendCommandToExtension('vscode-commands.openFile', { filePath: args.filePath });
            break;
          case 'open_folder':
            result = await this.sendCommandToExtension('vscode-commands.openFolder', { folderPath: args.folderPath });
            break;
          case 'new_file':
            result = await this.sendCommandToExtension('vscode-commands.newFile', { filePath: args.filePath });
            break;

          // Editor operations
          case 'split_editor':
            result = await this.sendCommandToExtension('vscode-commands.splitEditor', { direction: args.direction });
            break;
          case 'close_editor':
            result = await this.sendCommandToExtension('vscode-commands.closeEditor');
            break;
          case 'close_all_editors':
            result = await this.sendCommandToExtension('vscode-commands.closeAllEditors');
            break;

          // View operations
          case 'toggle_terminal':
            result = await this.sendCommandToExtension('vscode-commands.toggleTerminal', { visible: args.visible });
            break;
          case 'toggle_panel':
            result = await this.sendCommandToExtension('vscode-commands.togglePanel', { visible: args.visible });
            break;

          // Theme and settings
          case 'change_theme':
            result = await this.sendCommandToExtension('vscode-commands.changeTheme', { theme: args.theme });
            break;

          // Workspace operations
          case 'save_workspace':
            result = await this.sendCommandToExtension('vscode-commands.saveWorkspace', { workspacePath: args.workspacePath });
            break;

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VSCode Commands MCP server running on stdio');
  }
}

const server = new VSCodeCommandsServer();
server.run().catch(console.error);
