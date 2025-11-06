/**
 * Tool registry for MCP server
 * Manages registration, retrieval, and validation of tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ToolDefinition, ToolHandler, Logger } from '../types/server.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import { getLogger } from '../utils/logger.js';

/**
 * Tool registry class
 * Provides centralized management of tools and their handlers
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger?.child({ component: 'ToolRegistry' }) ?? getLogger().child({ component: 'ToolRegistry' });
  }

  /**
   * Register a new tool
   */
  register(definition: Tool, handler: ToolHandler): void {
    const { name } = definition;

    if (this.tools.has(name)) {
      throw new MCPError(
        `Tool '${name}' is already registered`,
        ErrorCodes.INVALID_REQUEST
      );
    }

    // Validate tool definition
    this.validateToolDefinition(definition);

    this.tools.set(name, { definition, handler });
    this.logger.info(`Tool registered: ${name}`);
  }

  /**
   * Register multiple tools at once
   */
  registerMany(tools: Array<{ definition: Tool; handler: ToolHandler }>): void {
    for (const tool of tools) {
      this.register(tool.definition, tool.handler);
    }
  }

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * List all registered tools
   */
  list(): Tool[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /**
   * Get the number of registered tools
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    const deleted = this.tools.delete(name);
    if (deleted) {
      this.logger.info(`Tool unregistered: ${name}`);
    }
    return deleted;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    const count = this.tools.size;
    this.tools.clear();
    this.logger.info(`Cleared ${count} tools from registry`);
  }

  /**
   * Validate a tool definition
   */
  private validateToolDefinition(definition: Tool): void {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new MCPError(
        'Tool definition must have a valid name',
        ErrorCodes.INVALID_PARAMS
      );
    }

    if (!definition.description || typeof definition.description !== 'string') {
      throw new MCPError(
        `Tool '${definition.name}' must have a description`,
        ErrorCodes.INVALID_PARAMS
      );
    }

    if (!definition.inputSchema || typeof definition.inputSchema !== 'object') {
      throw new MCPError(
        `Tool '${definition.name}' must have an inputSchema`,
        ErrorCodes.INVALID_PARAMS
      );
    }

    // Validate JSON schema structure
    const schema = definition.inputSchema as Record<string, unknown>;
    if (schema['type'] !== 'object') {
      throw new MCPError(
        `Tool '${definition.name}' inputSchema must be of type 'object'`,
        ErrorCodes.INVALID_PARAMS
      );
    }
  }

  /**
   * Execute a tool by name
   */
  async execute(name: string, args: unknown): Promise<unknown> {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new MCPError(
        `Tool not found: ${name}`,
        ErrorCodes.METHOD_NOT_FOUND
      );
    }

    try {
      this.logger.debug(`Executing tool: ${name}`, { args });
      const result = await tool.handler(args);
      this.logger.debug(`Tool execution completed: ${name}`);
      return result;
    } catch (error) {
      this.logger.error(`Tool execution failed: ${name}`, error);

      // Re-throw MCPErrors as-is
      if (error instanceof MCPError) {
        throw error;
      }

      // Wrap other errors
      throw new MCPError(
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.INTERNAL_ERROR,
        { originalError: error }
      );
    }
  }
}

/**
 * Create a new tool registry instance
 */
export function createToolRegistry(logger?: Logger): ToolRegistry {
  return new ToolRegistry(logger);
}
