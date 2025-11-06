/**
 * Resource registry for MCP server
 * Manages registration and serving of resources
 */

import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import type { ResourceDefinition, Logger } from '../types/server.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import { getLogger } from '../utils/logger.js';

/**
 * Resource registry class
 * Provides centralized management of resources and their providers
 */
export class ResourceRegistry {
  private resources: Map<string, ResourceDefinition> = new Map();
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger?.child({ component: 'ResourceRegistry' }) ?? getLogger().child({ component: 'ResourceRegistry' });
  }

  /**
   * Register a new resource
   */
  register(resource: ResourceDefinition): void {
    const { uri } = resource;

    if (this.resources.has(uri)) {
      throw new MCPError(
        `Resource with URI '${uri}' is already registered`,
        ErrorCodes.INVALID_REQUEST
      );
    }

    // Validate resource definition
    this.validateResourceDefinition(resource);

    this.resources.set(uri, resource);
    this.logger.info(`Resource registered: ${uri}`);
  }

  /**
   * Register multiple resources at once
   */
  registerMany(resources: ResourceDefinition[]): void {
    for (const resource of resources) {
      this.register(resource);
    }
  }

  /**
   * Get a resource by URI
   */
  get(uri: string): ResourceDefinition | undefined {
    return this.resources.get(uri);
  }

  /**
   * Check if a resource exists
   */
  has(uri: string): boolean {
    return this.resources.has(uri);
  }

  /**
   * List all registered resources
   */
  list(): Resource[] {
    return Array.from(this.resources.values()).map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    }));
  }

  /**
   * Get the number of registered resources
   */
  get size(): number {
    return this.resources.size;
  }

  /**
   * Unregister a resource
   */
  unregister(uri: string): boolean {
    const deleted = this.resources.delete(uri);
    if (deleted) {
      this.logger.info(`Resource unregistered: ${uri}`);
    }
    return deleted;
  }

  /**
   * Clear all registered resources
   */
  clear(): void {
    const count = this.resources.size;
    this.resources.clear();
    this.logger.info(`Cleared ${count} resources from registry`);
  }

  /**
   * Validate a resource definition
   */
  private validateResourceDefinition(resource: ResourceDefinition): void {
    if (!resource.uri || typeof resource.uri !== 'string') {
      throw new MCPError(
        'Resource must have a valid URI',
        ErrorCodes.INVALID_PARAMS
      );
    }

    if (!resource.name || typeof resource.name !== 'string') {
      throw new MCPError(
        `Resource '${resource.uri}' must have a name`,
        ErrorCodes.INVALID_PARAMS
      );
    }

    if (!resource.mimeType || typeof resource.mimeType !== 'string') {
      throw new MCPError(
        `Resource '${resource.uri}' must have a mimeType`,
        ErrorCodes.INVALID_PARAMS
      );
    }

    if (typeof resource.provider !== 'function') {
      throw new MCPError(
        `Resource '${resource.uri}' must have a provider function`,
        ErrorCodes.INVALID_PARAMS
      );
    }

    // Validate URI format
    try {
      new URL(resource.uri);
    } catch {
      throw new MCPError(
        `Resource URI '${resource.uri}' is not a valid URI`,
        ErrorCodes.INVALID_PARAMS
      );
    }
  }

  /**
   * Read a resource by URI
   */
  async read(uri: string): Promise<{ contents: Array<{ uri: string; mimeType: string; text?: string; blob?: string }> }> {
    const resource = this.resources.get(uri);

    if (!resource) {
      throw new MCPError(
        `Resource not found: ${uri}`,
        ErrorCodes.METHOD_NOT_FOUND
      );
    }

    try {
      this.logger.debug(`Reading resource: ${uri}`);
      const content = await resource.provider();
      this.logger.debug(`Resource read completed: ${uri}`);

      // Convert content to appropriate format
      const contentItem: { uri: string; mimeType: string; text?: string; blob?: string } = {
        uri: resource.uri,
        mimeType: resource.mimeType,
      };

      if (typeof content === 'string') {
        contentItem.text = content;
      } else {
        // Convert Uint8Array to base64 string
        contentItem.blob = Buffer.from(content).toString('base64');
      }

      return {
        contents: [contentItem],
      };
    } catch (error) {
      this.logger.error(`Resource read failed: ${uri}`, error);

      // Re-throw MCPErrors as-is
      if (error instanceof MCPError) {
        throw error;
      }

      // Wrap other errors
      throw new MCPError(
        `Resource read failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.INTERNAL_ERROR,
        { originalError: error }
      );
    }
  }
}

/**
 * Create a new resource registry instance
 */
export function createResourceRegistry(logger?: Logger): ResourceRegistry {
  return new ResourceRegistry(logger);
}
