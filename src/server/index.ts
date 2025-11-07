#!/usr/bin/env bun

/**
 * SE2-Minikit MCP Server
 *
 * MCP server enabling rapid Web3 development on Base with Farcaster integration
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadConfig } from '../config/loader.js';
import { createLogger } from '../utils/logger.js';
import { createToolRegistry } from '../tools/registry.js';
import { createResourceRegistry } from '../resources/registry.js';
import { TemplateEngine } from '../engines/index.js';
import { createScaffoldProjectHandler } from '../tools/scaffold-project.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import type { Logger, ToolResult } from '../types/server.js';

// Get directory containing this file (works in both dev and built code)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From src/server/index.ts: go up 2 levels to project root
// From dist/index.js: go up 1 level to project root
const PROJECT_ROOT = __dirname.includes('/dist') ? join(__dirname, '..') : join(__dirname, '..', '..');

/**
 * Main MCP server class
 */
class SE2MinikitMCPServer {
  private server: Server;
  private logger: Logger;
  private toolRegistry;
  private resourceRegistry;
  private templateEngine: TemplateEngine;
  private config;

  constructor() {
    // Load configuration
    this.config = loadConfig();

    // Initialize logger
    this.logger = createLogger(this.config);
    this.logger.info('Initializing SE2-Minikit MCP Server', {
      version: this.config.version,
      environment: this.config.environment,
    });

    // Initialize registries
    this.toolRegistry = createToolRegistry(this.logger);
    this.resourceRegistry = createResourceRegistry(this.logger);

    // Initialize template engine with path relative to project root
    // This works correctly whether running from src/ or dist/
    this.templateEngine = new TemplateEngine(this.logger, {
      templatesDir: join(PROJECT_ROOT, 'templates'),
    });

    // Create MCP server instance
    this.server = new Server(
      {
        name: this.config.name,
        version: this.config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Register handlers
    this.registerHandlers();

    // Register built-in tools
    this.registerBuiltInTools();
  }

  /**
   * Register MCP protocol handlers
   */
  private registerHandlers(): void {
    // Tool handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.debug('Handling ListTools request');
      return {
        tools: this.toolRegistry.list(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      this.logger.debug(`Handling CallTool request: ${name}`, { args });

      try {
        const result = await this.toolRegistry.execute(name, args ?? {});
        const formatted = this.formatToolResult(result);
        return {
          content: formatted.content,
          isError: formatted.isError,
        };
      } catch (error) {
        this.logger.error(`Tool execution error: ${name}`, error);

        if (error instanceof MCPError) {
          throw error;
        }

        throw new MCPError(
          error instanceof Error ? error.message : String(error),
          ErrorCodes.INTERNAL_ERROR
        );
      }
    });

    // Resource handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      this.logger.debug('Handling ListResources request');
      return {
        resources: this.resourceRegistry.list(),
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      this.logger.debug(`Handling ReadResource request: ${uri}`);

      try {
        return await this.resourceRegistry.read(uri);
      } catch (error) {
        this.logger.error(`Resource read error: ${uri}`, error);

        if (error instanceof MCPError) {
          throw error;
        }

        throw new MCPError(
          error instanceof Error ? error.message : String(error),
          ErrorCodes.INTERNAL_ERROR
        );
      }
    });

    // Error handler
    this.server.onerror = (error) => {
      this.logger.error('Server error', error);
    };
  }

  /**
   * Register built-in tools
   */
  private registerBuiltInTools(): void {
    // Health check tool
    this.toolRegistry.register(
      {
        name: 'health_check',
        description: 'Check if the MCP server is running and operational',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      async () => {
        return {
          status: 'healthy',
          server: this.config.name,
          version: this.config.version,
          timestamp: new Date().toISOString(),
          tools: this.toolRegistry.size,
          resources: this.resourceRegistry.size,
        };
      }
    );

    // scaffold_project tool
    this.toolRegistry.register(
      {
        name: 'mcp__scaffold-minikit__scaffold_project',
        description:
          'Initialize a new Scaffold-ETH 2 project with optional Base Minikit integration for Farcaster Mini Apps',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: {
              type: 'string',
              description: 'Name of the project (kebab-case recommended)',
              pattern: '^[a-z0-9-]+$',
              minLength: 3,
              maxLength: 50,
            },
            projectPath: {
              type: 'string',
              description:
                'Path where project should be created (defaults to current directory)',
              default: '.',
            },
            includesMinikit: {
              type: 'boolean',
              description: 'Whether to include Base Minikit integration',
              default: false,
            },
            template: {
              type: 'string',
              enum: ['basic', 'nft', 'defi', 'dao', 'gaming', 'social'],
              description: 'Project template to use',
              default: 'basic',
            },
            contractFramework: {
              type: 'string',
              enum: ['hardhat', 'foundry'],
              description: 'Smart contract framework to use',
              default: 'hardhat',
            },
            targetNetwork: {
              type: 'string',
              enum: ['base', 'baseSepolia', 'localhost'],
              description: 'Target network for deployment',
              default: 'baseSepolia',
            },
          },
          required: ['projectName'],
        },
      },
      createScaffoldProjectHandler(this.logger, this.templateEngine)
    );

    this.logger.info('Built-in tools registered');
  }

  /**
   * Format tool execution result for MCP protocol
   */
  private formatToolResult(result: unknown): ToolResult {
    // If result is already in correct format
    if (
      typeof result === 'object' &&
      result !== null &&
      'content' in result &&
      Array.isArray((result as ToolResult).content)
    ) {
      return result as ToolResult;
    }

    // Convert to text content
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      this.logger.info('Server started successfully', {
        transport: 'stdio',
        tools: this.toolRegistry.size,
        resources: this.resourceRegistry.size,
      });
    } catch (error) {
      this.logger.fatal('Failed to start server', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down server');
    await this.server.close();
    this.logger.info('Server shut down complete');
  }
}

/**
 * Main entry point
 */
async function main() {
  const server = new SE2MinikitMCPServer();

  // Handle shutdown signals
  const shutdown = async (signal: string) => {
    console.error(`\nReceived ${signal}, shutting down gracefully...`);
    try {
      await server.shutdown();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Start server
  await server.start();
}

// Run main and handle errors
main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
